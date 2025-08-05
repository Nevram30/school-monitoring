import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { Room } from "../../../../../server/db/models";
import { sequelize } from "../../../../../server/db/models/database";
import { authOptions } from "@/lib/auth-config";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let roomData: any = null;

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

    const roomId = parseInt(params.id);
    if (isNaN(roomId)) {
      return NextResponse.json(
        { success: false, error: "Invalid room ID" },
        { status: 400 }
      );
    }

    roomData = await request.json();
    const { r_name, r_description } = roomData;

    // Find the room first
    const room = await Room.findByPk(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    // Update the room
    await room.update({
      r_name,
      r_description: r_description || null,
    });

    return NextResponse.json({
      success: true,
      data: room,
      message: "Room updated successfully",
    });
  } catch (error) {
    console.error("Error updating room:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Room data received:", roomData);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update room: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
