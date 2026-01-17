/**
 * Activities Index
 * 
 * Central registry for all activity implementations.
 * Import and export all activities from their respective domain modules.
 * 
 * @module temporal/activities
 */

// User activities

// Wallet activities

// Developer activities

// PG/Colive/Hostel activities

// Property activities

// Project activities

 
/**
 * Export all activities
 * 
 * All activities are exported as a flat object for easy registration
 * with the Temporal worker. Activities are namespaced by their domain
 * in separate files but exported together for worker configuration.
 */
import userActivities from './user.activities.js';
import partnerOnboardingActivities from './partnerOnboarding.activities.js';
import partnerBusinessOnboardingActivities from './partnerBusinessOnboarding.activities.js';
import walletActivities from './wallet.activities.js';
import developerPublishingActivities from './developerPublishing.activities.js';
import pgHostelPublishingActivities from './pgHostelPublishing.activities.js';
import propertyPublishingActivities from './propertyPublishing.activities.js';
import projectPublishingActivities from './projectPublishing.activities.js';

export { // User activities
    ...userActivities, // Partner onboarding activities
    ...partnerOnboardingActivities, // Partner business onboarding activities
    ...partnerBusinessOnboardingActivities, // Wallet activities
    ...walletActivities, // Developer publishing activities
    ...developerPublishingActivities, // PG/Colive/Hostel publishing activities
    ...pgHostelPublishingActivities, // Property publishing activities
    ...propertyPublishingActivities, // Project publishing activities
    ...projectPublishingActivities };
