import { db } from "./db";
import {
  subjects, classes, studySessions, tasks,
  type Subject, type InsertSubject,
  type Class, type InsertClass,
  type StudySession, type InsertStudySession,
  type Task, type InsertTask
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Subjects
  getSubjects(userId: string): Promise<Subject[]>;
  createSubject(userId: string, subject: InsertSubject): Promise<Subject>;
  deleteSubject(userId: string, id: number): Promise<void>;

  // Classes
  getClasses(userId: string): Promise<(Class & { subject: Subject | null })[]>;
  createClass(userId: string, cls: InsertClass): Promise<Class>;
  deleteClass(userId: string, id: number): Promise<void>;

  // Study Sessions
  getStudySessions(userId: string): Promise<(StudySession & { subject: Subject | null })[]>;
  createStudySession(userId: string, session: InsertStudySession): Promise<StudySession>;
  updateStudySession(userId: string, id: number, updates: Partial<InsertStudySession>): Promise<StudySession>;
  deleteStudySession(userId: string, id: number): Promise<void>;

  // Tasks
  getTasks(userId: string): Promise<(Task & { subject: Subject | null })[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(userId: string, id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(userId: string, id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Include Auth Storage methods
  getUser = authStorage.getUser;
  upsertUser = authStorage.upsertUser;

  // Subjects
  async getSubjects(userId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.userId, userId));
  }

  async createSubject(userId: string, subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values({ ...subject, userId }).returning();
    return newSubject;
  }

  async deleteSubject(userId: string, id: number): Promise<void> {
    await db.delete(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, userId)));
  }

  // Classes
  async getClasses(userId: string): Promise<(Class & { subject: Subject | null })[]> {
    return await db.query.classes.findMany({
      where: eq(classes.userId, userId),
      with: { subject: true }
    });
  }

  async createClass(userId: string, cls: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values({ ...cls, userId }).returning();
    return newClass;
  }

  async deleteClass(userId: string, id: number): Promise<void> {
    await db.delete(classes).where(and(eq(classes.id, id), eq(classes.userId, userId)));
  }

  // Study Sessions
  async getStudySessions(userId: string): Promise<(StudySession & { subject: Subject | null })[]> {
    return await db.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
      with: { subject: true }
    });
  }

  async createStudySession(userId: string, session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db.insert(studySessions).values({ ...session, userId }).returning();
    return newSession;
  }

  async updateStudySession(userId: string, id: number, updates: Partial<InsertStudySession>): Promise<StudySession> {
    const [updated] = await db.update(studySessions)
      .set(updates)
      .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
      .returning();
    return updated;
  }

  async deleteStudySession(userId: string, id: number): Promise<void> {
    await db.delete(studySessions).where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)));
  }

  // Tasks
  async getTasks(userId: string): Promise<(Task & { subject: Subject | null })[]> {
    return await db.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      with: { subject: true }
    });
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values({ ...task, userId }).returning();
    return newTask;
  }

  async updateTask(userId: string, id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db.update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTask(userId: string, id: number): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
