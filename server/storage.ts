import { 
  users, tickets, incident_reports, 
  type User, type InsertUser, 
  type Ticket, type InsertTicket,
  type IncidentReport, type InsertIncidentReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
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

  // Role management
  getUserRole(address: string): Promise<'client' | 'analyst' | 'certifier' | null>;
  assignUserRole(address: string, role: 'client' | 'analyst' | 'certifier'): Promise<void>;

  // IPFS operations
  uploadJSON(data: any, filename?: string): Promise<string>;
  getJSON(hash: string): Promise<any>;
}

// In-memory storage as fallback when database is unavailable
export class MemoryStorage implements IStorage {
  private incidentReports: Map<number, IncidentReport> = new Map();
  private users: Map<number, User> = new Map();
  private tickets: Map<number, Ticket> = new Map();
  private userRoles: Map<string, 'client' | 'analyst' | 'certifier'> = new Map();
  private dataCache: Map<string, any> = new Map();
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

  // Role management methods
  async getUserRole(address: string): Promise<'client' | 'analyst' | 'certifier' | null> {
    return this.userRoles.get(address) || null;
  }

  async assignUserRole(address: string, role: 'client' | 'analyst' | 'certifier'): Promise<void> {
    this.userRoles.set(address, role);
  }

  // IPFS methods (stub implementation for memory storage)
  async uploadJSON(data: any, filename?: string): Promise<string> {
    const hash = `Qm${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    this.dataCache.set(hash, data);
    return hash;
  }

  async getJSON(hash: string): Promise<any> {
    const data = this.dataCache.get(hash);
    if (!data) {
      throw new Error(`No data found for hash: ${hash}`);
    }
    return data;
  }

}

// Pinata IPFS storage for decentralized data management (Direct API)
export class PinataStorage implements IStorage {
  private dataCache: Map<string, any> = new Map();
  private userRoles: Map<string, 'client' | 'analyst' | 'certifier'> = new Map();
  private metadataHash: string | null = null;
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataGateway: string;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || "";
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY || "";
    this.pinataGateway = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";
    
    console.log("Pinata Direct API initialization:", {
      apiKey: this.pinataApiKey ? "present" : "missing",
      secretKey: this.pinataSecretKey ? "present" : "missing",
      gateway: this.pinataGateway
    });
    
    if (this.pinataApiKey && this.pinataSecretKey) {
      this.loadMetadata();
      console.log("✅ Pinata Direct API storage initialized successfully");
    } else {
      console.warn("⚠️  Pinata API credentials not complete");
    }
  }

  private async loadMetadata() {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) return;
      
      // List files to find existing metadata
      const listResponse = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
        headers: {
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
      });
      
      if (listResponse.ok) {
        const files = await listResponse.json();
        const metadataFile = files.rows.find((file: any) => file.metadata.name === 'dSOC-Metadata');
        
        if (metadataFile) {
          this.metadataHash = metadataFile.ipfs_pin_hash;
          const response = await axios.get(`${this.pinataGateway}/ipfs/${this.metadataHash}`);
          const metadata = response.data;
          
          console.log("📋 Current IPFS Metadata:", JSON.stringify(metadata, null, 2));
          
          for (const [key, value] of Object.entries(metadata.dataHashes || {})) {
            // Check if the value is a hash string or actual data
            if (typeof value === 'string' && value.startsWith('Qm')) {
              try {
                console.log(`🔄 Loading ${key} from IPFS hash: ${value}`);
                const dataResponse = await axios.get(`${this.pinataGateway}/ipfs/${value}`);
                this.dataCache.set(key.replace('_hash', ''), dataResponse.data);
                this.dataCache.set(key, value); // Store the hash separately
              } catch (error) {
                console.warn(`Failed to load cached data for ${key}:`, error);
              }
            } else {
              // It's actual data, store it directly
              this.dataCache.set(key, value);
            }
          }
          
          console.log("✅ Pinata metadata loaded from IPFS");
        } else {
          console.log("📝 No existing metadata found, starting fresh");
        }
      }
    } catch (error) {
      console.warn("Could not load Pinata metadata:", error);
    }
  }

  private async uploadToIPFSWithPinata(data: any, filename: string, name: string): Promise<string> {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });
    const fd = new FormData();
    fd.append('file', file);
    fd.append('pinataMetadata', JSON.stringify({ name }));

    console.log(`📤 Uploading to IPFS: ${name} (${filename})`);
    console.log(`📋 Data Preview:`, JSON.stringify(data, null, 2));

    const res = await fetch(url, {
      method: 'POST',
      body: fd,
      headers: {
        pinata_api_key: this.pinataApiKey,
        pinata_secret_api_key: this.pinataSecretKey,
      },
    });
    
    const result = await res.json();
    if (!res.ok) {
      throw new Error(typeof result.error === 'object' ? JSON.stringify(result.error) : result.error);
    }
    
    console.log(`✅ IPFS Upload Success: ${result.IpfsHash}`);
    return result.IpfsHash;
  }

  private async updateMetadata() {
    if (!this.pinataApiKey || !this.pinataSecretKey) return;
    
    try {
      const metadata = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        platform: "dSOC",
        dataHashes: Object.fromEntries(this.dataCache.entries())
      };
      
      const metadataHash = await this.uploadToIPFSWithPinata(metadata, 'dsoc-metadata.json', 'dSOC-Metadata');
      this.metadataHash = metadataHash;
      console.log(`📄 Metadata updated: ${metadataHash}`);
      console.log(`🔗 View at: ${this.pinataGateway}/ipfs/${metadataHash}`);
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
    
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        const hash = await this.uploadToIPFSWithPinata(users, 'dsoc-users.json', 'dSOC-Users');
        this.dataCache.set('users_hash', hash);
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
    
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        const hash = await this.uploadToIPFSWithPinata(reports, 'dsoc-incident-reports.json', 'dSOC-IncidentReports');
        this.dataCache.set('incident_reports_hash', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to save incident reports to IPFS:", error);
      }
    }
    
    return newReport;
  }

  async getIncidentReports(): Promise<IncidentReport[]> {
    // Return cached data directly for better performance
    const reports = this.dataCache.get('incident_reports') || [];
    console.log(`📊 Returning ${Array.isArray(reports) ? reports.length : 0} incident reports from cache`);
    return Array.isArray(reports) ? reports.sort((a: IncidentReport, b: IncidentReport) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];
  }

  async getIncidentReportById(id: number): Promise<IncidentReport | undefined> {
    // Ensure we have fresh data
    const reports = await this.getIncidentReports();
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
    
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        const hash = await this.uploadToIPFSWithPinata(reports, 'dsoc-incident-reports.json', 'dSOC-IncidentReports');
        this.dataCache.set('incident_reports_hash', hash);
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
    
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        const hash = await this.uploadToIPFSWithPinata(tickets, 'dsoc-tickets.json', 'dSOC-Tickets');
        this.dataCache.set('tickets_hash', hash);
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
    
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        const hash = await this.uploadToIPFSWithPinata(tickets, 'dsoc-tickets.json', 'dSOC-Tickets');
        this.dataCache.set('tickets_hash', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to update tickets on IPFS:", error);
      }
    }
    
    return updated;
  }

  // Role management methods
  async getUserRole(address: string): Promise<'client' | 'analyst' | 'certifier' | null> {
    return this.userRoles.get(address) || null;
  }

  async assignUserRole(address: string, role: 'client' | 'analyst' | 'certifier'): Promise<void> {
    this.userRoles.set(address, role);
    // Store roles in IPFS for persistence
    if (this.pinataApiKey && this.pinataSecretKey) {
      try {
        const roles = Object.fromEntries(this.userRoles.entries());
        const hash = await this.uploadToIPFSWithPinata(roles, 'dsoc-user-roles.json', 'dSOC-UserRoles');
        this.dataCache.set('user_roles_hash', hash);
        await this.updateMetadata();
      } catch (error) {
        console.error("Failed to save user roles to IPFS:", error);
      }
    }
  }

  // IPFS methods - main implementation
  async uploadJSON(data: any, filename?: string): Promise<string> {
    if (this.pinataApiKey && this.pinataSecretKey) {
      return await this.uploadToIPFSWithPinata(data, filename || 'data.json', filename || 'IPFS-Data');
    }
    // Fallback to memory storage
    const hash = `Qm${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    this.dataCache.set(hash, data);
    return hash;
  }

  async getJSON(hash: string): Promise<any> {
    // Check memory cache first
    const cachedData = this.dataCache.get(hash);
    if (cachedData) {
      return cachedData;
    }

    // Try to fetch from IPFS
    try {
      const response = await axios.get(`${this.pinataGateway}/ipfs/${hash}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch data from IPFS hash: ${hash}`);
    }
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

  // Role management methods (stub implementation - would use database in real app)
  async getUserRole(address: string): Promise<'client' | 'analyst' | 'certifier' | null> {
    // In a real implementation, this would query a user_roles table
    return null; // Placeholder
  }

  async assignUserRole(address: string, role: 'client' | 'analyst' | 'certifier'): Promise<void> {
    // In a real implementation, this would insert/update in a user_roles table
    console.log(`Role assignment: ${address} → ${role}`);
  }

  // IPFS methods (stub implementation for database storage)
  async uploadJSON(data: any, filename?: string): Promise<string> {
    // In a real implementation, this would store in database and return a reference
    const hash = `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return hash;
  }

  async getJSON(hash: string): Promise<any> {
    // In a real implementation, this would fetch from database by reference
    throw new Error(`Database storage does not support direct IPFS hash retrieval: ${hash}`);
  }
}

// Storage factory - determines which storage to use based on environment
export function createStorage(): IStorage {
  const databaseUrl = process.env.DATABASE_URL;
  const pinataJWT = process.env.PINATA_JWT;

  console.log("Environment check:", { 
    pinataJWT: pinataJWT ? "present" : "missing", 
    databaseUrl: databaseUrl ? "present" : "missing" 
  });

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

// Global storage instance - will be initialized after environment variables are loaded
let storage: IStorage;

export function getStorage(): IStorage {
  if (!storage) {
    storage = createStorage();
  }
  return storage;
}