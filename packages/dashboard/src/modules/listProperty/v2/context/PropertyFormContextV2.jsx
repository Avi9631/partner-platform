import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getTotalVisibleSteps, getVisibleSteps } from '../config/stepConfiguration';
import { draftApi } from '@/services/draftService';
import { validateAllSteps, validateStep } from '../utils/schemaMapping';

const PropertyFormContextV2 = createContext(null);

/**
 * Helper function to determine which steps are valid
 * Returns a Set of step indices that have valid data according to their Zod schemas
 * Uses pure Zod validation - schemas handle data structure internally
 */
const getCompletedStepsFromData = (formData) => {
  const completedSteps = new Set();
  
  // Extract propertyType (can be at top level or nested)
  const propertyType = formData.propertyType;
  const formDataWithType = { ...formData, propertyType };
  
  const visibleSteps = getVisibleSteps(formDataWithType);

  // Validate each step directly (formData structure matches propertySchema)
  visibleSteps.forEach((step, index) => {
    const validationResult = validateStep(step.id, formDataWithType);
    
    if (validationResult.success) {
      completedSteps.add(index);
      console.log(`✅ Step ${step.id} is valid`);
    } else {
      console.log(`⚠️ Step ${step.id} validation failed:`, validationResult.errors);
    }
  });

  return completedSteps;
};

export const usePropertyFormV2 = () => {
  const context = useContext(PropertyFormContextV2);
  if (!context) {
    throw new Error('usePropertyFormV2 must be used within PropertyFormProviderV2');
  }
  return context;
};

export const PropertyFormProviderV2 = ({ children, onClose, initialDraftId, editingDraft }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyType, setPropertyType] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [draftId, setDraftId] = useState(initialDraftId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({}); // Structure matches propertySchema: { basicDetails: {...}, locationSelection: {...} }
  const [currentStepSubmitHandler, setCurrentStepSubmitHandler] = useState(null);
  const [currentStepIsValid, setCurrentStepIsValid] = useState(true);
  const [areAllStepsValid, setAreAllStepsValid] = useState(false);

  // Load draft data on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!initialDraftId && !editingDraft) return;

      try {
        setIsLoading(true);
        
        let draftData;
        if (initialDraftId) {
          const response = await draftApi.getListingDraftById(initialDraftId);
          draftData = response.success ? response.data?.draftData : null;
        } else if (editingDraft) {
          draftData = editingDraft.draftData || editingDraft.formData;
        }

        if (draftData) {
          // Data from API is already in propertySchema format - use directly
          setFormData(draftData);
          
          // Extract propertyType
          const extractedPropertyType = draftData.propertyType;
          if (extractedPropertyType) {
            setPropertyType(extractedPropertyType);
          }
          
          // Sync completed steps based on draft data
          const completed = getCompletedStepsFromData(draftData);
          setCompletedSteps(completed);
          console.log('✅ Property completed steps synced with draft data:', Array.from(completed));
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [initialDraftId, editingDraft]);

  // Re-sync completed steps whenever formData changes (for update case)
  // This ensures the sidebar step status stays in sync with actual data
  useEffect(() => {
    // Only re-sync if we have form data (not during initial render)
    if (formData && Object.keys(formData).length > 0) {
      const completed = getCompletedStepsFromData(formData);
      setCompletedSteps(completed);
      console.log('🔄 Property completed steps re-synced with form data:', Array.from(completed));
    }
  }, [formData, propertyType]);

  const formDataWithType = useMemo(() => {
    return {
      ...formData,
      propertyType,
    };
  }, [formData, propertyType]);

  // Validate all steps whenever formData or propertyType changes
  useEffect(() => {
    const visibleSteps = getVisibleSteps(formDataWithType);
    const validationResult = validateAllSteps(visibleSteps, formDataWithType);
    setAreAllStepsValid(validationResult.allValid);
    
    if (!validationResult.allValid) {
      console.log('⚠️ Invalid steps:', validationResult.invalidSteps);
    } else {
      console.log('✅ All steps are valid');
    }
  }, [formDataWithType]);

  const getTotalSteps = useCallback(() => {
    return getTotalVisibleSteps(formDataWithType);
  }, [formDataWithType]);

  /**
   * Update form data for a specific step
   * @param {string} stepId - The ID of the step (e.g., 'basic-details')
   * @param {Object} stepData - The data for that matches propertySchema key, e.g., 'basicDetails')
   * @param {Object} stepData - The data for that step
   */
  const updateFormData = useCallback((stepId, stepData) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        ...stepData,
      }
    }));
    
    console.log(`📝 Updated form data for step: ${stepId}`, stepData);
  }, []);

  // Simplified draft save - data already in propertySchema format
  const saveDraft = useCallback(async (updatedData) => {
    try {
      const dataToSave = updatedData || formData;
      
      console.log('💾 Saving draft in propertySchema format:', dataToSave);
      
      // Create draft if none exists
      if (!draftId) {
        const createResponse = await draftApi.createListingDraft({ status: 'draft' });
        if (createResponse.success && createResponse.data?.draftId) {
          const newDraftId = createResponse.data.draftId;
          setDraftId(newDraftId);
          const response = await draftApi.updateListingDraft(newDraftId, dataToSave);
          return { success: response.success, draftId: newDraftId };
        }
        return { success: false, message: 'Failed to create draft' };
      }
      
      // Update existing draft - data already in propertySchema format
      const response = await draftApi.updateListingDraft(draftId, dataToSave);
      return { success: response.success, draftId };
    } catch (error) {
      console.error('Save draft error:', error);
      return { success: false, error: error.message };
    }
  }, [draftId, formData]);

  const saveAndContinue = useCallback(async (stepData, stepId) => {
    // Get current step ID from visible steps
    const visibleSteps = getVisibleSteps(formDataWithType);
    const currentStepId = stepId || visibleSteps[currentStep]?.id;
    
    console.log('💾 saveAndContinue called');
    console.log('  Step ID:', currentStepId);
    console.log('  Step data:', stepData);
    
    if (!currentStepId) {
      console.error('Could not determine current step ID');
      return;
    }
    
    // Special handling for propertyType - it's a simple value, not a nested object
    let updatedFormData;
    if (currentStepId === 'propertyType') {
      updatedFormData = {
        ...formData,
        propertyType: stepData.propertyType
      };
      // Update context state
      setPropertyType(stepData.propertyType);
    } else {
      // For all other steps, use nested structure
      updatedFormData = {
        ...formData,
        [currentStepId]: {
          ...(formData[currentStepId] || {}),
          ...stepData,
        }
      };
      updateFormData(currentStepId, stepData);
    }
    
    console.log('  Updated form data:', updatedFormData);
    
    // Wait for draft to save before proceeding
    const result = await saveDraft(updatedFormData);
    if (!result.success) {
      console.error('Failed to save draft:', result.error);
      // Still continue even if save fails (user can retry later)
    }
    
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    const totalSteps = getTotalSteps();
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, getTotalSteps, updateFormData, formData, saveDraft, formDataWithType, setPropertyType]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const goToStep = useCallback((step) => setCurrentStep(step), []);

  const resetForm = useCallback(() => {
    setFormData({});
    setCurrentStep(0);
    setPropertyType(null);
    setCompletedSteps(new Set());
    setDraftId(null);
  }, []);

  const isStepCompleted = useCallback((step) => completedSteps.has(step), [completedSteps]);

  const getProgress = useCallback(() => {
    const totalSteps = getTotalSteps();
    return totalSteps <= 1 ? 0 : Math.round((currentStep / (totalSteps - 1)) * 100);
  }, [currentStep, getTotalSteps]);

  /**
   * Get data for a specific step
   * @param {string} stepId - The step ID
   * @returns {Object} The step's data
   */
  const getStepData = useCallback((stepId) => {
    return formData[stepId] || {};
  }, [formData]);

  const value = {
    currentStep,
    setCurrentStep,
    saveAndContinue,
    previousStep,
    goToStep,
    resetForm,
    getTotalSteps,
    propertyType,
    setPropertyType,
    completedSteps,
    isStepCompleted,
    getProgress,
    onClose,
    formData,
    updateFormData,
    formDataWithType,
    getStepData,
    draftId,
    setDraftId,
    saveDraft,
    isLoading,
    currentStepSubmitHandler,
    setCurrentStepSubmitHandler,
    currentStepIsValid,
    setCurrentStepIsValid,
    areAllStepsValid,
  };

  return (
    <PropertyFormContextV2.Provider value={value}>
      {children}
    </PropertyFormContextV2.Provider>
  );
};
