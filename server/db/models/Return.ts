import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./database";

interface ReturnAttributes {
  id: number;
  borrow_id: number;
  member_id: number;
  item_id: number;
  room_id: number | null;
  r_date_returned: Date;
  r_quantity: number;
  r_condition: string | null;
  r_notes: string | null;
  r_late_fee: number;
  r_damage_fee: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ReturnCreationAttributes
  extends Optional<
    ReturnAttributes,
    | "id"
    | "r_date_returned"
    | "r_condition"
    | "r_notes"
    | "r_late_fee"
    | "r_damage_fee"
    | "createdAt"
    | "updatedAt"
  > {}

class Return
  extends Model<ReturnAttributes, ReturnCreationAttributes>
  implements ReturnAttributes
{
  public id!: number;
  public borrow_id!: number;
  public member_id!: number;
  public item_id!: number;
  public room_id!: number | null;
  public r_date_returned!: Date;
  public r_quantity!: number;
  public r_condition!: string | null;
  public r_notes!: string | null;
  public r_late_fee!: number;
  public r_damage_fee!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Return.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    borrow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    r_date_returned: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    r_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    r_condition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    r_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    r_late_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    r_damage_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "returns",
    timestamps: true,
    underscored: true,
  }
);

export default Return;
