import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { Borrow, Item, Borrower } from "../../../../../../server/db/models";
import { sequelize } from "../../../../../../server/db/models/database";
import { authOptions } from "@/lib/auth-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const roomId = parseInt(id);
    if (isNaN(roomId)) {
      return NextResponse.json(
        { success: false, error: "Invalid room ID" },
        { status: 400 }
      );
    }

    // Find all active borrows for this room (b_status = 1 means borrowed)
    const borrows = await Borrow.findAll({
      where: {
        room_id: roomId,
        b_status: 1, // Only active borrows
      },
      include: [
        {
          model: Item,
          as: "Item",
          attributes: [
            "id",
            "i_deviceID",
            "i_model",
            "i_category",
            "i_brand",
            "i_description",
            "i_type",
            "item_rawstock",
            "i_status",
            "i_mr",
            "i_price",
            "i_photo",
          ],
        },
        {
          model: Borrower,
          as: "Member",
          attributes: [
            "id",
            "m_school_id",
            "m_fname",
            "m_lname",
            "m_gender",
            "m_contact",
            "m_department",
            "m_year_section",
            "m_type",
          ],
        },
      ],
      order: [["b_date_borrowed", "DESC"]],
    });

    // Extract items from borrows and add borrow information
    const itemsWithBorrowInfo = borrows.map((borrow: any) => {
      const borrowData = borrow.toJSON();
      return {
        ...borrowData.Item,
        borrow_id: borrowData.id,
        borrow_quantity: borrowData.b_quantity,
        date_borrowed: borrowData.b_date_borrowed,
        due_date: borrowData.b_due_date,
        room_id: borrowData.room_id,
        borrow_purpose: borrowData.b_purpose,
        borrow_notes: borrowData.b_notes,
        borrow_status: borrowData.b_status,
        borrower: borrowData.Member,
      };
    });

    return NextResponse.json({
      success: true,
      data: itemsWithBorrowInfo,
      message: `Found ${itemsWithBorrowInfo.length} items currently borrowed to this room`,
    });
  } catch (error) {
    console.error("Error fetching room items:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch room items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
