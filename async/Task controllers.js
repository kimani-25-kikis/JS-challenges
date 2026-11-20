import { taskService } from '../services/taskService.js';
import { z } from 'zod';

export const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional()
});

export const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional()
});

export const taskController = {
  async list(req, res, next) {
    try {
      const tasks = await taskService.getAll({
        status: req.query.status,
        search: req.query.search
      });
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      const task = await taskService.getById(req.params.id);
      if (!task) {
        return res.status(404).json({ error: { message: 'Task not found' } });
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const task = await taskService.create(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const task = await taskService.update(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: { message: 'Task not found' } });
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await taskService.remove(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: { message: 'Task not found' } });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};