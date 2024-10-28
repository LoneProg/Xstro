const { Sequelize } = require('sequelize');
require('dotenv').config();
const env = (key, def) => process.env[key] || def;
const DB_URL = env('DATABASE_URL', './database.db');

let sequelize;
if (DB_URL === './database.db' || !DB_URL.startsWith('postgres://')) {
 sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.db',
  logging: false,
 });
} else {
 sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  ssl: true,
  dialectOptions: {
   ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
 });
}

module.exports = {
 SESSION_ID: process.env.SESSION_ID || '',
 SUDO: process.env.SUDO || '' || null,
 PREFIX: process.env.HANDLER || '.',
 BOT_INFO: process.env.BOT_INFO || 'Astro;Xstro',
 LOGS: process.env.LOGS || true,
 ANTI_CALL: process.env.ANTI_CALL || 'false',
 USER_IMAGES: process.env.USER_IMAGES || '',
 STICKER_PACK: process.env.STICKER_PACK || 'Astro;Xstro',
 WARN_COUNT: 3,
 AUTO_READ_MESSAGE: process.env.AUTO_READ || true,
 AUTO_STATUS_READ: process.env.AUTO_STATUS_READ || true,
 PRESENCE_UPDATE: process.env.PRESENCE_UPDATE || 'available',
 MODE: process.env.MODE || 'public',
 PORT: process.env.PORT || 8000,
 DATABASE_URL: DB_URL,
 DATABASE: sequelize,
};
