/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
    pgTable,
    serial,
    timestamp,
    varchar,
    boolean,
    text,
    integer,
} from "drizzle-orm/pg-core";

export const AnalyserData = pgTable("analyser_data_users", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull().unique(),
    role: varchar("role").notNull().default("user"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const JobApplications = pgTable("job_applications_users", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TrainingData = pgTable("training_users", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TrainingLogs = pgTable("training_logs", {
    id: serial("id").primaryKey(),
    username: varchar("name").notNull(),
    email: varchar("email").notNull(),
    type: varchar("type").notNull(),
    log: text("log").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ClientSchedule = pgTable("client_schedule", {
    id: serial("id").primaryKey(),
    clientId: varchar("client_id").notNull(),
    clientName: varchar("client_name").notNull(),
    startDate: timestamp("start_date").notNull(),
    service: varchar("service").notNull(),
    monday: integer("monday"),
    tuesday: integer("tuesday"),
    wednesday: integer("wednesday"),
    thursday: integer("thursday"),
    friday: integer("friday"),
    saturday: integer("saturday"),
    sunday: integer("sunday"),
    multiple: boolean("multiple"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
