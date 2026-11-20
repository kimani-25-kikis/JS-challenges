import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

const dataPath = path.resolve(config.dataFile);

let tasks = [];

async function load() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    tasks = JSON.parse(data);
  } catch {
    tasks = [];
  }
}

async function save() {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(tasks, null, 2));
}

await load();

export const taskService = {
  async getAll({ status, search } = {}) {
    let result = [...tasks];
    if (status) {
      result = result.filter(t => t.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return result;
  },

  async getById(id) {
    return tasks.find(t => t.id === id) || null;
  },

  async create({ title, description = '', status = 'todo' }) {
    const task = {
      id: uuidv4(),
      title,
      description,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(task);
    await save();
    return task;
  },

  async update(id, data) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    await save();
    return tasks[index];
  },

  async remove(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    await save();
    return true;
  }
};