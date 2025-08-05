import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { Borrower } from "../../../../../server/db/models";
import { sequelize } from "../../../../../server/db/models/database";
import { authOptions } from "@/lib/auth-config";
import { getBorrowerTypeFromString } from "../../../../../server/db/utils/borrowerIdGenerator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await sequelize.authenticate();

    const { id } = await params;
    const borrowerId = parseInt(id);
    if (isNaN(borrowerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    const borrower = await Borrower.findByPk(borrowerId);

    if (!borrower) {
      return NextResponse.json(
        { success: false, error: "Borrower not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: borrower,
    });
  } catch (error) {
    console.error("Get borrower error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const borrowerId = parseInt(id);
    if (isNaN(borrowerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    const borrowerData = await request.json();

    // Find the borrower first
    const borrower = await Borrower.findByPk(borrowerId);
    if (!borrower) {
      return NextResponse.json(
        { success: false, error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Convert borrower type string to integer
    const borrowerType = getBorrowerTypeFromString(borrowerData.m_type);

    const updateData = {
      m_fname: borrowerData.m_fname,
      m_lname: borrowerData.m_lname,
      m_contact: borrowerData.m_contact || "",
      m_department: borrowerData.m_address || "General", // Using address field as department
      m_type: borrowerType,
    };

    await borrower.update(updateData);

    return NextResponse.json({
      success: true,
      data: borrower,
      message: "Borrower updated successfully",
    });
  } catch (error) {
    console.error("Update borrower error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update borrower: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;
    const borrowerId = parseInt(id);
    if (isNaN(borrowerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Find the borrower first
    const borrower = await Borrower.findByPk(borrowerId);
    if (!borrower) {
      return NextResponse.json(
        { success: false, error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Update only the provided fields
    await borrower.update(updateData);

    return NextResponse.json({
      success: true,
      data: borrower,
      message: "Borrower status updated successfully",
    });
  } catch (error) {
    console.error("Update borrower status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update borrower status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
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

    const { id } = await params;
    const borrowerId = parseInt(id);
    if (isNaN(borrowerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    // Find the borrower first
    const borrower = await Borrower.findByPk(borrowerId);
    if (!borrower) {
      return NextResponse.json(
        { success: false, error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive instead of actually deleting
    await borrower.update({ m_status: 0 });

    return NextResponse.json({
      success: true,
      message: "Borrower deleted successfully",
    });
  } catch (error) {
    console.error("Delete borrower error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete borrower: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
