import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.resolve('model-db.sqlite');
const MODELS_DIR = path.resolve('user_models');

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.prepare(`CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  fileName TEXT NOT NULL,
  filePath TEXT NOT NULL,
  active INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`).run();

export function addModel(userId, fileName, filePath) {
  const id = uuidv4();
  db.prepare('INSERT INTO models (id, userId, fileName, filePath, active) VALUES (?, ?, ?, ?, 0)')
    .run(id, userId, fileName, filePath);
  return { id, userId, fileName, filePath, active: 0 };
}

export function listModels(userId) {
  return db.prepare('SELECT * FROM models WHERE userId = ?').all(userId);
}

export function activateModel(id, userId) {
  const tx = db.transaction(() => {
    db.prepare('UPDATE models SET active = 0 WHERE userId = ?').run(userId);
    db.prepare('UPDATE models SET active = 1 WHERE id = ? AND userId = ?').run(id, userId);
  });
  tx();
}

export function deleteModel(id, userId) {
  const model = db.prepare('SELECT * FROM models WHERE id = ? AND userId = ?').get(id, userId);
  if (!model) return;
  if (fs.existsSync(model.filePath)) fs.unlinkSync(model.filePath);
  db.prepare('DELETE FROM models WHERE id = ? AND userId = ?').run(id, userId);
}

export function getActiveModel(userId) {
  return db.prepare('SELECT * FROM models WHERE userId = ? AND active = 1').get(userId);
}

export { MODELS_DIR };
