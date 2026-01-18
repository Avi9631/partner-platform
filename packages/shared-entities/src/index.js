/**
 * Shared Entities Library
 * 
 * This module initializes all Sequelize entities and their relationships
 * for the Partner Platform monorepo.
 * 
 * Usage:
 *   import Sequelize from 'sequelize';
 *   import initializeEntities from '@partner-platform/shared-entities';
 *   
 *   // Initialize Sequelize with your app-specific configuration
 *   const sequelize = new Sequelize(database, username, password, {
 *     host: 'localhost',
 *     dialect: 'postgres',
 *     pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
 *     // ... other app-specific options
 *   });
 *   
 *   // Initialize entities with your Sequelize instance
 *   const db = initializeEntities(sequelize);
 *   
 *   // Access entities
 *   const { PlatformUser, Property, Developer } = db;
 */

import Sequelize from 'sequelize';
import PlatformUserEntity from './entities/PlatformUser.entity.js';
import PartnerBusinessEntity from './entities/PartnerBusiness.entity.js';
import ListingDraftEntity from './entities/ListingDraft.entity.js';
import DeveloperEntity from './entities/Developer.entity.js';
import PgColiveHostelEntity from './entities/PgColiveHostel.entity.js';
import PropertyEntity from './entities/Property.entity.js';
import ProjectEntity from './entities/Project.entity.js';
import WalletTransactionEntity from './entities/WalletTransaction.entity.js';
import ListingAnalyticsEntity from './entities/ListingAnalytics.entity.js';
import ListingLeadEntity from './entities/ListingLead.entity.js';

/**
 * Initialize entities with Sequelize instance
 * @param {Object} sequelize - Initialized Sequelize instance from the application
 * @returns {Object} db - Database object with all entities and sequelize instance
 */
export default function initializeEntities(sequelize) {
  // Validate that a Sequelize instance was passed
  if (!sequelize || typeof sequelize.define !== 'function') {
    throw new Error('initializeEntities requires a valid Sequelize instance. Please pass an initialized Sequelize instance from your application.');
  }

  const db = {};

  db.Sequelize = Sequelize;
  db.sequelize = sequelize;

  // Initialize all entities
  db.PlatformUser = PlatformUserEntity(sequelize, Sequelize);
  db.PartnerBusiness = PartnerBusinessEntity(sequelize, Sequelize);
  db.ListingDraft = ListingDraftEntity(sequelize, Sequelize);
  db.Developer = DeveloperEntity(sequelize, Sequelize);
  db.PgColiveHostel = PgColiveHostelEntity(sequelize, Sequelize);
  db.Property = PropertyEntity(sequelize, Sequelize);
  db.Project = ProjectEntity(sequelize, Sequelize);
  db.WalletTransaction = WalletTransactionEntity(sequelize, Sequelize);
  db.ListingAnalytics = ListingAnalyticsEntity(sequelize, Sequelize);
  db.ListingLead = ListingLeadEntity(sequelize, Sequelize);

  // Define all relationships
  
  // User has one PartnerBusiness (for BUSINESS account type)
  db.PlatformUser.hasOne(db.PartnerBusiness, {
    foreignKey: 'user_id',
    as: 'business'
  });

  // PartnerBusiness belongs to User
  db.PartnerBusiness.belongsTo(db.PlatformUser, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User has many ListingDrafts
  db.PlatformUser.hasMany(db.ListingDraft, {
    foreignKey: 'user_id',
    as: 'listingDrafts'
  });

  // ListingDraft belongs to User
  db.ListingDraft.belongsTo(db.PlatformUser, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User has many Developer profiles
  db.PlatformUser.hasMany(db.Developer, {
    foreignKey: 'user_id',
    as: 'developers'
  });

  // Developer belongs to User
  db.Developer.belongsTo(db.PlatformUser, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Developer verified by User (admin/system)
  db.Developer.belongsTo(db.PlatformUser, {
    foreignKey: 'verified_by',
    as: 'verifier'
  });

  // Developer belongs to ListingDraft (via draft_id)
  db.Developer.belongsTo(db.ListingDraft, {
    foreignKey: 'draft_id',
    as: 'draft'
  });

  // ListingDraft has one Developer (published from this draft)
  db.ListingDraft.hasOne(db.Developer, {
    foreignKey: 'draft_id',
    as: 'publishedDeveloper'
  });

  // User has many PgColiveHostel profiles
  db.PlatformUser.hasMany(db.PgColiveHostel, {
    foreignKey: 'user_id',
    as: 'pgHostels'
  });

  // PgColiveHostel belongs to User
  db.PgColiveHostel.belongsTo(db.PlatformUser, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // PgColiveHostel belongs to ListingDraft (via draft_id)
  db.PgColiveHostel.belongsTo(db.ListingDraft, {
    foreignKey: 'draft_id',
    as: 'draft'
  });

  // ListingDraft has one PgColiveHostel (published from this draft)
  db.ListingDraft.hasOne(db.PgColiveHostel, {
    foreignKey: 'draft_id',
    as: 'publishedPgHostel'
  });

  // User has many Property profiles
  db.PlatformUser.hasMany(db.Property, {
    foreignKey: 'created_by',
    as: 'properties'
  });

  // Property belongs to User (creator)
  db.Property.belongsTo(db.PlatformUser, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // Property belongs to ListingDraft (via draft_id)
  db.Property.belongsTo(db.ListingDraft, {
    foreignKey: 'draft_id',
    as: 'draft'
  });

  // ListingDraft has one Property (published from this draft)
  db.ListingDraft.hasOne(db.Property, {
    foreignKey: 'draft_id',
    as: 'publishedProperty'
  });

  // Property belongs to Project (optional)
  db.Property.belongsTo(db.Project, {
    foreignKey: 'project_id',
    as: 'project'
  });

  // Project has many Properties
  db.Project.hasMany(db.Property, {
    foreignKey: 'project_id',
    as: 'properties'
  });

  // User has many Projects
  db.PlatformUser.hasMany(db.Project, {
    foreignKey: 'created_by',
    as: 'projects'
  });

  // Project belongs to User (creator)
  db.Project.belongsTo(db.PlatformUser, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // User has many WalletTransactions
  db.PlatformUser.hasMany(db.WalletTransaction, {
    foreignKey: 'user_id',
    as: 'walletTransactions'
  });

  // WalletTransaction belongs to User
  db.WalletTransaction.belongsTo(db.PlatformUser, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // ListingAnalytics belongs to User (viewer)
  db.ListingAnalytics.belongsTo(db.PlatformUser, {
    foreignKey: 'viewer_id',
    as: 'viewer'
  });

  // User has many ListingAnalytics
  db.PlatformUser.hasMany(db.ListingAnalytics, {
    foreignKey: 'viewer_id',
    as: 'listingAnalytics'
  });

  // Note: ListingAnalytics uses polymorphic association for Property, Project, PgColiveHostel, and Developer
  // The relationship is determined by listing_type and listing_id fields

  // ListingLead belongs to User (partner/owner)
  db.ListingLead.belongsTo(db.PlatformUser, {
    foreignKey: 'partner_id',
    as: 'partner'
  });

  // User has many ListingLeads
  db.PlatformUser.hasMany(db.ListingLead, {
    foreignKey: 'partner_id',
    as: 'listingLeads'
  });

  // Note: ListingLead also uses polymorphic association for Property, Project, PgColiveHostel, and Developer
  // The relationship is determined by listing_type and listing_id fields

  return db;
};

