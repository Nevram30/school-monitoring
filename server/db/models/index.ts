import User from "./User";
import Borrower from "./Borrower";
import Item from "./Item";
import Room from "./Room";
import Borrow from "./Borrow";

// Define associations
Borrow.belongsTo(Borrower, { foreignKey: "member_id", as: "Member" });
Borrow.belongsTo(Item, { foreignKey: "item_id", as: "Item" });
Borrow.belongsTo(Room, { foreignKey: "room_id", as: "Room" });

Borrower.hasMany(Borrow, { foreignKey: "member_id", as: "borrows" });
Item.hasMany(Borrow, { foreignKey: "item_id", as: "borrows" });
Room.hasMany(Borrow, { foreignKey: "room_id", as: "borrows" });

export { User, Borrower, Item, Room, Borrow };

export default {
  User,
  Borrower,
  Item,
  Room,
  Borrow,
};
