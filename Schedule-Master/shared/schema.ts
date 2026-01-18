import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull(), // Hex code
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday...
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(), // HH:mm
  location: text("location"),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  priority: text("priority").default("medium"), // low, medium, high
});

// === RELATIONS ===

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, { fields: [subjects.userId], references: [users.id] }),
  classes: many(classes),
  tasks: many(tasks),
  sessions: many(studySessions),
}));

export const classesRelations = relations(classes, ({ one }) => ({
  subject: one(subjects, { fields: [classes.subjectId], references: [subjects.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  subject: one(subjects, { fields: [tasks.subjectId], references: [subjects.id] }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  subject: one(subjects, { fields: [studySessions.subjectId], references: [subjects.id] }),
}));

// === INSERT SCHEMAS ===

export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, userId: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true, userId: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, userId: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, userId: true });

// === EXPORTED TYPES ===

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
