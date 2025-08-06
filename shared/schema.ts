import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core ticket management tables for dSOC
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id").notNull().unique(),
  client_address: varchar("client_address", { length: 255 }).notNull(),
  analyst_address: varchar("analyst_address", { length: 255 }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  evidence_hash: varchar("evidence_hash", { length: 64 }).notNull(),
  report_hash: varchar("report_hash", { length: 64 }),
  status: integer("status").notNull().default(0),
  stake_amount: integer("stake_amount").notNull(),
  transaction_hash: varchar("transaction_hash", { length: 64 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  wallet_address: varchar("wallet_address", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull(),
  clt_balance: integer("clt_balance").notNull().default(0),
  stake_balance: integer("stake_balance").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id").references(() => tickets.ticket_id),
  from_address: varchar("from_address", { length: 255 }).notNull(),
  to_address: varchar("to_address", { length: 255 }),
  transaction_hash: varchar("transaction_hash", { length: 64 }).notNull(),
  transaction_type: varchar("transaction_type", { length: 50 }).notNull(),
  amount: integer("amount"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const stake_tokens = pgTable("stake_tokens", {
  id: serial("id").primaryKey(),
  owner_address: varchar("owner_address", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  is_used: boolean("is_used").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const clt_tokens = pgTable("clt_tokens", {
  id: serial("id").primaryKey(),
  owner_address: varchar("owner_address", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Incident Reports table for real-time dashboard updates
export const incident_reports = pgTable("incident_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  affected_systems: text("affected_systems"),
  attack_vectors: text("attack_vectors"),
  severity: varchar("severity", { length: 20 }).notNull().default("medium"),
  client_name: varchar("client_name", { length: 255 }).notNull(),
  contact_info: varchar("contact_info", { length: 255 }).notNull(),
  evidence_urls: text("evidence_urls"),
  ai_analysis: text("ai_analysis"),
  assigned_analyst: varchar("assigned_analyst", { length: 255 }),
  assigned_certifier: varchar("assigned_certifier", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  client_wallet: varchar("client_wallet", { length: 255 }),
  // Blockchain transaction data fields
  transaction_hash: varchar("transaction_hash", { length: 66 }), // 0x + 64 hex chars
  block_number: integer("block_number"), // Block number where tx was mined
  gas_used: varchar("gas_used", { length: 50 }), // Gas used for transaction
  contract_address: varchar("contract_address", { length: 42 }), // Contract address used
  ticket_id: integer("ticket_id"), // On-chain ticket ID if created
  ipfs_metadata_hash: varchar("ipfs_metadata_hash", { length: 255 }),
  staking_pool_address: varchar("staking_pool_address", { length: 42 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  created_at: true,
});

export const insertStakeTokenSchema = createInsertSchema(stake_tokens).omit({
  id: true,
  created_at: true,
});

export const insertCLTTokenSchema = createInsertSchema(clt_tokens).omit({
  id: true,
  created_at: true,
});

export const insertIncidentReportSchema = createInsertSchema(incident_reports).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertStakeToken = z.infer<typeof insertStakeTokenSchema>;
export type StakeToken = typeof stake_tokens.$inferSelect;

export type InsertCLTToken = z.infer<typeof insertCLTTokenSchema>;
export type CLTToken = typeof clt_tokens.$inferSelect;

export type InsertIncidentReport = z.infer<typeof insertIncidentReportSchema>;
export type IncidentReport = typeof incident_reports.$inferSelect;
