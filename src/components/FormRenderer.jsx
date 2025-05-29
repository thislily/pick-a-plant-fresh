// src/components/FormRenderer.jsx - JSON-to-React Form Renderer

import { useState, useMemo, useCallback, useEffect } from 'react';
import { validateFormField } from '../utils/formValidator';

/**
 * Generic Form Renderer - Configured Entirely Through JSON
 * Shows systematic approach to form building and state management
 */
export default function FormRenderer({ config, onComplete, onProgress, className = "" }) {
  // Form state management
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized values for performance
  const questions = useMemo(() => config.questions || [], [config]);
  const currentQuestion = useMemo(() => questions[currentStep], [questions, currentStep]);
  const progress = useMemo(() => {
    return questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  }, [currentStep, questions.length]);

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Form step ${currentStep + 1}/${questions.length}`, {
        questionId: currentQuestion?.id,
        questionType: currentQuestion?.type,
        hasResponse: !!responses[currentQuestion?.id]
      });
    }
  }, [currentStep, questions.length, currentQuestion, responses]);

  /**
   * Validates current question response
   * Uses JSON-configured validation rules
   */
  const validateCurrentResponse = useCallback(() => {
    if (!currentQuestion) return false;

    const questionId = currentQuestion.id;
    const response = responses[questionId];
    
    try {
      const error = validateFormField(currentQuestion, response);
      
      if (error) {
        setErrors(prev => ({ ...prev, [questionId]: error }));
        return false;
      } else {
        setErrors(prev => ({ ...prev, [questionId]: null }));
        return true;
      }
    } catch (validationError) {
      setErrors(prev => ({ 
        ...prev, 
        [questionId]: 'Validation error occurred. Please try again.' 
      }));
      return false;
    }
  }, [currentQuestion, responses]);

  /**
   * Handles multiple choice responses
   * Auto-advances to next question like original design
   */
  const handleMultipleChoice = useCallback((option) => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        type: 'multiple_choice',
        selectedOption: option,
        tags: option.tags || [],
        weight: option.weight || 1.0,
        timestamp: Date.now(),
        questionText: currentQuestion.text
      }
    }));

    // Clear any existing errors immediately
    setErrors(prev => ({ ...prev, [questionId]: null }));


    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        onProgress?.(nextStep, questions.length);
      } else {
        // Form complete - use the same logic as handleNext
        if (isSubmitting) return;
        setIsSubmitting(true);
        
        try {
          const allTags = Object.values({...responses, [questionId]: {
            type: 'multiple_choice',
            selectedOption: option,
            tags: option.tags || [],
            weight: option.weight || 1.0,
            timestamp: Date.now(),
            questionText: currentQuestion.text
          }}).flatMap(response => response.tags || []);

          const formData = {
            responses: {...responses, [questionId]: {
              type: 'multiple_choice',
              selectedOption: option,
              tags: option.tags || [],
              weight: option.weight || 1.0,
              timestamp: Date.now(),
              questionText: currentQuestion.text
            }},
            tags: allTags,
            completedAt: Date.now(),
            formVersion: config.formMetadata?.version || '1.0',
            totalQuestions: questions.length
          };

          onComplete(formData);
        } catch (error) {
          console.error('🚨 Form completion error:', error);
          setErrors(prev => ({
            ...prev,
            submission: 'An error occurred while submitting. Please try again.'
          }));
        } finally {
          setIsSubmitting(false);
        }
      }
    }, 500);
  }, [currentQuestion, currentStep, questions.length, onProgress, responses, config, onComplete, isSubmitting]);

  /**
   * Handles slider responses
   * JSON-configured slider with validation
   */
  const handleSlider = useCallback((value) => {
    if (!currentQuestion || !currentQuestion.sliderConfig) return;

    const questionId = currentQuestion.id;
    const config = currentQuestion.sliderConfig;
    
    // Update slider display value
    setSliderValues(prev => ({ ...prev, [questionId]: value }));
    
    // Get corresponding label and tags from JSON config
    const selectedLabel = config.labels[value] || '';
    const selectedTags = config.tags[value] || [];
    const selectedWeight = config.weights?.[value] || 1.0;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        type: 'slider',
        selectedValue: value,
        selectedLabel,
        tags: selectedTags,
        weight: selectedWeight,
        timestamp: Date.now(),
        questionText: currentQuestion.text
      }
    }));

    // Clear errors immediately for sliders
    setErrors(prev => ({ ...prev, [questionId]: null }));

  }, [currentQuestion]);

  /**
   * Handles text input responses
   * Real-time validation with debouncing consideration
   */
  const handleTextInput = useCallback((value) => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        type: 'text',
        value: value.trim(),
        timestamp: Date.now(),
        questionText: currentQuestion.text
      }
    }));

    // Clear errors when user starts typing (UX improvement)
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  }, [currentQuestion, errors]);

  /**
   * Handles form navigation
   * Systematic progression with validation
   */
  const handleNext = useCallback(() => {
    if (!validateCurrentResponse()) {
      console.warn('❌ Cannot proceed: validation failed');
      return;
    }

    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onProgress?.(nextStep, questions.length);
      
    } else {
      // Form complete - prepare final data
      handleFormCompletion();
    }
  }, [currentStep, questions.length, validateCurrentResponse, onProgress]);

  /**
   * Handles form completion
   * Systematic data preparation and submission
   */
  const handleFormCompletion = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Extract all tags for result calculation
      const allTags = Object.values(responses)
        .flatMap(response => response.tags || []);

      // Prepare comprehensive form data
      const formData = {
        responses,
        tags: allTags,
        completedAt: Date.now(),
        formVersion: config.formMetadata?.version || '1.0',
        totalQuestions: questions.length,
        completionTime: calculateCompletionTime(),
        metadata: {
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          formConfig: config.formMetadata
        }
      };

      // Call completion handler
      await onComplete(formData);
      
    } catch (error) {
      console.error('🚨 Form completion error:', error);
      setErrors(prev => ({
        ...prev,
        submission: 'An error occurred while submitting. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [responses, config, questions.length, onComplete, isSubmitting]);

  /**
   * Calculates form completion time
   * Analytics helper for user experience insights
   */
  const calculateCompletionTime = useCallback(() => {
    const timestamps = Object.values(responses)
      .map(r => r.timestamp)
      .filter(t => t);
    
    if (timestamps.length < 2) return null;
    
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);
    
    return {
      totalMs: endTime - startTime,
      totalSeconds: Math.round((endTime - startTime) / 1000),
      averagePerQuestion: Math.round((endTime - startTime) / questions.length / 1000)
    };
  }, [responses, questions.length]);

  /**
   * Renders multiple choice question
   * JSON-configured options with validation
   */
  const renderMultipleChoice = () => {
    if (!currentQuestion.options) return null;

    const questionId = currentQuestion.id;
    const selectedOptionId = responses[questionId]?.selectedOption?.id;

    return (
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleMultipleChoice(option)}
            className={`w-full border-2 text-blush text-lg font-sans px-6 py-4 text-left
                       transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1
                       ${selectedOptionId === option.id 
                         ? 'bg-mist/40 border-mist ring-2 ring-mist/50' 
                         : 'bg-mist/20 hover:bg-mist/30 border-mist/40 hover:border-mist/60'
                       }`}
            style={{ boxShadow: '3px 3px 0px #4a5d70' }}
            aria-pressed={selectedOptionId === option.id}
            aria-describedby={errors[questionId] ? `error-${questionId}` : undefined}
          >
            <span className="block font-medium">{option.text}</span>
            {option.description && (
              <span className="block text-sm text-blush/70 mt-1">{option.description}</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  /**
   * Renders slider question
   * JSON-configured slider with real-time feedback
   */
  const renderSlider = () => {
    if (!currentQuestion.sliderConfig) return null;

    const questionId = currentQuestion.id;
    const config = currentQuestion.sliderConfig;
    const validation = currentQuestion.validation || {};
    const currentValue = sliderValues[questionId] ?? validation.min ?? 0;

    return (
      <div className="space-y-6">
        <div className="px-4">
          {/* Slider Input */}
          <div className="relative mb-6">
            <input
              type="range"
              min={validation.min ?? 0}
              max={validation.max ?? (config.labels.length - 1)}
              step={validation.step ?? 1}
              value={currentValue}
              onChange={(e) => handleSlider(Number(e.target.value))}
              className="w-full h-2 bg-mist/30 appearance-none cursor-pointer slider-custom"
              aria-label={currentQuestion.text}
              aria-describedby={`slider-labels-${questionId}`}
            />
            <style>{`
              .slider-custom::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #FDE2E4;
                border: 3px solid #6C8EAD;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .slider-custom::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #FDE2E4;
                border: 3px solid #6C8EAD;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
            `}</style>
          </div>
          
          {/* Slider Labels */}
          <div id={`slider-labels-${questionId}`} className="flex justify-between text-sm text-blush/70 font-sans mb-6">
            {config.labels.map((label, index) => (
              <span 
                key={index} 
                className={`transition-all duration-200 text-center flex-1 ${
                  index === currentValue ? 'font-bold text-blush scale-110' : ''
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          
          {/* Current Selection Display */}
          <div className="text-center">
            <p className="font-sans font-medium text-xl text-blush mb-6">
              "{config.labels[currentValue] || 'Select a value'}"
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders text input question
   * JSON-configured validation with real-time feedback
   */
  const renderTextInput = () => {
    const questionId = currentQuestion.id;
    const currentValue = responses[questionId]?.value || '';
    const validation = currentQuestion.validation || {};

    return (
      <div className="space-y-4">
        <div className="max-w-md mx-auto">
          <textarea
            value={currentValue}
            onChange={(e) => handleTextInput(e.target.value)}
            placeholder={`Enter your ${currentQuestion.text.toLowerCase().replace('?', '')}...`}
            className={`w-full px-4 py-3 border-2 font-sans text-lg resize-none
                       transition-all duration-200 focus:outline-none
                       ${errors[questionId] 
                         ? 'border-red-500 bg-red-50 focus:border-red-600' 
                         : 'border-mist/40 bg-white focus:border-mist'
                       }`}
            style={{ 
              boxShadow: errors[questionId] 
                ? '3px 3px 0px rgba(239, 68, 68, 0.3)' 
                : '3px 3px 0px rgba(108, 142, 173, 0.3)' 
            }}
            rows={3}
            maxLength={validation.maxLength || 500}
            aria-describedby={`${errors[questionId] ? `error-${questionId}` : ''} char-count-${questionId}`}
          />
          
          {/* Character Count */}
          {validation.maxLength && (
            <div id={`char-count-${questionId}`} className="flex justify-between text-sm text-blush/60 mt-2">
              <span>
                {validation.minLength && `Min: ${validation.minLength} characters`}
              </span>
              <span>
                {currentValue.length} / {validation.maxLength}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle edge cases
  if (!config || !questions.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Configuration Error</h2>
          <p className="text-gray-600">No questions found in form configuration.</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const currentError = errors[currentQuestion.id];
  const hasResponse = !!responses[currentQuestion.id];

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-6 ${className}`}>
      <div 
        className="w-full max-w-2xl bg-forest p-8 text-center"
        style={{
          boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
          minHeight: '600px'
        }}
      >
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-blush font-sans text-sm font-medium">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-blush font-sans text-sm font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-blush/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-mist h-2 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-sans font-medium text-blush leading-relaxed">
            {currentQuestion.text}
          </h2>
          {currentQuestion.description && (
            <p className="text-blush/80 text-base mt-3 font-light">
              {currentQuestion.description}
            </p>
          )}
        </div>

        {/* Error Display */}
        {currentError && (
          <div 
            id={`error-${currentQuestion.id}`}
            className="mb-6 p-4 bg-red-100 border-2 border-red-300 text-red-700 text-sm font-medium"
            style={{ boxShadow: '3px 3px 0px rgba(239, 68, 68, 0.2)' }}
            role="alert"
          >
            {currentError}
          </div>
        )}

        {/* Submission Error */}
        {errors.submission && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 text-red-700 text-sm font-medium">
            {errors.submission}
          </div>
        )}

        {/* Dynamic Question Rendering Based on JSON Config */}
        <div className="mb-8">
          {currentQuestion.type === 'multiple_choice' && renderMultipleChoice()}
          {currentQuestion.type === 'slider' && renderSlider()}
          {currentQuestion.type === 'text' && renderTextInput()}
        </div>

        {/* Next/Submit Button - Only for sliders and text inputs */}
        {(currentQuestion.type === 'slider' || currentQuestion.type === 'text') && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleNext}
              disabled={!hasResponse || isSubmitting}
              className="bg-mist text-white font-sans font-bold text-lg px-8 py-3
                       transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1
                       disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              style={{ boxShadow: '4px 4px 0px #4a5d70' }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : currentStep < questions.length - 1 ? (
                'Next Question →'
              ) : (
                'See My Result →'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}