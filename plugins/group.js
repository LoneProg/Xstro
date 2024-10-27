const { handler, parsedJid, groupMessageDB } = require('../lib');

function extractInviteCode(text) {
 const match = text.match(/https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
 return match ? match[1] : null;
}

handler(
 {
  pattern: 'join',
  desc: 'Joins Group From Invite',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  match = match || message.reply_message?.text;
  if (!match) return await message.reply('_Enter a valid group link!_');
  const inviteCode = extractInviteCode(match);
  if (!inviteCode) return await message.reply('_Enter a valid group link!_');
  try {
   const joinResult = await client.groupAcceptInvite(inviteCode);
   if (joinResult) return await message.reply('_Joined!_');
   await message.reply('_Invalid Group Link!_');
  } catch {
   await message.reply('_Failed to join group!_');
  }
 }
);

handler(
 {
  pattern: 'add',
  desc: 'Add a person to group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!message.owner) return message.reply(owner);
  if (!m.isAdmin) return message.reply(admin);
  match = match || message.reply_message?.sender;
  if (!match) return await message.reply('_Mention a user to add_');
  const jid = parsedJid(match);
  await client.groupParticipantsUpdate(message.jid, jid, 'add');
  return await message.reply(`_@${jid[0].split('@')[0]} added_`, { mentions: [jid] });
 }
);

handler(
 {
  pattern: 'kick',
  desc: 'Kick a person from group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!message.owner) return message.reply(owner);
  if (!m.isAdmin) return message.reply(admin);
  match = match || message.reply_message?.sender;
  if (!match) return await message.reply('_Mention a user to kick_');
  const jid = parsedJid(match);
  await client.groupParticipantsUpdate(message.jid, jid, 'remove');
  return await message.reply(`_@${jid[0].split('@')[0]} kicked_`, { mentions: [jid] });
 }
);

handler(
 {
  pattern: 'promote',
  desc: 'Promote to admin',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  match = match || message.reply_message.sender;
  if (!match) return await message.reply('_Mention a user to promote_');
  const jid = parsedJid(match);
  await client.groupParticipantsUpdate(message.jid, jid, 'promote');
  return await message.reply(`_@${jid[0].split('@')[0]} promoted to admin_`, { mentions: [jid] });
 }
);

handler(
 {
  pattern: 'demote',
  desc: 'Demote from admin',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  match = match || message.reply_message.sender;
  if (!match) return await message.reply('_Mention a user to demote_');
  const jid = parsedJid(match);
  await client.groupParticipantsUpdate(message.jid, jid, 'demote');
  return await message.reply(`_@${jid[0].split('@')[0]} demoted from admin_`, { mentions: [jid] });
 }
);

handler(
 {
  pattern: 'mute',
  desc: 'Mute group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  await message.reply('_Muting the group_');
  return await client.groupSettingUpdate(message.jid, 'announcement');
 }
);

handler(
 {
  pattern: 'unmute',
  desc: 'Unmute group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  await message.reply('_Unmuting the group_');
  return await client.groupSettingUpdate(message.jid, 'not_announcement');
 }
);

handler(
 {
  pattern: 'gjid',
  desc: 'Get JIDs of all group members',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  const { participants } = await message.client.groupMetadata(message.jid);
  const participantJids = participants.map((u) => u.id);
  let result = '╭──〔 *Group JIDs* 〕\n';
  participantJids.forEach((jid) => {
   result += `├ *${jid}*\n`;
  });
  result += `╰──────────────`;
  return await message.reply(result);
 }
);

handler(
 {
  pattern: 'tagall',
  desc: 'Mention all users in group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  const { participants } = await message.client.groupMetadata(message.jid);
  let mentionsText = '';
  participants.forEach((mem) => {
   mentionsText += ` @${mem.id.split('@')[0]}\n`;
  });
  return await message.reply(mentionsText.trim(), { mentions: participants.map((p) => p.id) });
 }
);

handler(
 {
  pattern: 'tag',
  desc: 'Tag users with custom message',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  let taggedMsg = match || message.reply_message?.text || '';
  if (!taggedMsg) return await message.reply('_Reply A Message Or Give Me Text_');
  const { participants } = await client.groupMetadata(message.jid);
  return await message.reply(taggedMsg, { mentions: participants.map((p) => p.id) });
 }
);

handler(
 {
  pattern: 'gname',
  desc: 'Change group name',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  if (!match) return await message.reply('_Provide a name to change the group name_');
  await client.groupUpdateSubject(message.jid, match);
  return await message.reply(`_Group name changed to: ${match}_`);
 }
);

handler(
 {
  pattern: 'gdesc',
  desc: 'Change group description',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  if (!match) return await message.reply('_Provide a description to change the group description_');
  await client.groupUpdateDescription(message.jid, match);
  return await message.reply('_Group description updated_');
 }
);

handler(
 {
  pattern: 'acceptall',
  desc: 'Accept all pending join requests',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!message.owner) return message.reply(owner);
  if (!m.isAdmin) return message.reply(admin);
  const requests = await client.groupRequestParticipantsList(message.jid);
  if (requests.length === 0) return await message.reply('_No pending join requests_');
  const jids = requests.map((r) => r.jid);
  await client.groupRequestParticipantsUpdate(message.jid, jids, 'approve');
  return await message.reply(`_Successfully accepted all ${jids.length} pending join requests_`);
 }
);

handler(
 {
  pattern: 'rejectall',
  desc: 'Reject all pending join requests',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!message.owner) return message.reply(owner);
  if (!m.isAdmin) return message.reply(admin);
  const requests = await client.groupRequestParticipantsList(message.jid);
  if (requests.length === 0) return await message.reply('_No pending join requests_');
  const jids = requests.map((r) => r.jid);
  await client.groupRequestParticipantsUpdate(message.jid, jids, 'reject');
  return await message.reply(`_Successfully rejected all ${jids.length} pending join requests_`);
 }
);

handler(
 {
  pattern: 'newgc',
  desc: 'Create a new group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.owner) return message.reply(owner);
  if (!match) return await message.reply('_Provide a name for the new group_');
  const participants = message.mention && message.mention.length > 0 ? message.mention : message.reply_message ? [message.reply_message.sender] : [message.user];
  const group = await client.groupCreate(match, participants);
  await message.reply(`_New group "${match}" created_`);
  return await client.sendMessage(group.id, { text: `_New Group ${match} Created_` });
 }
);

handler(
 {
  pattern: 'leave',
  desc: 'Leave the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!message.owner) return message.reply(owner);
  await message.reply('_Leaving the group. Goodbye!_');
  return await client.groupLeave(message.jid);
 }
);

handler(
 {
  pattern: 'invite',
  desc: 'Get Group Invite',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);

  if (!message.owner) return message.reply(owner);
  if (!m.isAdmin) return message.reply(admin);
  const code = await client.groupInviteCode(message.jid);
  return await message.reply('_https://chat.whatsapp.com/' + code + '_');
 }
);

handler(
 {
  pattern: 'revoke',
  desc: 'Revoke Group Invite',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  const newcode = await client.groupRevokeInvite(message.jid);
  return await message.reply('_Group Link Revoked!_\n_https://chat.whatsapp.com/' + newcode + '_');
 }
);

handler(
 {
  pattern: 'lock ?(.*)',
  desc: "only allow admins to modify the group's settings",
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  const meta = await client.groupMetadata(message.jid);
  if (meta.restrict) return await message.send('_Already only admin can modify group settings_');
  await client.groupSettingUpdate(message.jid, 'locked');
  return await message.send('*Only admin can modify group settings*');
 }
);

handler(
 {
  pattern: 'unlock ?(.*)',
  desc: "allow everyone to modify the group's settings -- like display picture etc.",
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  const meta = await message.client.groupMetadata(message.jid);
  if (!meta.restrict) return await message.send('_Already everyone can modify group settings_');
  await client.groupSettingUpdate(message.jid, 'unlocked');
  return await message.send('*Everyone can modify group settings*');
 }
);

handler(
 {
  pattern: 'welcome',
  desc: 'Configure welcome message for newly joined users',
  type: 'group',
  usage: '.welcome [on/off/message]\nAvailable placeholders:\n@user, @gname, @admins, @members, @gdesc, @pp',
 },
 async (message, match, m) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  const cmd = match.trim();
  if (!cmd) return message.reply('Please provide a command or message.');
  if (cmd === 'on' || cmd === 'off') {
   await groupMessageDB.toggleEvent(message.jid, 'add', cmd === 'on');
   return message.reply(`Welcome message has been turned ${cmd}`);
  }
  try {
   await groupMessageDB.setMessage(message.jid, 'add', cmd);
   return message.reply('Welcome message updated successfully!');
  } catch (error) {
   return message.reply('Failed to update welcome message');
  }
 }
);

handler(
 {
  pattern: 'goodbye',
  desc: 'Configure goodbye message for users that leave the group',
  type: 'group',
  usage: '.goodbye [on/off/message]\nAvailable placeholders:\n@user, @gname, @admins, @members, @gdesc',
 },
 async (message, match, m) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin) return message.reply(admin);
  const cmd = match.trim();
  if (!cmd) return message.reply('Please provide a command or message.');
  if (cmd === 'on' || cmd === 'off') {
   await groupMessageDB.toggleEvent(message.jid, 'remove', cmd === 'on');
   return message.reply(`Goodbye message has been turned ${cmd}`);
  }
  try {
   await groupMessageDB.setMessage(message.jid, 'remove', cmd);
   return message.reply('Goodbye message updated successfully!');
  } catch (error) {
   return message.reply('Failed to update goodbye message');
  }
 }
);
