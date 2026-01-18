/**
 * Backend Database Initialization
 * 
 * Initializes shared entities with backend database configuration.
 * This file acts as the backend's entry point to the shared entity layer.
 */

import Sequelize from 'sequelize';
import dbConfig from '../config/db.config.js';
import initializeEntities from '@partner-platform/shared-entities';

// Initialize Sequelize instance with application-specific configuration
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false, // Disable SQL logging in production (enable for debugging)
  port: dbConfig.port,
  dialectOptions: dbConfig.dialectOptions,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  define: {
    freezeTableName: true, // Prevents Sequelize from pluralizing table names
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
});

// Initialize entities with the configured Sequelize instance
const db = initializeEntities(sequelize);

export default db;
