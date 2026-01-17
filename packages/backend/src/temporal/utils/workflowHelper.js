/**
 * Workflow Helper - Simplified workflow execution for controllers
 *
 * This helper provides easy access to workflows whether Temporal is enabled or not.
 * Controllers can use this instead of directly importing temporalClient.
 *
 * @module utils/workflowHelper
 */



/**
 * Execute a workflow directly (skip-workflow mode)
 * Forces direct execution regardless of TEMPORAL_ENABLED setting
 * Useful for testing or when you want to bypass Temporal
 *
 * @param {string} workflowName - Name of the workflow
 * @param {Object} input - Workflow input data
 * @returns {Promise<any>} Workflow result
 */
import { executeWorkflowDirect } from '../workflowExecutor.js';
import logger from '../../config/winston.config.js';

async function runWorkflowDirect(workflowName, input) {
  logger.info(
    `[Workflow Helper] Running ${workflowName} in direct mode (forced)`
  );

  const result = await executeWorkflowDirect(workflowName, input);
  return result.result;
}

// Workflow name constants for easy access
const WORKFLOWS = {
  PARTNER_ONBOARDING: "partnerUserOnboarding",
  PARTNER_BUSINESS_ONBOARDING: "partnerBusinessOnboarding",
  PROPERTY_PUBLISHING: "propertyPublishing",
  DEVELOPER_PUBLISHING: "developerPublishing",
  PROJECT_PUBLISHING: "projectPublishing",
  PG_HOSTEL_PUBLISHING: "pgHostelPublishing",
};

export { runWorkflowDirect, // Utility

  // Constants
  WORKFLOWS };
