import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { Borrower } from "../../../../server/db/models";
import { sequelize } from "../../../../server/db/models/database";
import { Op } from "sequelize";
import { authOptions } from "@/lib/auth-config";
import {
  generateBorrowerIdByType,
  getBorrowerTypeFromString,
} from "../../../../server/db/utils/borrowerIdGenerator";

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { m_fname: { [Op.like]: `%${search}%` } },
          { m_lname: { [Op.like]: `%${search}%` } },
          { m_department: { [Op.like]: `%${search}%` } },
          { m_school_id: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await Borrower.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["id", "DESC"]],
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
    console.error("Get borrowers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let borrowerData: any = null;

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

    borrowerData = await request.json();

    // Convert borrower type string to integer
    const borrowerType = getBorrowerTypeFromString(borrowerData.m_type);

    // Generate custom ID based on borrower type
    const customSchoolId = await generateBorrowerIdByType(borrowerType);

    const borrowerToCreate = {
      m_school_id: customSchoolId, // Generate custom ID based on borrower type
      m_fname: borrowerData.m_fname,
      m_lname: borrowerData.m_lname,
      m_gender: "N/A", // Default value since frontend doesn't collect this (max 10 chars)
      m_contact: borrowerData.m_contact || "",
      m_department: borrowerData.m_address || "General", // Using address field as department for now
      m_year_section: "N/A", // Default value since frontend doesn't collect this
      m_type: borrowerType,
      m_password: "", // Default empty password
      m_status: 1,
    };

    const newBorrower = await Borrower.create(borrowerToCreate);

    return NextResponse.json({
      success: true,
      data: newBorrower,
      message: "Borrower created successfully",
    });
  } catch (error) {
    console.error("Create borrower error:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Borrower data received:", borrowerData);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create borrower: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
