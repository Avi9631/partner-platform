/**
 * Workflow Executor - Direct Execution Fallback
 * 
 * This module routes workflow execution to non-Temporal workflow files
 * when Temporal is disabled or unavailable.
 * 
 * The actual workflow logic is in *-non.workflow.js files which mirror
 * the Temporal workflow files but can run directly without Temporal.
 * 
 * @module temporal/workflowExecutor
 */


// Import non-Temporal workflow implementations from skip-workflow folder

/**
 * Execute a workflow directly without Temporal
 * Routes to the appropriate non-Temporal workflow implementation
 * 
 * @param {string} workflowName - Name of the workflow to execute
 * @param {Object} workflowInput - Input data for the workflow
 * @returns {Promise<Object>} Workflow result
 */
import logger from '../config/winston.config.js';
import { partnerUserOnboarding } from './workflows/skip-workflow/partnerOnboarding-non.workflow.js';
import { partnerBusinessOnboarding } from './workflows/skip-workflow/partnerBusinessOnboarding-non.workflow.js';
import { propertyPublishing } from './workflows/skip-workflow/propertyPublishing-non.workflow.js';
import { developerPublishing } from './workflows/skip-workflow/developerPublishing-non.workflow.js';
import { projectPublishing } from './workflows/skip-workflow/projectPublishing-non.workflow.js';
import { pgHostelPublishing } from './workflows/skip-workflow/pgHostelPublishing-non.workflow.js';

async function executeWorkflowDirect(workflowName, workflowInput) {
    logger.info(`[Direct Execution] Starting workflow: ${workflowName}`);
    logger.debug(`[Direct Execution] Input:`, workflowInput);

    try {
        let result;

        // Route to appropriate workflow implementation
        switch (workflowName) {
            case 'partnerUserOnboarding':
                result = await partnerUserOnboarding(workflowInput);
                break;
            
            case 'partnerBusinessOnboarding':
                result = await partnerBusinessOnboarding(workflowInput);
                break;
            
            case 'propertyPublishing':
                result = await propertyPublishing(workflowInput);
                break;
            
            case 'developerPublishing':
                result = await developerPublishing(workflowInput);
                break;
            
            case 'projectPublishing':
                result = await projectPublishing(workflowInput);
                break;
            
            case 'pgHostelPublishing':
                result = await pgHostelPublishing(workflowInput);
                break;

            default:
                throw new Error(`Unknown workflow: ${workflowName}. Add a case for this workflow or create a ${workflowName}-non.workflow.js file.`);
        }

        logger.info(`[Direct Execution] Workflow completed: ${workflowName}`);
        return {
            success: true,
            workflowId: `direct-${workflowName}-${Date.now()}`,
            result
        };

    } catch (error) {
        logger.error(`[Direct Execution] Workflow failed: ${workflowName}`, error);
        throw error;
    }
}


export { executeWorkflowDirect };
