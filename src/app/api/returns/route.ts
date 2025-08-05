import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Op } from "sequelize";

import {
  Return,
  Borrow,
  Item,
  Room,
  Borrower,
} from "../../../../server/db/models";
import { sequelize } from "../../../../server/db/models/database";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    let whereClause: any = {};

    if (search) {
      // Search in related models
      whereClause[Op.or] = [
        { "$Item.i_model$": { [Op.like]: `%${search}%` } },
        { "$Item.i_deviceID$": { [Op.like]: `%${search}%` } },
        { "$Member.m_fname$": { [Op.like]: `%${search}%` } },
        { "$Member.m_lname$": { [Op.like]: `%${search}%` } },
        { "$Room.r_name$": { [Op.like]: `%${search}%` } },
        { r_condition: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Return.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Borrow,
          as: "Borrow",
          attributes: ["b_date_borrowed", "b_due_date", "b_quantity"],
        },
        {
          model: Item,
          as: "Item",
          attributes: ["i_model", "i_deviceID", "i_brand"],
        },
        {
          model: Borrower,
          as: "Member",
          attributes: ["m_fname", "m_lname", "m_school_id"],
        },
        {
          model: Room,
          as: "Room",
          attributes: ["r_name"],
        },
      ],
      limit,
      offset,
      order: [["r_date_returned", "DESC"]],
    });

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get returns error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let returnData: any = null;

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

    returnData = await request.json();

    // Check if borrow record exists and is not already returned
    const borrow = await Borrow.findByPk(returnData.borrow_id);
    if (!borrow) {
      return NextResponse.json(
        { success: false, error: "Borrow record not found" },
        { status: 404 }
      );
    }

    if (borrow.b_date_returned) {
      return NextResponse.json(
        { success: false, error: "Item has already been returned" },
        { status: 400 }
      );
    }

    // Get values from the borrow record
    const borrowData = borrow.get({ plain: true });

    // Validate required fields from borrow record
    if (!borrowData.member_id || !borrowData.item_id) {
      console.error("Missing required fields in borrow record:", {
        member_id: borrowData.member_id,
        item_id: borrowData.item_id,
        borrow_id: returnData.borrow_id,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid borrow record: missing member_id or item_id",
          details: {
            member_id: borrowData.member_id,
            item_id: borrowData.item_id,
          },
        },
        { status: 400 }
      );
    }

    // Create return record
    const returnToCreate = {
      borrow_id: returnData.borrow_id,
      member_id: borrowData.member_id,
      item_id: borrowData.item_id,
      room_id: borrowData.room_id,
      r_quantity: returnData.r_quantity || borrowData.b_quantity,
      r_condition: returnData.r_condition || "Good",
      r_notes: returnData.r_notes || null,
      r_late_fee: returnData.r_late_fee || 0.0,
      r_damage_fee: returnData.r_damage_fee || 0.0,
    };

    const newReturn = await Return.create(returnToCreate);

    // Update borrow record to mark as returned
    await borrow.update({
      b_date_returned: new Date(),
      b_status: 2, // 2 = returned
    });

    // Return stock to item
    const item = await Item.findByPk(borrowData.item_id);
    if (item) {
      await item.update({
        item_rawstock:
          item.item_rawstock + (returnData.r_quantity || borrowData.b_quantity),
      });
    }

    return NextResponse.json({
      success: true,
      data: newReturn,
      message: "Item returned successfully",
    });
  } catch (error) {
    console.error("Create return error:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Return data received:", returnData);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process return: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
