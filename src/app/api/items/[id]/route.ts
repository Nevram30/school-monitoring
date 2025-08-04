import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { Item } from "../../../../../server/db/models";
import { sequelize } from "../../../../../server/db/models/database";
import { authOptions } from "@/lib/auth-config";

export async function PATCH(
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

    const { id: itemId } = await params;
    const updateData = await request.json();

    // Find the item first to ensure it exists
    const existingItem = await Item.findByPk(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Update the item
    const [updatedRowsCount] = await Item.update(updateData, {
      where: { id: itemId },
    });

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update item" },
        { status: 500 }
      );
    }

    // Fetch the updated item
    const updatedItem = await Item.findByPk(itemId);

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully",
    });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await sequelize.authenticate();

    const { id: itemId } = await params;
    const item = await Item.findByPk(itemId);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Get item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id: itemId } = await params;

    // Find the item first to ensure it exists
    const existingItem = await Item.findByPk(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Delete the item
    await Item.destroy({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
