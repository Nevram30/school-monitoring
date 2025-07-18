import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

interface BorrowAttributes {
  id: number;
  member_id: number;
  item_id: number;
  room_id: number | null;
  b_date_borrowed: Date;
  b_date_returned: Date | null;
  b_due_date: Date;
  b_quantity: number;
  b_status: number;
  b_purpose: string | null;
  b_notes: string | null;
}

interface BorrowCreationAttributes extends Optional<BorrowAttributes, 'id' | 'b_date_borrowed' | 'b_date_returned' | 'b_purpose' | 'b_notes'> {}

class Borrow extends Model<BorrowAttributes, BorrowCreationAttributes> implements BorrowAttributes {
  public id!: number;
  public member_id!: number;
  public item_id!: number;
  public room_id!: number | null;
  public b_date_borrowed!: Date;
  public b_date_returned!: Date | null;
  public b_due_date!: Date;
  public b_quantity!: number;
  public b_status!: number;
  public b_purpose!: string | null;
  public b_notes!: string | null;
}

Borrow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    b_date_borrowed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    b_date_returned: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    b_due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    b_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    b_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    b_purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    b_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'borrow',
    timestamps: false,
  }
);

export default Borrow;
