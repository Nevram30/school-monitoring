import User from './User';
import Member from './Member';
import Item from './Item';
import Room from './Room';
import Borrow from './Borrow';

// Define associations
Borrow.belongsTo(Member, { foreignKey: 'member_id', as: 'Member' });
Borrow.belongsTo(Item, { foreignKey: 'item_id', as: 'Item' });
Borrow.belongsTo(Room, { foreignKey: 'room_id', as: 'Room' });

Member.hasMany(Borrow, { foreignKey: 'member_id', as: 'borrows' });
Item.hasMany(Borrow, { foreignKey: 'item_id', as: 'borrows' });
Room.hasMany(Borrow, { foreignKey: 'room_id', as: 'borrows' });

export {
  User,
  Member,
  Item,
  Room,
  Borrow
};

export default {
  User,
  Member,
  Item,
  Room,
  Borrow
};
