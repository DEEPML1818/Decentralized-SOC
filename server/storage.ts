import { 
  users, tickets, incident_reports, 
  type User, type InsertUser, 
  type Ticket, type InsertTicket,
  type IncidentReport, type InsertIncidentReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { PinataSDK } from "pinata-web3";
import axios from "axios";

// Pinata configuration for IPFS storage
const pinataJWT = process.env.PINATA_JWT;
const pinataGateway = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

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

// Pinata IPFS storage for decentralized data management
export class PinataStorage implements IStorage {
  private pinata: PinataSDK | null = null;
  private dataCache: Map<string, any> = new Map();
  private metadataHash: string | null = null;

  constructor() {
    if (pinataJWT) {
      this.pinata = new PinataSDK({
        pinataJwt: pinataJWT,
        pinataGateway: pinataGateway,
      });
      this.loadMetadata();
    } else {
      console.warn("⚠️  PINATA_JWT not set, using in-memory storage");
    }
  }

  private async loadMetadata() {
    try {
      if (!this.pinata) return;
      
      const files = await this.pinata.listFiles();
      const metadataFile = files.find((file: any) => file.name === 'dsoc-metadata.json');
      
      if (metadataFile) {
        this.metadataHash = metadataFile.ipfs_pin_hash;
        const response = await axios.get(`${pinataGateway}/ipfs/${this.metadataHash}`);
        const metadata = response.data;
        
        for (const [key, hash] of Object.entries(metadata.dataHashes || {})) {
          try {
            const dataResponse = await axios.get(`${pinataGateway}/ipfs/${hash}`);
            this.dataCache.set(key, dataResponse.data);
          } catch (error) {
            console.warn(`Failed to load cached data for ${key}:`, error);
          }
        }
        
        console.log("✅ Pinata metadata loaded from IPFS");
      } else {
        console.log("📝 No existing metadata found, starting fresh");
      }
    } catch (error) {
      console.warn("Could not load Pinata metadata:", error);
    }
  }

  private async saveToIPFS(data: any, filename: string): Promise<string> {
    if (!this.pinata) throw new Error("Pinata not initialized");
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });
    
    const upload = await this.pinata.upload.file(file);
    return upload.IpfsHash;
  }

  private async updateMetadata() {
    if (!this.pinata) return;
    
    try {
      const metadata = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        dataHashes: Object.fromEntries(this.dataCache.entries())
      };
      
      const metadataHash = await this.saveToIPFS(metadata, 'dsoc-metadata.json');
      this.metadataHash = metadataHash;
      console.log(`📄 Metadata updated: ${metadataHash}`);
    } catch (error) {
      console.error("Failed to update metadata:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = this.dataCache.get('users') || [];
    return users.find((user: User) => user.id === id);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const users = this.dataCache.get('users') || [];
    return users.find((user: User) => user.wallet_address === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = this.dataCache.get('users') || [];
    const newUser: User = {
      ...insertUser,
      id: users.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
      clt_balance: insertUser.clt_balance ?? 0,
      stake_balance: insertUser.stake_balance ?? 0
    };
    
    users.push(newUser);
    this.dataCache.set('users', users);
    
    if (this.pinata) {
      try {
        const hash = await this.saveToIPFS(users, 'dsoc-users.json');
        this.dataCache.set('users', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to save users to IPFS:", error);
      }
    }
    
    return newUser;
  }

  // Incident Report operations
  async createIncidentReport(report: InsertIncidentReport): Promise<IncidentReport> {
    const reports = this.dataCache.get('incident_reports') || [];
    const newReport: IncidentReport = {
      ...report,
      id: reports.length + 1,
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
    
    reports.push(newReport);
    this.dataCache.set('incident_reports', reports);
    
    if (this.pinata) {
      try {
        const hash = await this.saveToIPFS(reports, 'dsoc-incident-reports.json');
        this.dataCache.set('incident_reports', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to save incident reports to IPFS:", error);
      }
    }
    
    return newReport;
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    const reports = this.dataCache.get('incident_reports') || [];
    return Array.isArray(reports) ? reports.sort((a: IncidentReport, b: IncidentReport) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];
  }

  async getIncidentReportById(id: number): Promise<IncidentReport | undefined> {
    const reports = this.dataCache.get('incident_reports') || [];
    return reports.find((report: IncidentReport) => report.id === id);
  }

  async updateIncidentReport(id: number, updates: Partial<IncidentReport>): Promise<IncidentReport> {
    const reports = this.dataCache.get('incident_reports') || [];
    const index = reports.findIndex((report: IncidentReport) => report.id === id);
    
    if (index === -1) {
      throw new Error(`Incident report with id ${id} not found`);
    }
    
    const updated = { ...reports[index], ...updates, updated_at: new Date() };
    reports[index] = updated;
    this.dataCache.set('incident_reports', reports);
    
    if (this.pinata) {
      try {
        const hash = await this.saveToIPFS(reports, 'dsoc-incident-reports.json');
        this.dataCache.set('incident_reports', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to update incident reports on IPFS:", error);
      }
    }
    
    return updated;
  }

  // Ticket operations
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const tickets = this.dataCache.get('tickets') || [];
    const newTicket: Ticket = {
      ...ticket,
      id: tickets.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
      analyst_address: ticket.analyst_address ?? null,
      report_hash: ticket.report_hash ?? null,
      transaction_hash: ticket.transaction_hash ?? null,
      status: ticket.status ?? 0
    };
    
    tickets.push(newTicket);
    this.dataCache.set('tickets', tickets);
    
    if (this.pinata) {
      try {
        const hash = await this.saveToIPFS(tickets, 'dsoc-tickets.json');
        this.dataCache.set('tickets', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to save tickets to IPFS:", error);
      }
    }
    
    return newTicket;
  }

  async getTickets(): Promise<Ticket[]> {
    const tickets = this.dataCache.get('tickets') || [];
    return Array.isArray(tickets) ? tickets.sort((a: Ticket, b: Ticket) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.getTickets();
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    const tickets = this.dataCache.get('tickets') || [];
    return tickets.find((ticket: Ticket) => ticket.id === id) || null;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const tickets = this.dataCache.get('tickets') || [];
    const index = tickets.findIndex((ticket: Ticket) => ticket.id === id);
    
    if (index === -1) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    
    const updated = { ...tickets[index], ...updates, updated_at: new Date() };
    tickets[index] = updated;
    this.dataCache.set('tickets', tickets);
    
    if (this.pinata) {
      try {
        const hash = await this.saveToIPFS(tickets, 'dsoc-tickets.json');
        this.dataCache.set('tickets', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to update tickets on IPFS:", error);
      }
    }
    
    return updated;
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

// Storage factory - determines which storage to use based on environment
export function createStorage(): IStorage {
  const databaseUrl = process.env.DATABASE_URL;
  const pinataJWT = process.env.PINATA_JWT;

  if (pinataJWT) {
    console.log("🔗 Using Pinata IPFS storage for decentralized data");
    return new PinataStorage();
  } else if (databaseUrl) {
    console.log("🗄️ Using database storage");
    return new DatabaseStorage();
  } else {
    console.log("📝 Using in-memory storage for demo");
    return new MemoryStorage();
  }
}

// Global storage instance
export const storage = createStorage();