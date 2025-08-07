/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const AnalyserData = pgTable("analyser_data_users", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull(),
    role: varchar("role").notNull().default("user"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const JobApplications = pgTable("job_applications_users", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TrainingData = pgTable("training_users", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
