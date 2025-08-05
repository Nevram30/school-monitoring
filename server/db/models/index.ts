import User from "./User";
import Borrower from "./Borrower";
import Item from "./Item";
import Room from "./Room";
import Borrow from "./Borrow";
import Return from "./Return";

// Define associations
Borrow.belongsTo(Borrower, { foreignKey: "member_id", as: "Member" });
Borrow.belongsTo(Item, { foreignKey: "item_id", as: "Item" });
Borrow.belongsTo(Room, { foreignKey: "room_id", as: "Room" });

Borrower.hasMany(Borrow, { foreignKey: "member_id", as: "borrows" });
Item.hasMany(Borrow, { foreignKey: "item_id", as: "borrows" });
Room.hasMany(Borrow, { foreignKey: "room_id", as: "borrows" });

// Return associations
Return.belongsTo(Borrow, { foreignKey: "borrow_id", as: "Borrow" });
Return.belongsTo(Borrower, { foreignKey: "member_id", as: "Member" });
Return.belongsTo(Item, { foreignKey: "item_id", as: "Item" });
Return.belongsTo(Room, { foreignKey: "room_id", as: "Room" });

Borrow.hasOne(Return, { foreignKey: "borrow_id", as: "return" });
Borrower.hasMany(Return, { foreignKey: "member_id", as: "returns" });
Item.hasMany(Return, { foreignKey: "item_id", as: "returns" });
Room.hasMany(Return, { foreignKey: "room_id", as: "returns" });

export { User, Borrower, Item, Room, Borrow, Return };

export default {
  User,
  Borrower,
  Item,
  Room,
  Borrow,
  Return,
};
