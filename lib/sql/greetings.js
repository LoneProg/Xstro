const { DataTypes } = require('sequelize');
const config = require('../../config');

const GroupMessages = config.DATABASE.define('GroupMessages', {
 groupJid: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: 'group_event_unique',
 },
 eventType: {
  type: DataTypes.ENUM('add', 'remove', 'promote', 'demote'),
  allowNull: false,
 },
 message: {
  type: DataTypes.TEXT,
  allowNull: true,
 },
 enabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
 },
});

const groupMessageDB = {
 async getMessage(groupJid, eventType) {
  return await GroupMessages.findOne({
   where: { groupJid, eventType },
  });
 },

 async setMessage(groupJid, eventType, message) {
  return await GroupMessages.upsert({
   groupJid,
   eventType,
   message,
  });
 },

 async toggleEvent(groupJid, eventType, enabled) {
  return await GroupMessages.upsert({
   groupJid,
   eventType,
   enabled,
  });
 },

 async deleteMessage(groupJid, eventType) {
  return await GroupMessages.destroy({
   where: { groupJid, eventType },
  });
 },
};

module.exports = {
 GroupMessages,
 groupMessageDB,
};
