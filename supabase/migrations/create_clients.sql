-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  architect_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  cpf_cnpj VARCHAR(20),
  address TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
  invite_token VARCHAR(255) UNIQUE,
  invite_sent_at TIMESTAMP,
  registered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_architect ON clients(architect_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_invite_token ON clients(invite_token);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Create unique constraint for architect + email
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_architect_email ON clients(architect_id, email);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Architects can only see their own clients
CREATE POLICY "Architects can view their own clients"
  ON clients
  FOR SELECT
  USING (architect_id = auth.uid());

-- Policy: Architects can insert their own clients
CREATE POLICY "Architects can insert their own clients"
  ON clients
  FOR INSERT
  WITH CHECK (architect_id = auth.uid());

-- Policy: Architects can update their own clients
CREATE POLICY "Architects can update their own clients"
  ON clients
  FOR UPDATE
  USING (architect_id = auth.uid());

-- Policy: Architects can delete their own clients
CREATE POLICY "Architects can delete their own clients"
  ON clients
  FOR DELETE
  USING (architect_id = auth.uid());

-- Policy: Allow public access to validate invite tokens (for registration)
CREATE POLICY "Public can view clients by invite token"
  ON clients
  FOR SELECT
  USING (invite_token IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at_trigger
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- Create client_projects table for future use
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  project_folder_id VARCHAR(255),
  cloud_provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_projects_client ON client_projects(client_id);

-- Enable RLS for client_projects
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Architects can manage projects for their clients
CREATE POLICY "Architects can manage their clients' projects"
  ON client_projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_projects.client_id
      AND clients.architect_id = auth.uid()
    )
  );
