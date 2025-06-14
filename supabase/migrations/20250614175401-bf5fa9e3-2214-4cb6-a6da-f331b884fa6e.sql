
-- Add is_active column to organizations table
ALTER TABLE organizations 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add is_active column to concepts table  
ALTER TABLE concepts
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add is_active column to stores table
ALTER TABLE stores 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for better performance on filtering by is_active
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_concepts_is_active ON concepts(is_active);
CREATE INDEX idx_stores_is_active ON stores(is_active);
