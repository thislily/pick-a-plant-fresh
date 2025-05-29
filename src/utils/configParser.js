// src/utils/configParser.js - JSON Configuration Parser
// Demonstrates systematic validation and error handling approach

/**
 * Parses and validates form configuration JSON
 * Shows debugging mindset and attention to detail
 */
export const parseFormConfig = (configJson) => {
    console.log('🔍 Starting form configuration validation...');

    try {
        // Step 1: Basic structure validation
        validateBasicStructure(configJson);

        // Step 2: Metadata validation  
        validateMetadata(configJson.formMetadata);

        // Step 3: Questions validation (most complex)
        validateQuestions(configJson.questions);

        // Step 4: Result configuration validation
        validateResultConfig(configJson.resultConfig);

        // Step 5: Lead form validation (if present)
        if (configJson.leadFormConfig) {
            validateLeadFormConfig(configJson.leadFormConfig);
        }

        console.log(`✅ Form config validated successfully: ${configJson.questions.length} questions, version ${configJson.formMetadata.version}`);
        return configJson;

    } catch (error) {
        console.error('❌ Form config validation failed:', error.message);

        // Enhanced error reporting for debugging
        console.group('🐛 Configuration Debug Info');
        console.log('Config keys:', Object.keys(configJson || {}));
        console.log('Questions count:', configJson?.questions?.length || 0);
        console.log('Version:', configJson?.formMetadata?.version || 'undefined');
        console.groupEnd();

        throw new ConfigurationError(error.message, error.details);
    }
};

/**
 * Custom error class for configuration issues
 * Makes debugging easier with structured error info
 */
class ConfigurationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'ConfigurationError';
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Validates basic JSON structure
 * First line of defense against malformed configs
 */
const validateBasicStructure = (config) => {
    if (!config || typeof config !== 'object') {
        throw new Error('Configuration must be a valid JSON object');
    }

    const requiredFields = ['formMetadata', 'questions', 'resultConfig'];
    const missingFields = requiredFields.filter(field => !config[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required top-level fields: ${missingFields.join(', ')}`);
    }

    // Check for unexpected fields (helps catch typos)
    const allowedFields = ['formMetadata', 'styling', 'questions', 'resultConfig', 'leadFormConfig'];
    const unexpectedFields = Object.keys(config).filter(field => !allowedFields.includes(field));

    if (unexpectedFields.length > 0) {
        console.warn('⚠️ Unexpected fields in config:', unexpectedFields.join(', '));
    }
};

/**
 * Validates form metadata
 * Ensures proper versioning and documentation
 */
const validateMetadata = (metadata) => {
    if (!metadata || typeof metadata !== 'object') {
        throw new Error('formMetadata must be an object');
    }

    const requiredFields = ['title', 'description', 'version'];
    const missingFields = requiredFields.filter(field => !metadata[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required metadata fields: ${missingFields.join(', ')}`);
    }

    // Version format validation
    if (!/^\d+\.\d+(\.\d+)?$/.test(metadata.version)) {
        throw new Error('Version must be in semantic versioning format (e.g., "1.0" or "1.0.0")');
    }

    // Title length validation
    if (metadata.title.length < 1 || metadata.title.length > 100) {
        throw new Error('Title must be between 1 and 100 characters');
    }
};

/**
 * Validates questions array - the most complex validation
 * Shows systematic approach to handling different question types
 */
const validateQuestions = (questions) => {
    if (!Array.isArray(questions)) {
        throw new Error('questions must be an array');
    }

    if (questions.length === 0) {
        throw new Error('At least one question is required');
    }

    if (questions.length > 50) {
        throw new Error('Maximum 50 questions allowed');
    }

    const questionIds = new Set();

    questions.forEach((question, index) => {
        const questionNumber = index + 1;

        try {
            // Basic question validation
            validateBasicQuestion(question, questionNumber);

            // Check for duplicate IDs
            if (questionIds.has(question.id)) {
                throw new Error(`Duplicate question ID: ${question.id}`);
            }
            questionIds.add(question.id);

            // Type-specific validation
            switch (question.type) {
                case 'multiple_choice':
                    validateMultipleChoiceQuestion(question);
                    break;
                case 'slider':
                    validateSliderQuestion(question);
                    break;
                case 'text':
                    validateTextQuestion(question);
                    break;
                default:
                    throw new Error(`Unknown question type: ${question.type}`);
            }

        } catch (error) {
            throw new Error(`Question ${questionNumber} (ID: ${question.id || 'undefined'}): ${error.message}`);
        }
    });
};

/**
 * Validates basic question properties
 * Common validation for all question types
 */
const validateBasicQuestion = (question, questionNumber) => {
    const requiredFields = ['id', 'text', 'type'];
    const missingFields = requiredFields.filter(field => !question[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // ID validation - must be a number or string
    if (typeof question.id !== 'number' && typeof question.id !== 'string') {
        throw new Error('Question ID must be a number or string');
    }

    // Text validation
    if (typeof question.text !== 'string' || question.text.trim().length === 0) {
        throw new Error('Question text must be a non-empty string');
    }

    if (question.text.length > 500) {
        throw new Error('Question text must be less than 500 characters');
    }

    // Validation object validation (if present)
    if (question.validation && typeof question.validation !== 'object') {
        throw new Error('validation must be an object');
    }
};

/**
 * Validates multiple choice question structure
 * Shows attention to detail in option validation
 */
const validateMultipleChoiceQuestion = (question) => {
    if (!Array.isArray(question.options)) {
        throw new Error('Multiple choice questions must have an options array');
    }

    if (question.options.length < 2) {
        throw new Error('Multiple choice questions must have at least 2 options');
    }

    if (question.options.length > 10) {
        throw new Error('Multiple choice questions cannot have more than 10 options');
    }

    const optionIds = new Set();

    question.options.forEach((option, index) => {
        if (!option || typeof option !== 'object') {
            throw new Error(`Option ${index + 1} must be an object`);
        }

        const requiredFields = ['id', 'text', 'tags'];
        const missingFields = requiredFields.filter(field => !option[field]);

        if (missingFields.length > 0) {
            throw new Error(`Option ${index + 1} missing fields: ${missingFields.join(', ')}`);
        }

        // Check for duplicate option IDs
        if (optionIds.has(option.id)) {
            throw new Error(`Duplicate option ID: ${option.id}`);
        }
        optionIds.add(option.id);

        // Tags validation
        if (!Array.isArray(option.tags)) {
            throw new Error(`Option ${index + 1}: tags must be an array`);
        }

        if (option.tags.length === 0) {
            throw new Error(`Option ${index + 1}: at least one tag is required`);
        }

        // Weight validation (optional)
        if (option.weight !== undefined && (typeof option.weight !== 'number' || option.weight < 0)) {
            throw new Error(`Option ${index + 1}: weight must be a positive number`);
        }
    });
};

/**
 * Validates slider question configuration
 * Ensures proper slider setup with labels and tags
 */
const validateSliderQuestion = (question) => {
    if (!question.sliderConfig) {
        throw new Error('Slider questions must have sliderConfig');
    }

    const config = question.sliderConfig;
    const requiredFields = ['labels', 'tags'];
    const missingFields = requiredFields.filter(field => !config[field]);

    if (missingFields.length > 0) {
        throw new Error(`sliderConfig missing fields: ${missingFields.join(', ')}`);
    }

    // Labels validation
    if (!Array.isArray(config.labels)) {
        throw new Error('sliderConfig.labels must be an array');
    }

    if (config.labels.length < 2 || config.labels.length > 7) {
        throw new Error('Slider must have between 2 and 7 labels');
    }

    // Tags validation
    if (!Array.isArray(config.tags)) {
        throw new Error('sliderConfig.tags must be an array');
    }

    if (config.tags.length !== config.labels.length) {
        throw new Error('sliderConfig.tags array must have same length as labels array');
    }

    // Each tag entry should be an array
    config.tags.forEach((tagSet, index) => {
        if (!Array.isArray(tagSet)) {
            throw new Error(`sliderConfig.tags[${index}] must be an array`);
        }
    });

    // Validation object validation for sliders
    if (question.validation) {
        const val = question.validation;

        if (val.min !== undefined && (typeof val.min !== 'number' || val.min < 0)) {
            throw new Error('validation.min must be a non-negative number');
        }

        if (val.max !== undefined && (typeof val.max !== 'number' || val.max >= config.labels.length)) {
            throw new Error(`validation.max must be a number less than ${config.labels.length}`);
        }

        if (val.min !== undefined && val.max !== undefined && val.min >= val.max) {
            throw new Error('validation.min must be less than validation.max');
        }
    }
};

/**
 * Validates text question configuration
 * Handles text input validation rules
 */
const validateTextQuestion = (question) => {
    // Text questions can have validation rules
    if (question.validation) {
        const val = question.validation;

        if (val.minLength !== undefined && (typeof val.minLength !== 'number' || val.minLength < 0)) {
            throw new Error('validation.minLength must be a non-negative number');
        }

        if (val.maxLength !== undefined && (typeof val.maxLength !== 'number' || val.maxLength < 1)) {
            throw new Error('validation.maxLength must be a positive number');
        }

        if (val.minLength !== undefined && val.maxLength !== undefined && val.minLength >= val.maxLength) {
            throw new Error('validation.minLength must be less than validation.maxLength');
        }

        if (val.pattern !== undefined && typeof val.pattern !== 'string') {
            throw new Error('validation.pattern must be a string (regex pattern)');
        }
    }
};

/**
 * Validates result configuration
 * Ensures proper result calculation setup
 */
const validateResultConfig = (resultConfig) => {
    if (!resultConfig || typeof resultConfig !== 'object') {
        throw new Error('resultConfig must be an object');
    }

    const requiredFields = ['calculationMethod', 'displayType', 'ctaText', 'restartText'];
    const missingFields = requiredFields.filter(field => !resultConfig[field]);

    if (missingFields.length > 0) {
        throw new Error(`resultConfig missing fields: ${missingFields.join(', ')}`);
    }

    // Validation for specific fields
    const allowedCalculationMethods = ['weighted_tags', 'simple_tags', 'custom'];
    if (!allowedCalculationMethods.includes(resultConfig.calculationMethod)) {
        throw new Error(`calculationMethod must be one of: ${allowedCalculationMethods.join(', ')}`);
    }

    const allowedDisplayTypes = ['polaroid', 'card', 'list', 'custom'];
    if (!allowedDisplayTypes.includes(resultConfig.displayType)) {
        throw new Error(`displayType must be one of: ${allowedDisplayTypes.join(', ')}`);
    }

    // Randomization factor validation (optional)
    if (resultConfig.randomizationFactor !== undefined) {
        const rf = resultConfig.randomizationFactor;
        if (typeof rf !== 'number' || rf < 0 || rf > 1) {
            throw new Error('randomizationFactor must be a number between 0 and 1');
        }
    }
};

/**
 * Validates lead form configuration
 * Shows understanding of complex form validation
 */
const validateLeadFormConfig = (leadFormConfig) => {
    if (!leadFormConfig || typeof leadFormConfig !== 'object') {
        throw new Error('leadFormConfig must be an object');
    }

    const requiredFields = ['title', 'fields', 'submitText'];
    const missingFields = requiredFields.filter(field => !leadFormConfig[field]);

    if (missingFields.length > 0) {
        throw new Error(`leadFormConfig missing fields: ${missingFields.join(', ')}`);
    }

    // Fields validation
    if (!Array.isArray(leadFormConfig.fields)) {
        throw new Error('leadFormConfig.fields must be an array');
    }

    leadFormConfig.fields.forEach((field, index) => {
        validateLeadFormField(field, index + 1);
    });
};

/**
 * Validates individual lead form field
 * Comprehensive field validation for different input types
 */
const validateLeadFormField = (field, fieldNumber) => {
    const requiredFields = ['name', 'type', 'label'];
    const missingFields = requiredFields.filter(f => !field[f]);

    if (missingFields.length > 0) {
        throw new Error(`Lead form field ${fieldNumber} missing: ${missingFields.join(', ')}`);
    }

    // Type validation
    const allowedTypes = ['text', 'email', 'select', 'radio', 'checkbox', 'textarea'];
    if (!allowedTypes.includes(field.type)) {
        throw new Error(`Field ${fieldNumber}: type must be one of ${allowedTypes.join(', ')}`);
    }

    // Options validation for select and radio fields
    if (['select', 'radio'].includes(field.type)) {
        if (!Array.isArray(field.options)) {
            throw new Error(`Field ${fieldNumber}: ${field.type} fields must have options array`);
        }

        field.options.forEach((option, optIndex) => {
            if (option.value === undefined || !option.text) {
                throw new Error(`Field ${fieldNumber}, option ${optIndex + 1}: must have value and text`);
            }
        });
    }

    // Validation rules validation
    if (field.validation) {
        const val = field.validation;

        if (val.pattern && typeof val.pattern !== 'string') {
            throw new Error(`Field ${fieldNumber}: validation.pattern must be a string`);
        }

        if (val.minLength !== undefined && (typeof val.minLength !== 'number' || val.minLength < 0)) {
            throw new Error(`Field ${fieldNumber}: validation.minLength must be a non-negative number`);
        }

        if (val.maxLength !== undefined && (typeof val.maxLength !== 'number' || val.maxLength < 1)) {
            throw new Error(`Field ${fieldNumber}: validation.maxLength must be a positive number`);
        }
    }
};

/**
 * Utility function to safely access nested config properties
 * Helps with debugging configuration access issues
 */
export const getConfigProperty = (config, path, defaultValue = null) => {
    try {
        const keys = path.split('.');
        let current = config;

        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                console.warn(`⚠️ Config property not found: ${path}`);
                return defaultValue;
            }
            current = current[key];
        }

        return current;
    } catch (error) {
        console.error(`❌ Error accessing config property ${path}:`, error);
        return defaultValue;
    }
};

/**
 * Development helper: Logs config structure for debugging
 * Only runs in development mode
 */
export const debugConfig = (config) => {
    if (process.env.NODE_ENV === 'development') {
        console.group('🔧 Configuration Debug Information');
        console.log('Form Title:', config?.formMetadata?.title);
        console.log('Version:', config?.formMetadata?.version);
        console.log('Questions:', config?.questions?.length);
        console.log('Question Types:',
            config?.questions?.map(q => ({ id: q.id, type: q.type })) || []
        );
        console.log('Has Lead Form:', !!config?.leadFormConfig);
        console.groupEnd();
    }
};