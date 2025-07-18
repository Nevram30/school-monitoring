import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/database';

interface UserAttributes {
  id: number;
  name: string;
  username: string;
  password: string;
  type: number; // 1=admin, 2=staff
  status: number; // 1=active, 2=inactive
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare username: string;
  declare password: string;
  declare type: number;
  declare status: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '1=admin, 2=staff',
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '1=active, 2=inactive',
    },
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: false,
  }
);

export default User;
