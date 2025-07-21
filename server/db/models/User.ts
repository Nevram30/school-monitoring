import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './database';

interface UserAttributes {
  id: number;
  name: string;
  username: string;
  password: string;
  role: 'staff' | 'faculty' | 'admin';
  status: number; // 1=active, 2=inactive
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare username: string;
  declare password: string;
  declare role: 'staff' | 'faculty' | 'admin';
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
    role: {
      type: DataTypes.ENUM('admin', 'faculty', 'staff'),
      allowNull: false,
      defaultValue: 'admin',
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
