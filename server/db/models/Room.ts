import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./database";

interface RoomAttributes {
  id: number;
  r_name: string;
  r_description?: string;
  r_status: number;
}

interface RoomCreationAttributes extends Optional<RoomAttributes, "id"> {}

class Room
  extends Model<RoomAttributes, RoomCreationAttributes>
  implements RoomAttributes
{
  public id!: number;
  public r_name!: string;
  public r_description?: string;
  public r_status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    r_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    r_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    r_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "room",
    timestamps: true,
  }
);

export default Room;
