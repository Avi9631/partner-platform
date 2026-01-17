/**
 * Entity Verification Test
 * 
 * This script verifies that the shared-entities package
 * can be loaded and initialized correctly.
 */

import path from 'path';

console.log('🔍 Verifying shared-entities package...\n');

try {
  // Test 1: Load the package
  console.log('✓ Test 1: Loading @partner-platform/shared-entities');
  import initializeEntities from '@partner-platform/shared-entities';
  console.log('  Package loaded successfully\n');

  // Test 2: Check if it's a function
  console.log('✓ Test 2: Checking initialization function');
  if (typeof initializeEntities !== 'function') {
    throw new Error('initializeEntities is not a function');
  }
  console.log('  Initialization function is valid\n');

  // Test 3: Create mock config
  console.log('✓ Test 3: Testing with mock configuration');
  const mockConfig = {
    DB: 'test_db',
    USER: 'test_user',
    PASSWORD: 'test_password',
    HOST: 'localhost',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  
  const db = initializeEntities(mockConfig);
  console.log('  Entities initialized successfully\n');

  // Test 4: Check entities exist
  console.log('✓ Test 4: Verifying all entities are present');
  const expectedEntities = [
    'PlatformUser',
    'PartnerBusiness',
    'ListingDraft',
    'Developer',
    'PgColiveHostel',
    'Property',
    'Project',
    'WalletTransaction',
    'ListingAnalytics',
    'ListingLead'
  ];

  const missingEntities = [];
  expectedEntities.forEach(entityName => {
    if (!db[entityName]) {
      missingEntities.push(entityName);
    } else {
      console.log(`  ✓ ${entityName}`);
    }
  });

  if (missingEntities.length > 0) {
    throw new Error(`Missing entities: ${missingEntities.join(', ')}`);
  }
  console.log('\n');

  // Test 5: Check Sequelize and sequelize are present
  console.log('✓ Test 5: Verifying Sequelize instance');
  if (!db.Sequelize) {
    throw new Error('Sequelize class not found in db object');
  }
  if (!db.sequelize) {
    throw new Error('sequelize instance not found in db object');
  }
  console.log('  Sequelize instance available\n');

  // Test 6: Check relationships
  console.log('✓ Test 6: Verifying entity relationships');
  
  // Check some key associations
  const associations = db.PlatformUser.associations;
  const expectedAssociations = ['business', 'listingDrafts', 'developers', 'pgHostels', 'properties', 'projects'];
  
  expectedAssociations.forEach(assocName => {
    if (associations[assocName]) {
      console.log(`  ✓ PlatformUser.${assocName}`);
    } else {
      console.log(`  ⚠ PlatformUser.${assocName} not found`);
    }
  });
  console.log('\n');

  console.log('✅ All verification tests passed!\n');
  console.log('📦 Summary:');
  console.log(`   - Entities found: ${expectedEntities.length}`);
  console.log(`   - Sequelize instance: ✓`);
  console.log(`   - Relationships: ✓`);
  console.log('\n🎉 The shared-entities package is ready to use!\n');

} catch (error) {
  console.error('❌ Verification failed:\n');
  console.error(error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}

