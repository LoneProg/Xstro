const { groupMessageDB } = require('./sql/greetings');

class GroupEventHandler {
 constructor(conn) {
  this.conn = conn;
 }

 async handleGroupUpdate(update) {
  const { id, participants, action } = update;

  switch (action) {
   case 'add':
    await this.handleMemberAdd(id, participants);
    break;
   case 'remove':
    await this.handleMemberRemove(id, participants);
    break;
   case 'promote':
    await this.handleMemberPromote(id, participants);
    break;
   case 'demote':
    await this.handleMemberDemote(id, participants);
    break;
  }
 }

 async formatMessage(template, groupId, participants) {
  let message = template;
  const groupMetadata = await this.conn.groupMetadata(groupId);
  message = message.replace('@user', participants.map((p) => `@${p.split('@')[0]}`).join(', '));
  message = message.replace('@gname', groupMetadata.subject);
  message = message.replace('@members', groupMetadata.participants.length.toString());
  message = message.replace('@gdesc', groupMetadata.desc || '');

  const creationDate = new Date(groupMetadata.creation * 1000).toLocaleString();
  message = message.replace('@created', creationDate);

  const owner = groupMetadata.owner ? `@${groupMetadata.owner.split('@')[0]}` : 'No owner';
  message = message.replace('@owner', owner);

  const admins = groupMetadata.participants
   .filter((p) => p.admin)
   .map((p) => `@${p.id.split('@')[0]}`)
   .join(', ');
  message = message.replace('@admins', admins);

  return {
   text: message,
   mentions: [...participants, ...groupMetadata.participants.filter((p) => p.admin).map((p) => p.id), groupMetadata.owner],
  };
 }

 async handleMemberAdd(groupId, participants) {
  const eventConfig = await groupMessageDB.getMessage(groupId, 'add');
  if (!eventConfig?.enabled) return;

  const message = await this.formatMessage(eventConfig?.message || 'Welcome @user to @gname!', groupId, participants);

  await this.conn.sendMessage(groupId, {
   text: message.text,
   mentions: message.mentions,
  });
 }

 async handleMemberRemove(groupId, participants) {
  const eventConfig = await groupMessageDB.getMessage(groupId, 'remove');
  if (!eventConfig?.enabled) return;

  const message = await this.formatMessage(eventConfig?.message || 'Goodbye @user!', groupId, participants);

  await this.conn.sendMessage(groupId, {
   text: message.text,
   mentions: message.mentions,
  });
 }

 async handleMemberPromote(groupId, participants) {
  const message = await this.formatMessage('Congratulations @user on becoming admin!', groupId, participants);
  await this.conn.sendMessage(groupId, {
   text: message.text,
   mentions: message.mentions,
  });
 }

 async handleMemberDemote(groupId, participants) {
  const message = await this.formatMessage('@user has been demoted', groupId, participants);
  await this.conn.sendMessage(groupId, {
   text: message.text,
   mentions: message.mentions,
  });
 }
}

module.exports = GroupEventHandler;
