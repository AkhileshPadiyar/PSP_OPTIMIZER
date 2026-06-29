-- PSPOPTIMIZER_LITE Database Schema
-- Database name: psp_optimizer_db

CREATE DATABASE IF NOT EXISTS psp_optimizer_db;
USE psp_optimizer_db;

-- 1. Plant Settings table
CREATE TABLE IF NOT EXISTS plant_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plant_name VARCHAR(255) NOT NULL,
  efficiency_rate DECIMAL(5,2) NOT NULL,
  max_storage_mwh DECIMAL(10,2) NOT NULL,
  min_storage_mwh DECIMAL(10,2) NOT NULL,
  current_storage_mwh DECIMAL(10,2) NOT NULL
);

-- 2. Market Tariffs table
CREATE TABLE IF NOT EXISTS market_tariffs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tariff_date DATE NOT NULL,
  hour_block INT NOT NULL,
  price_per_mwh_inr DECIMAL(10,2) NOT NULL,
  UNIQUE KEY unique_tariff (tariff_date, hour_block)
);

-- 3. Optimization Schedules table
CREATE TABLE IF NOT EXISTS optimization_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_date DATE NOT NULL,
  hour_block INT NOT NULL,
  price_per_mwh_inr DECIMAL(10,2) NOT NULL,
  recommended_action VARCHAR(50) NOT NULL,
  resulting_storage_mwh DECIMAL(10,2) NOT NULL,
  calculated_revenue_inr DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_schedule (run_date, hour_block)
);

-- Seed plant_settings with default row
INSERT INTO plant_settings (id, plant_name, efficiency_rate, max_storage_mwh, min_storage_mwh, current_storage_mwh)
VALUES (1, 'Tehri PSP Unit-1', 0.80, 1000.00, 100.00, 500.00)
ON DUPLICATE KEY UPDATE
  plant_name = VALUES(plant_name),
  efficiency_rate = VALUES(efficiency_rate),
  max_storage_mwh = VALUES(max_storage_mwh),
  min_storage_mwh = VALUES(min_storage_mwh),
  current_storage_mwh = VALUES(current_storage_mwh);
