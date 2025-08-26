-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Applications
CREATE TABLE business_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id VARCHAR UNIQUE NOT NULL,
  company_name VARCHAR NOT NULL,
  sugef_rating VARCHAR(2) NOT NULL,
  amount_requested DECIMAL(15,2) NOT NULL,
  industry VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'submitted',
  years_in_business INTEGER,
  number_of_employees INTEGER,
  new_business BOOLEAN DEFAULT FALSE,
  jobs_to_create INTEGER DEFAULT 0,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  ml_score DECIMAL(5,2),
  ml_recommendation VARCHAR(20),
  risk_level VARCHAR(20)
);

-- Application Decisions
CREATE TABLE application_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES business_applications(id),
  final_decision VARCHAR(20) NOT NULL,
  decision_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decision_reason TEXT,
  decision_notes TEXT,
  analyst_id UUID REFERENCES users(id),
  approved_amount DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Model Runs
CREATE TABLE ml_model_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES business_applications(id),
  model_version VARCHAR NOT NULL,
  input_features JSONB NOT NULL,
  prediction_score DECIMAL(5,2) NOT NULL,
  prediction_recommendation VARCHAR(20) NOT NULL,
  confidence_score DECIMAL(5,2),
  run_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mlflow_run_id VARCHAR
);

-- AI Chat Sessions
CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR UNIQUE NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Uploads
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES business_applications(id),
  file_name VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_data JSONB,
  processing_status VARCHAR DEFAULT 'pending'
);

-- RAG: Document Embeddings for Vector Search
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES business_applications(id),
  document_id UUID REFERENCES document_uploads(id),
  content_chunk TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RAG: Application Knowledge Base
CREATE TABLE application_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES business_applications(id),
  knowledge_type VARCHAR NOT NULL, -- 'company_info', 'financial_data', 'risk_assessment'
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_knowledge ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view their own applications" ON business_applications
  FOR SELECT USING (auth.uid()::text = created_by::text);

CREATE POLICY "Analysts can view all applications" ON business_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role IN ('analyst', 'manager', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_business_applications_created_date ON business_applications(created_date DESC);
CREATE INDEX idx_business_applications_status ON business_applications(status);
CREATE INDEX idx_business_applications_sugef ON business_applications(sugef_rating);
CREATE INDEX idx_document_embeddings_application ON document_embeddings(application_id);
CREATE INDEX idx_application_knowledge_application ON application_knowledge(application_id);

-- Vector indexes for similarity search
CREATE INDEX idx_document_embeddings_vector ON document_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_application_knowledge_vector ON application_knowledge USING ivfflat (embedding vector_cosine_ops);
