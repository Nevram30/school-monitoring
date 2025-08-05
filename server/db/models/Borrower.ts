import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./database";

interface BorrowerAttributes {
  id: number;
  m_school_id: string;
  m_fname: string;
  m_lname: string;
  m_gender: string;
  m_contact: string;
  m_department: string;
  m_year_section: string;
  m_type: number;
  m_password: string;
  m_status: number;
}

interface BorrowerCreationAttributes
  extends Optional<BorrowerAttributes, "id"> {}

class Borrower
  extends Model<BorrowerAttributes, BorrowerCreationAttributes>
  implements BorrowerAttributes
{
  public id!: number;
  public m_school_id!: string;
  public m_fname!: string;
  public m_lname!: string;
  public m_gender!: string;
  public m_contact!: string;
  public m_department!: string;
  public m_year_section!: string;
  public m_type!: number;
  public m_password!: string;
  public m_status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Borrower.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    m_school_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    m_fname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    m_lname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    m_gender: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    m_contact: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    m_department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    m_year_section: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    m_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    m_password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    m_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "borrower",
    timestamps: false,
  }
);

export default Borrower;
