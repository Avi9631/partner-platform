
// Initialize entities with database configuration
import dbConfig from '../config/db.config.js';
import initializeEntities from '@partner-platform/shared-entities';

const db = initializeEntities(dbConfig);

export default db;
