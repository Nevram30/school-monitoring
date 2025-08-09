import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import {
  Borrow,
  Item,
  Borrower,
  Room,
} from "../../../../server/db/models/index";

import { Op } from "sequelize";
import { sequelize } from "../../../../server/db/models/database";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    // Verify authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("type") || "summary";

    let whereClause: any = {};

    if (startDate && endDate) {
      whereClause.b_date_borrowed = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    switch (reportType) {
      case "summary":
        // Get summary statistics
        const totalBorrows = await Borrow.count({ where: whereClause });
        const activeBorrows = await Borrow.count({
          where: { ...whereClause, b_status: 1 },
        });
        const returnedBorrows = await Borrow.count({
          where: { ...whereClause, b_status: 2 },
        });
        const overdueBorrows = await Borrow.count({
          where: {
            ...whereClause,
            b_status: 1,
            b_due_date: { [Op.lt]: new Date() },
          },
        });

        // Get most borrowed items
        const mostBorrowedItems = await Borrow.findAll({
          where: whereClause,
          include: [
            {
              model: Item,
              as: "Item",
              attributes: ["i_model", "i_deviceID"],
            },
          ],
          attributes: [
            "item_id",
            [sequelize.fn("COUNT", sequelize.col("Borrow.id")), "borrow_count"],
          ],
          group: ["item_id", "Item.id"],
          order: [[sequelize.fn("COUNT", sequelize.col("Borrow.id")), "DESC"]],
          limit: 10,
        });

        // Get most active borrowers
        const mostActiveBorrowers = await Borrow.findAll({
          where: whereClause,
          include: [
            {
              model: Borrower,
              as: "Member",
              attributes: ["m_fname", "m_lname"],
            },
          ],
          attributes: [
            "member_id",
            [sequelize.fn("COUNT", sequelize.col("Borrow.id")), "borrow_count"],
          ],
          group: ["member_id", "Member.id"],
          order: [[sequelize.fn("COUNT", sequelize.col("Borrow.id")), "DESC"]],
          limit: 10,
        });

        // Get total counts for items, members, rooms
        const totalItems = await Item.count();
        const totalMembers = await Borrower.count();
        const totalRooms = await Room.count();

        // Transform mostBorrowedItems to match frontend expectations
        const popularItems = mostBorrowedItems.map((item: any) => ({
          id: item.item_id,
          i_model: item.Item?.i_model || "Unknown",
          i_deviceID: item.Item?.i_deviceID || "Unknown",
          borrowCount: parseInt(item.getDataValue("borrow_count")),
        }));

        // Create comprehensive recent activity from multiple sources
        const activities: any[] = [];

        // Get recent borrows (last 30 days)
        const recentBorrows = await Borrow.findAll({
          where: {
            b_date_borrowed: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          include: [
            {
              model: Item,
              as: "Item",
              attributes: ["i_model", "i_deviceID"],
              required: false,
            },
            {
              model: Borrower,
              as: "Member",
              attributes: ["m_fname", "m_lname"],
              required: false,
            },
          ],
          order: [["b_date_borrowed", "DESC"]],
          limit: 15,
        });

        // Add borrow activities
        recentBorrows.forEach((borrow: any) => {
          const memberName = `${borrow.Member?.m_fname || "Unknown"} ${
            borrow.Member?.m_lname || "Member"
          }`;
          const itemName = borrow.Item?.i_model || "Unknown Item";
          const deviceId = borrow.Item?.i_deviceID || "N/A";

          activities.push({
            id: `borrow-${borrow.id}`,
            type: "borrow",
            description: `${memberName} borrowed ${itemName} (${deviceId})`,
            date: borrow.b_date_borrowed,
          });
        });

        // Get recent returns (last 30 days) - only get records with actual return dates
        const recentReturns = await Borrow.findAll({
          where: {
            b_status: 2, // Returned status
            b_date_returned: {
              [Op.ne]: null, // Not null
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          include: [
            {
              model: Item,
              as: "Item",
              attributes: ["i_model", "i_deviceID"],
            },
            {
              model: Borrower,
              as: "Member",
              attributes: ["m_fname", "m_lname"],
            },
          ],
          order: [["b_date_returned", "DESC"]],
          limit: 15,
        });

        // Add return activities
        recentReturns.forEach((borrow: any) => {
          const memberName = `${borrow.Member?.m_fname || "Unknown"} ${
            borrow.Member?.m_lname || "Member"
          }`;
          const itemName = borrow.Item?.i_model || "Unknown Item";
          const deviceId = borrow.Item?.i_deviceID || "N/A";

          activities.push({
            id: `return-${borrow.id}`,
            type: "return",
            description: `${memberName} returned ${itemName} (${deviceId})`,
            date: borrow.b_date_returned,
          });
        });

        // Get overdue items for activity feed
        const overdueForActivity = await Borrow.findAll({
          where: {
            b_status: 1, // Still borrowed
            b_due_date: { [Op.lt]: new Date() },
          },
          include: [
            {
              model: Item,
              as: "Item",
              attributes: ["i_model", "i_deviceID"],
            },
            {
              model: Borrower,
              as: "Member",
              attributes: ["m_fname", "m_lname"],
            },
          ],
          order: [["b_due_date", "ASC"]],
          limit: 5,
        });

        // Add overdue activities
        overdueForActivity.forEach((borrow: any) => {
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(borrow.b_due_date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const memberName = `${borrow.Member?.m_fname || "Unknown"} ${
            borrow.Member?.m_lname || "Member"
          }`;
          const itemName = borrow.Item?.i_model || "Unknown Item";
          const deviceId = borrow.Item?.i_deviceID || "N/A";

          activities.push({
            id: `overdue-${borrow.id}`,
            type: "overdue",
            description: `${itemName} (${deviceId}) is ${daysOverdue} day${
              daysOverdue > 1 ? "s" : ""
            } overdue - borrowed by ${memberName}`,
            date: borrow.b_due_date,
          });
        });

        // Sort all activities by date (most recent first) and limit to 15
        const recentActivity = activities
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 15);

        return NextResponse.json({
          success: true,
          data: {
            totalItems,
            totalMembers,
            totalRooms,
            activeBorrows,
            overdueBorrows,
            returnedThisMonth: returnedBorrows,
            popularItems,
            recentActivity,
          },
        });

      case "detailed":
        // Get detailed borrow records
        const detailedBorrows = await Borrow.findAll({
          where: whereClause,
          include: [
            {
              model: Item,
              as: "Item",
              attributes: ["i_model", "i_deviceID"],
            },
            {
              model: Borrower,
              as: "Member",
              attributes: ["m_fname", "m_lname"],
            },
            {
              model: Room,
              as: "Room",
              attributes: ["r_name"],
            },
          ],
          order: [["b_date_borrowed", "DESC"]],
        });

        return NextResponse.json({
          success: true,
          data: detailedBorrows,
        });

      case "overdue":
        // Get overdue items
        const overdueItems = await Borrow.findAll({
          where: {
            ...whereClause,
            b_status: 1, // Still borrowed
            b_due_date: { [Op.lt]: new Date() },
          },
          include: [
            {
              model: Item,
              as: "Item",
              attributes: ["i_model", "i_deviceID"],
            },
            {
              model: Borrower,
              as: "Member",
              attributes: ["m_fname", "m_lname", "m_contact"],
            },
            {
              model: Room,
              as: "Room",
              attributes: ["r_name"],
            },
          ],
          order: [["b_due_date", "ASC"]],
        });

        return NextResponse.json({
          success: true,
          data: overdueItems,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid report type",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
