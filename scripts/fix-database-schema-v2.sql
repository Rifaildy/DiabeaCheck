-- Fix database schema for prediction_history table
-- Run this script to add missing columns

USE diabeacheck_db;

-- First, let's see the current table structure
DESCRIBE prediction_history;

-- Add missing session_id column if it doesn't exist
ALTER TABLE prediction_history 
ADD COLUMN session_id VARCHAR(100) AFTER user_id;

-- Verify the change
DESCRIBE prediction_history;

-- Show sample data to verify
SELECT COUNT(*) as total_records FROM prediction_history;
