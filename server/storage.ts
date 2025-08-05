import { 
  users, tickets, incident_reports, 
  type User, type InsertUser, 
  type Ticket, type InsertTicket,
  type IncidentReport, type InsertIncidentReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://sncziafbwxgjkvymkolp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY3ppYWZid3hnamt2eW1rb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTMyNTksImV4cCI6MjA2NjgyOTI1OX0.r8xYuUWST0Hx6ifGLuFLgxj0GlvMSY3MGgrf90u5x5o';

const supabase = createClient(supabaseUrl, supabaseKey);

// Interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Incident Report operations
  createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport>;
  getIncidentReports(): Promise<IncidentReport[]>;
  getIncidentReportById(id: number): Promise<IncidentReport | undefined>;
  updateIncidentReport(id: number, updates: Partial<IncidentReport>): Promise<IncidentReport>;

  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTickets(): Promise<Ticket[]>;
  getAllTickets(): Promise<Ticket[]>;
  getTicketById(id: number): Promise<Ticket | null>;
  updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket>;
}

// In-memory storage as fallback when database is unavailable
export class MemoryStorage implements IStorage {
  private incidentReports: Map<number, IncidentReport> = new Map();
  private users: Map<number, User> = new Map();
  private tickets: Map<number, Ticket> = new Map();
  private currentId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.wallet_address === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentId++, 
      created_at: new Date(), 
      updated_at: new Date(),
      clt_balance: insertUser.clt_balance ?? 0,
      stake_balance: insertUser.stake_balance ?? 0
    };
    this.users.set(user.id, user);
    return user;
  }

  async createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport> {
    const newReport: IncidentReport = {
      ...report,
      id: this.currentId++,
      created_at: new Date(),
      updated_at: new Date(),
      ticket_id: report.ticket_id ?? null,
      severity: report.severity ?? "medium",
      status: report.status ?? "pending",
      transaction_hash: report.transaction_hash ?? null,
      affected_systems: report.affected_systems ?? null,
      attack_vectors: report.attack_vectors ?? null,
      ai_analysis: report.ai_analysis ?? null,
      contract_address: report.contract_address ?? null,
      evidence_urls: report.evidence_urls ?? null,
      assigned_analyst: report.assigned_analyst ?? null,
      assigned_certifier: report.assigned_certifier ?? null,
      client_wallet: report.client_wallet ?? null,
      block_number: report.block_number ?? null,
      gas_used: report.gas_used ?? null
    };
    this.incidentReports.set(newReport.id, newReport);
    return newReport;
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    return Array.from(this.incidentReports.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getAllIncidentReports(): Promise<IncidentReport[]> {
    return Array.from(this.incidentReports.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getIncidentReportById(id: number): Promise<IncidentReport | undefined> {
    return this.incidentReports.get(id);
  }

  async updateIncidentReport(id: number, updates: Partial<IncidentReport>): Promise<IncidentReport> {
    const existing = this.incidentReports.get(id);
    if (!existing) {
      throw new Error(`Incident report with id ${id} not found`);
    }

    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.incidentReports.set(id, updated);
    return updated;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: this.currentId++,
      created_at: new Date(),
      updated_at: new Date(),
      analyst_address: ticket.analyst_address ?? null,
      report_hash: ticket.report_hash ?? null,
      transaction_hash: ticket.transaction_hash ?? null,
      status: ticket.status ?? 0
    };
    this.tickets.set(newTicket.id, newTicket);
    return newTicket;
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.getTickets();
  }
  
  async getTicketById(id: number): Promise<Ticket | null> {
    return this.tickets.get(id) || null;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const existing = this.tickets.get(id);
    if (!existing) {
      throw new Error(`Ticket with id ${id} not found`);
    }

    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.tickets.set(id, updated);
    return updated;
  }
}

// Supabase storage for production-ready data management
export class SupabaseStorage implements IStorage {
  private supabase: any;

  constructor() {
    this.supabase = supabase;
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase error fetching user:', error);
      return undefined;
    }
    return data;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) {
      console.error('Supabase error fetching user by wallet:', error);
      return undefined;
    }
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('users')
      .insert([insertUser])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating user: ${error.message}`);
    return data;
  }

  async createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('incident_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating incident report: ${error.message}`);
    return data;
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('incident_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase error fetching incident reports: ${error.message}`);
    return data || [];
  }

  async getAllIncidentReports(): Promise<IncidentReport[]> {
    return this.getIncidentReports();
  }

  async getIncidentReportById(id: number): Promise<IncidentReport | undefined> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('incident_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching incident report:', error);
      return undefined;
    }
    return data;
  }

  async updateIncidentReport(id: number, updates: Partial<IncidentReport>): Promise<IncidentReport> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('incident_reports')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error updating incident report: ${error.message}`);
    return data;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw new Error(`Supabase error creating ticket: ${error.message}`);
    return data;
  }

  async getTickets(): Promise<Ticket[]> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase error fetching tickets: ${error.message}`);
    return data || [];
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.getTickets();
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching ticket:', error);
      return null;
    }
    return data;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    const { data, error } = await this.supabase
      .from('tickets')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Supabase error updating ticket: ${error.message}`);
    return data;
  }
}

// Real database storage using Drizzle + Neon
export class DatabaseStorage implements IStorage {

  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.select().from(users).where(eq(users.wallet_address, walletAddress)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.insert(incident_reports).values(report).returning();
    return result[0];
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(incident_reports).orderBy(desc(incident_reports.created_at));
  }

  async getAllIncidentReports(): Promise<IncidentReport[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(incident_reports).orderBy(desc(incident_reports.created_at));
  }

  async getIncidentReportById(id: number): Promise<IncidentReport | undefined> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.select().from(incident_reports).where(eq(incident_reports.id, id)).limit(1);
    return result[0];
  }

  async updateIncidentReport(id: number, updates: Partial<IncidentReport>): Promise<IncidentReport> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.update(incident_reports)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(incident_reports.id, id))
      .returning();
    return result[0];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.insert(tickets).values(ticket).returning();
    return result[0];
  }

  async getTickets(): Promise<Ticket[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(tickets).orderBy(desc(tickets.created_at));
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.getTickets();
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.getTickets();
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    return result[0] || null;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.update(tickets)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return result[0];
  }
}

// Try Supabase first, then database, then fallback to memory storage
let storage: IStorage;

async function initializeStorage(): Promise<IStorage> {
  // Try Supabase first for better storage management
  if (supabaseUrl && supabaseKey) {
    try {
      const supabaseStorage = new SupabaseStorage();
      // Test the connection
      await supabaseStorage.getIncidentReports();
      console.log("✅ Connected to Supabase for data storage");
      return supabaseStorage;
    } catch (error) {
      console.warn("⚠️  Supabase connection failed:", (error as Error).message);
    }
  }

  // Fallback to Drizzle + Neon database
  if (process.env.DATABASE_URL) {
    try {
      const dbStorage = new DatabaseStorage();
      // Test the connection
      await dbStorage.getIncidentReports();
      console.log("✅ Connected to Neon database");
      return dbStorage;
    } catch (error) {
      console.warn("⚠️  Database connection failed:", (error as Error).message);
    }
  }

  console.log("📝 Using in-memory storage for demo");
  return new MemoryStorage();
}

// Initialize with memory storage immediately for demo
storage = new MemoryStorage();

// Try to upgrade to persistent storage in background
initializeStorage().then(newStorage => {
  storage = newStorage;
}).catch(console.error);

export { storage };