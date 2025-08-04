import { 
  users, tickets, incident_reports, 
  type User, type InsertUser, 
  type Ticket, type InsertTicket,
  type IncidentReport, type InsertIncidentReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
      updated_at: new Date() 
    };
    this.users.set(user.id, user);
    return user;
  }

  async createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport> {
    const newReport: IncidentReport = {
      ...report,
      id: this.currentId++,
      created_at: new Date(),
      updated_at: new Date()
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
      updated_at: new Date()
    };
    this.tickets.set(newTicket.id, newTicket);
    return newTicket;
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
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

// Real database storage using Drizzle + Neon
export class DatabaseStorage implements IStorage {

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.wallet_address, walletAddress)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport> {
    const result = await db.insert(incident_reports).values(report).returning();
    return result[0];
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    return await db.select().from(incident_reports).orderBy(desc(incident_reports.created_at));
  }

  async getAllIncidentReports(): Promise<IncidentReport[]> {
    return await db.select().from(incident_reports).orderBy(desc(incident_reports.created_at));
  }

  async getIncidentReportById(id: number): Promise<IncidentReport | undefined> {
    const result = await db.select().from(incident_reports).where(eq(incident_reports.id, id)).limit(1);
    return result[0];
  }

  async updateIncidentReport(id: number, updates: Partial<IncidentReport>): Promise<IncidentReport> {
    const result = await db.update(incident_reports)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(incident_reports.id, id))
      .returning();
    return result[0];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const result = await db.insert(tickets).values(ticket).returning();
    return result[0];
  }

  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.created_at));
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const result = await db.update(tickets)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return result[0];
  }
}

// Try database first, fallback to memory storage if connection fails
let storage: IStorage;

async function initializeStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    try {
      const dbStorage = new DatabaseStorage();
      // Test the connection
      await dbStorage.getIncidentReports();
      console.log("✅ Connected to Supabase database");
      return dbStorage;
    } catch (error) {
      console.warn("⚠️  Database connection failed, using in-memory storage:", error.message);
      console.warn("📝 To use real database: verify your DATABASE_URL from Supabase");
    }
  }
  
  console.log("📝 Using in-memory storage for real-time dashboard demo");
  return new MemoryStorage();
}

// Initialize with memory storage immediately for demo
storage = new MemoryStorage();

// Try to upgrade to database in background
initializeStorage().then(newStorage => {
  storage = newStorage;
}).catch(console.error);

export { storage };
