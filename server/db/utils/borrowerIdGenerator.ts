import { Borrower } from "../models";
import { Op } from "sequelize";

export async function generateBorrowerIdByType(
  borrowerType: number
): Promise<string> {
  const currentYear = new Date().getFullYear();
  let prefix = "";

  // Determine prefix based on borrower type
  switch (borrowerType) {
    case 1: // Student
      prefix = "STU";
      break;
    case 2: // Faculty
      prefix = "FAC";
      break;
    case 3: // Staff
      prefix = "STA";
      break;
    default:
      prefix = "STU";
  }

  // Create the pattern for this year and type
  const pattern = `${prefix}-${currentYear}-%`;

  try {
    // Find all existing IDs with the same pattern
    const existingBorrowers = await Borrower.findAll({
      where: {
        m_school_id: {
          [Op.like]: pattern,
        },
        m_type: borrowerType,
      },
      attributes: ["m_school_id"],
      order: [["m_school_id", "DESC"]],
    });

    let nextNumber = 1;

    if (existingBorrowers.length > 0) {
      // Extract the highest number from existing IDs
      const numbers = existingBorrowers
        .map((borrower) => {
          const parts = borrower.m_school_id.split("-");
          return parts.length === 3 ? parseInt(parts[2]) : 0;
        })
        .filter((num) => !isNaN(num))
        .sort((a, b) => b - a);

      if (numbers.length > 0) {
        nextNumber = numbers[0] + 1;
      }
    }

    // Format the number with leading zeros (001, 002, etc.)
    const formattedNumber = nextNumber.toString().padStart(3, "0");

    return `${prefix}-${currentYear}-${formattedNumber}`;
  } catch (error) {
    console.error("Error generating borrower ID:", error);
    // Fallback: use timestamp if there's an error
    return `${prefix}-${currentYear}-${Date.now().toString().slice(-6)}`;
  }
}

export function getBorrowerTypeFromString(type: string): number {
  switch (type.toLowerCase()) {
    case "student":
      return 1;
    case "faculty":
      return 2;
    case "staff":
      return 3;
    default:
      return 1;
  }
}

export function getBorrowerTypeString(type: number): string {
  switch (type) {
    case 1:
      return "Student";
    case 2:
      return "Faculty";
    case 3:
      return "Staff";
    default:
      return "Student";
  }
}
