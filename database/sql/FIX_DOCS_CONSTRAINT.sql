-- FIX: Remove the hardcoded category constraint to allow dynamic folders
ALTER TABLE organization_docs DROP CONSTRAINT IF EXISTS organization_docs_category_check;
