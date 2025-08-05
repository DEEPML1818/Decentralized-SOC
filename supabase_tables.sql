
-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  client_name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  client_wallet VARCHAR(255),
  assigned_analyst VARCHAR(255),
  assigned_certifier VARCHAR(255),
  affected_systems TEXT,
  attack_vectors TEXT,
  evidence_urls TEXT,
  ai_analysis TEXT,
  transaction_hash VARCHAR(66),
  block_number INTEGER,
  gas_used VARCHAR(50),
  contract_address VARCHAR(42),
  ticket_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incident_reports table
CREATE TABLE IF NOT EXISTS incident_reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_systems TEXT,
  attack_vectors TEXT,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  client_name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  evidence_urls TEXT,
  ai_analysis TEXT,
  assigned_analyst VARCHAR(255),
  assigned_certifier VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  client_wallet VARCHAR(255),
  transaction_hash VARCHAR(66),
  block_number INTEGER,
  gas_used VARCHAR(50),
  contract_address VARCHAR(42),
  ticket_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_client_wallet ON tickets(client_wallet);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_client_wallet ON incident_reports(client_wallet);
CREATE INDEX IF NOT EXISTS idx_incident_reports_created_at ON incident_reports(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON tickets FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON tickets FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON incident_reports FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON incident_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON incident_reports FOR UPDATE USING (true);
