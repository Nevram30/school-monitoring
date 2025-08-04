import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./database";

interface ItemAttributes {
  id: number;
  i_deviceID: string;
  i_model: string;
  i_category: string;
  i_brand: string;
  i_description: string;
  i_type: string;
  item_rawstock: number;
  i_status: number;
  i_mr: string;
  i_price: number;
  i_photo: string;
  no_of_items?: number;
  remarks?: string;
}

interface ItemCreationAttributes extends Optional<ItemAttributes, "id"> {}

class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: number;
  public i_deviceID!: string;
  public i_model!: string;
  public i_category!: string;
  public i_brand!: string;
  public i_description!: string;
  public i_type!: string;
  public item_rawstock!: number;
  public i_status!: number;
  public i_mr!: string;
  public i_price!: number;
  public i_photo!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    i_deviceID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    i_model: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    i_category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    i_brand: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    i_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    i_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    item_rawstock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    i_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    i_mr: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    i_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    i_photo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    no_of_items: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "item",
    timestamps: false,
  }
);

export default Item;
