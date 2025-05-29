// src/utils/formValidator.js - Comprehensive Form Validation
// Demonstrates real-time validation and user-friendly error handling

/**
 * Main validation function for form fields
 * Shows systematic approach to handling different question types
 */
export const validateFormField = (question, response) => {
  // Handle empty/null responses first
  if (isEmptyResponse(response)) {
    return question.required ? `${getFieldDisplayName(question)} is required` : null;
  }

  try {
    // Type-specific validation based on JSON configuration
    switch (question.type) {
      case 'multiple_choice':
        return validateMultipleChoice(question, response);
      
      case 'slider':
        return validateSlider(question, response);
      
      case 'text':
        return validateText(question, response);
      
      case 'email':
        return validateEmail(question, response);
      
      case 'select':
        return validateSelect(question, response);
      
      case 'radio':
        return validateRadio(question, response);
      
      case 'checkbox':
        return validateCheckbox(question, response);
      
      default:
        console.warn(`Unknown question type for validation: ${question.type}`);
        return null;
    }
  } catch (error) {
    console.error(`Validation error for question ${question.id}:`, error);
    return 'Validation error occurred. Please try again.';
  }
};

/**
 * Validates multiple choice responses
 * Ensures proper option selection
 */
const validateMultipleChoice = (question, response) => {
  if (!response.selectedOption) {
    return 'Please select an option';
  }

  // Verify the selected option exists in the question config
  const validOptionIds = question.options.map(opt => opt.id);
  if (!validOptionIds.includes(response.selectedOption.id)) {
    return 'Invalid option selected';
  }

  // Check selection limits from JSON config
  const validation = question.validation || {};
  
  if (validation.minSelections && validation.minSelections > 1) {
    return `Please select at least ${validation.minSelections} options`;
  }

  return null;
};

/**
 * Validates slider responses
 * Ensures value is within configured range
 */
const validateSlider = (question, response) => {
  const value = response.selectedValue;
  
  if (typeof value !== 'number') {
    return 'Please select a value';
  }

  const validation = question.validation || {};
  const min = validation.min !== undefined ? validation.min : 0;
  const max = validation.max !== undefined ? validation.max : (question.sliderConfig?.labels?.length - 1) || 10;

  if (value < min) {
    return `Value must be at least ${min}`;
  }

  if (value > max) {
    return `Value cannot exceed ${max}`;
  }

  // Verify the value corresponds to a valid label
  if (question.sliderConfig?.labels && value >= question.sliderConfig.labels.length) {
    return 'Invalid slider value selected';
  }

  return null;
};

/**
 * Validates text input responses
 * Comprehensive text validation with JSON-defined rules
 */
const validateText = (question, response) => {
  const text = response.value || '';
  const validation = question.validation || {};

  // Length validation
  if (validation.minLength && text.length < validation.minLength) {
    return `Response must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && text.length > validation.maxLength) {
    return `Response must be less than ${validation.maxLength} characters`;
  }

  // Pattern validation (regex from JSON config)
  if (validation.pattern) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(text)) {
        return validation.patternMessage || 'Invalid format';
      }
    } catch (error) {
      console.error('Invalid regex pattern in validation:', validation.pattern);
      return 'Configuration error in validation pattern';
    }
  }

  // Content validation (basic checks)
  if (validation.noSpecialChars && /[<>{}[\]\\\/]/.test(text)) {
    return 'Special characters are not allowed';
  }

  if (validation.alphanumericOnly && !/^[a-zA-Z0-9\s]*$/.test(text)) {
    return 'Only letters, numbers, and spaces are allowed';
  }

  return null;
};

/**
 * Validates email addresses
 * Comprehensive email validation with multiple checks
 */
const validateEmail = (question, response) => {
  const email = response.value || '';
  const validation = question.validation || {};

  // Basic email format validation
  if (!isValidEmailFormat(email)) {
    return 'Please enter a valid email address';
  }

  // Length validation
  if (validation.maxLength && email.length > validation.maxLength) {
    return `Email address must be less than ${validation.maxLength} characters`;
  }

  // Domain validation (if specified)
  if (validation.allowedDomains) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!validation.allowedDomains.includes(domain)) {
      return `Email must be from one of these domains: ${validation.allowedDomains.join(', ')}`;
    }
  }

  // Blocked domains (spam prevention)
  if (validation.blockedDomains) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (validation.blockedDomains.includes(domain)) {
      return 'This email domain is not allowed';
    }
  }

  return null;
};

/**
 * Validates select/dropdown responses
 * Ensures selected value is valid option
 */
const validateSelect = (question, response) => {
  const selectedValue = response.value;
  
  if (!selectedValue || selectedValue === '') {
    return question.required ? 'Please select an option' : null;
  }

  // Verify the selected value exists in options
  const validValues = question.options?.map(opt => opt.value) || [];
  if (!validValues.includes(selectedValue)) {
    return 'Invalid selection';
  }

  return null;
};

/**
 * Validates radio button responses
 * Similar to select but with different UI expectations
 */
const validateRadio = (question, response) => {
  const selectedValue = response.value;
  
  if (!selectedValue) {
    return question.required ? 'Please select an option' : null;
  }

  // Verify the selected value exists in options
  const validValues = question.options?.map(opt => opt.value) || [];
  if (!validValues.includes(selectedValue)) {
    return 'Invalid selection';
  }

  return null;
};

/**
 * Validates checkbox responses
 * Handles multiple selections and min/max constraints
 */
const validateCheckbox = (question, response) => {
  const selectedValues = response.selectedValues || [];
  const validation = question.validation || {};

  if (question.required && selectedValues.length === 0) {
    return 'Please select at least one option';
  }

  // Min/max selection validation
  if (validation.minSelections && selectedValues.length < validation.minSelections) {
    return `Please select at least ${validation.minSelections} options`;
  }

  if (validation.maxSelections && selectedValues.length > validation.maxSelections) {
    return `Please select no more than ${validation.maxSelections} options`;
  }

  // Verify all selected values are valid
  const validValues = question.options?.map(opt => opt.value) || [];
  const invalidSelections = selectedValues.filter(val => !validValues.includes(val));
  
  if (invalidSelections.length > 0) {
    return 'One or more invalid selections detected';
  }

  return null;
};

/**
 * Helper function to check if response is empty
 * Handles different response formats consistently
 */
const isEmptyResponse = (response) => {
  if (!response) return true;
  
  // Different response types have different empty states
  if (response.selectedOption) return false;
  if (response.selectedValue !== undefined && response.selectedValue !== null) return false;
  if (response.value && response.value.trim() !== '') return false;
  if (response.selectedValues && response.selectedValues.length > 0) return false;
  
  return true;
};

/**
 * Helper function to get user-friendly field name
 * Creates better error messages
 */
const getFieldDisplayName = (question) => {
  // Use label if available, otherwise clean up the question text
  if (question.label) return question.label;
  
  // Remove question marks and truncate long questions
  let displayName = question.text.replace(/\?$/, '');
  if (displayName.length > 30) {
    displayName = displayName.substring(0, 30) + '...';
  }
  
  return displayName;
};

/**
 * Email format validation
 * More robust than simple regex
 */
const isValidEmailFormat = (email) => {
  // Multiple validation checks for better accuracy
  
  // Basic format check
  const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicEmailRegex.test(email)) return false;
  
  // Additional checks
  if (email.length > 254) return false; // RFC limit
  if (email.includes('..')) return false; // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false; // No leading/trailing dots
  if (email.includes('@.') || email.includes('.@')) return false; // Invalid dot placement
  
  // Check for valid TLD
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  if (localPart.length > 64) return false; // Local part limit
  if (domain.length < 4) return false; // Minimum domain length
  
  return true;
};

/**
 * Validates entire form response
 * Used for final submission validation
 */
export const validateFormResponse = (questions, responses) => {
  const errors = {};
  let hasErrors = false;

  questions.forEach(question => {
    const response = responses[question.id];
    const error = validateFormField(question, response);
    
    if (error) {
      errors[question.id] = error;
      hasErrors = true;
    }
  });

  return {
    isValid: !hasErrors,
    errors,
    errorCount: Object.keys(errors).length
  };
};

/**
 * Lead form specific validation
 * Handles more complex form fields like contact forms
 */
export const validateLeadFormField = (fieldConfig, value) => {
  if (!fieldConfig) {
    console.error('Field configuration is required for validation');
    return 'Configuration error';
  }

  // Handle empty values
  if (isEmptyLeadFormValue(value)) {
    return fieldConfig.required ? `${fieldConfig.label} is required` : null;
  }

  const validation = fieldConfig.validation || {};

  // Type-specific validation
  switch (fieldConfig.type) {
    case 'text':
    case 'textarea':
      return validateLeadFormText(fieldConfig, value, validation);
    
    case 'email':
      return validateLeadFormEmail(fieldConfig, value, validation);
    
    case 'select':
      return validateLeadFormSelect(fieldConfig, value);
    
    case 'radio':
      return validateLeadFormRadio(fieldConfig, value);
    
    default:
      return null;
  }
};

/**
 * Lead form text validation
 * Enhanced text validation for contact forms
 */
const validateLeadFormText = (fieldConfig, value, validation) => {
  const text = String(value).trim();

  // Length validation
  if (validation.minLength && text.length < validation.minLength) {
    return `${fieldConfig.label} must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && text.length > validation.maxLength) {
    return `${fieldConfig.label} must be less than ${validation.maxLength} characters`;
  }

  // Pattern validation
  if (validation.pattern) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(text)) {
        return validation.patternMessage || `${fieldConfig.label} format is invalid`;
      }
    } catch (error) {
      console.error('Invalid regex in lead form validation:', validation.pattern);
      return 'Validation configuration error';
    }
  }

  // Special validation for name fields
  if (fieldConfig.name === 'name' || fieldConfig.name.includes('name')) {
    if (text.length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (text.length > 50) {
      return 'Name must be less than 50 characters';
    }
    // Allow international characters in names
    const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/;
    if (!nameRegex.test(text)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
  }

  return null;
};

/**
 * Lead form email validation
 * Enhanced email validation for contact forms
 */
const validateLeadFormEmail = (fieldConfig, value, validation) => {
  const email = String(value).toLowerCase().trim();

  if (!isValidEmailFormat(email)) {
    return 'Please enter a valid email address';
  }

  if (validation.maxLength && email.length > validation.maxLength) {
    return 'Email address is too long';
  }

  return null;
};

/**
 * Lead form select validation
 */
const validateLeadFormSelect = (fieldConfig, value) => {
  if (!value || value === '') {
    return fieldConfig.required ? `Please select ${fieldConfig.label.toLowerCase()}` : null;
  }

  const validValues = fieldConfig.options?.map(opt => opt.value) || [];
  if (!validValues.includes(value)) {
    return 'Invalid selection';
  }

  return null;
};

/**
 * Lead form radio validation
 */
const validateLeadFormRadio = (fieldConfig, value) => {
  if (!value) {
    return fieldConfig.required ? `Please select ${fieldConfig.label.toLowerCase()}` : null;
  }

  const validValues = fieldConfig.options?.map(opt => opt.value) || [];
  if (!validValues.includes(value)) {
    return 'Invalid selection';
  }

  return null;
};

/**
 * Helper to check if lead form value is empty
 */
const isEmptyLeadFormValue = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

/**
 * Debounced validation for real-time feedback
 * Prevents excessive validation calls during typing
 */
export const createDebouncedValidator = (validationFn, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        const result = validationFn(...args);
        resolve(result);
      }, delay);
    });
  };
};

/**
 * Batch validation for multiple fields
 * Efficient validation for complex forms
 */
export const validateMultipleFields = (validationTasks) => {
  const results = {};
  let hasErrors = false;

  validationTasks.forEach(({ fieldId, validator, ...args }) => {
    try {
      const error = validator(...args);
      if (error) {
        results[fieldId] = error;
        hasErrors = true;
      }
    } catch (validationError) {
      console.error(`Validation error for field ${fieldId}:`, validationError);
      results[fieldId] = 'Validation error occurred';
      hasErrors = true;
    }
  });

  return {
    isValid: !hasErrors,
    errors: results,
    errorCount: Object.keys(results).length
  };
};

/**
 * Development helper for testing validation
 * Only available in development mode
 */
export const testValidation = (question, testCases) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🧪 Testing validation for question: ${question.text}`);
  
  testCases.forEach(({ name, response, expected }) => {
    const result = validateFormField(question, response);
    const passed = (result === null && expected === null) || (result === expected);
    
    console.log(`${passed ? '✅' : '❌'} ${name}:`, {
      response,
      expected,
      actual: result,
      passed
    });
  });
  
  console.groupEnd();
};