import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get userId
  const getUserId = (req: any) => req.user.claims.sub;

  // === SUBJECTS ===
  app.get(api.subjects.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const subjects = await storage.getSubjects(userId);
    res.json(subjects);
  });

  app.post(api.subjects.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.subjects.create.input.parse(req.body);
      const subject = await storage.createSubject(userId, input);
      res.status(201).json(subject);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.subjects.delete.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteSubject(userId, Number(req.params.id));
    res.status(204).end();
  });

  // === CLASSES ===
  app.get(api.classes.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const classes = await storage.getClasses(userId);
    res.json(classes);
  });

  app.post(api.classes.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.classes.create.input.parse(req.body);
      const newClass = await storage.createClass(userId, input);
      res.status(201).json(newClass);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.classes.delete.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteClass(userId, Number(req.params.id));
    res.status(204).end();
  });

  // === TASKS ===
  app.get(api.tasks.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.tasks.create.input.parse(req.body);
      const newTask = await storage.createTask(userId, input);
      res.status(201).json(newTask);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.tasks.update.input.parse(req.body);
      const updated = await storage.updateTask(userId, Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteTask(userId, Number(req.params.id));
    res.status(204).end();
  });

  // === SESSIONS ===
  app.get(api.sessions.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const sessions = await storage.getStudySessions(userId);
    res.json(sessions);
  });

  app.post(api.sessions.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.sessions.create.input.parse(req.body);
      const newSession = await storage.createStudySession(userId, input);
      res.status(201).json(newSession);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.sessions.update.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.sessions.update.input.parse(req.body);
      const updated = await storage.updateStudySession(userId, Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.sessions.delete.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteStudySession(userId, Number(req.params.id));
    res.status(204).end();
  });

  return httpServer;
}
