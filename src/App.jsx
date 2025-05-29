// src/App.jsx - Complete JSON-Configured Form System

import { useState, useEffect } from 'react';
import FormRenderer from './components/FormRenderer';
import Result from './components/Result';
import formConfig from './config/formConfig.json';
import { parseFormConfig, debugConfig } from './utils/configParser';
import Footer from './components/Footer';

function App() {
  const [appState, setAppState] = useState('loading'); // loading, ready, form, result, error
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [savedResult, setSavedResult] = useState(null);

  /**
   * Initialize application with JSON configuration
   * Shows systematic approach to configuration loading and error handling
   */
  useEffect(() => {
    const initializeApp = async () => {

      try {
        // Step 1: Parse and validate JSON configuration
        const validatedConfig = parseFormConfig(formConfig);
        setConfig(validatedConfig);

        // Step 2: Debug configuration in development
        debugConfig(validatedConfig);

        // Step 3: Check for saved results (returning user detection)
        checkForSavedResults();

        // Step 4: Ready to show landing page
        setAppState('ready');

      } catch (error) {
        console.error('❌ Failed to initialize form system:', error);
        setConfigError(error.message);
        setAppState('error');
      }
    };

    initializeApp();
  }, []);

  /**
   * Check for saved results from previous sessions
   */
  const checkForSavedResults = () => {
    try {
      const saved = localStorage.getItem('plantQuizResult');
      if (saved) {
        const parsedResult = JSON.parse(saved);

        // Only use saved result if it's recent and hasn't been used
        const isRecent = Date.now() - parsedResult.timestamp < 7 * 24 * 60 * 60 * 1000;

        if (isRecent && !parsedResult.ctaClicked) {
          setSavedResult(parsedResult);
          return;
        } else {
          localStorage.removeItem('plantQuizResult');
        }
      }
    } catch (error) {
      console.error('⚠️ Error loading saved result:', error);
      localStorage.removeItem('plantQuizResult');
    }
  };

  /**
   * Handles form completion
   * Systematic data processing and result calculation
   */
  const handleFormComplete = (completedFormData) => {
    try {

      // Store form data for result calculation
      setFormData(completedFormData);
      setAppState('result');

      // Analytics logging (would integrate with real analytics in production)
      logFormCompletion(completedFormData);

    } catch (error) {
      console.error('🚨 Error processing form completion:', error);
      setConfigError('An error occurred while processing your responses. Please try again.');
      setAppState('error');
    }
  };

  /**
   * Handles form progress updates
   * Used for analytics and user experience optimization
   */
  const handleFormProgress = (currentStep, totalSteps) => {
    const progressPercent = (currentStep / totalSteps) * 100;

    // Could integrate with analytics here
    // analytics.track('form_progress', { step: currentStep, total: totalSteps, percent: progressPercent });
  };

  /**
   * Restarts the entire form experience
   * Clean state reset with localStorage cleanup
   */
  const handleRestart = () => {

    // Clear all state
    setFormData(null);
    setSavedResult(null);
    setAppState('ready');

    // Clear saved data
    try {
      localStorage.removeItem('plantQuizResult');
    } catch (error) {
      console.warn('⚠️ Could not clear localStorage:', error);
    }

    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Starts new form session
   * Clean transition from landing to form
   */
  const handleStartForm = () => {

    // Clear any existing saved data
    try {
      localStorage.removeItem('plantQuizResult');
    } catch (error) {
      console.warn('⚠️ Could not clear localStorage:', error);
    }

    setSavedResult(null);
    setAppState('form');
  };

  /**
   * Analytics helper for form completion
   * Would integrate with real analytics service in production
   */
  const logFormCompletion = (data) => {
    const analyticsData = {
      event: 'form_completed',
      form_version: data.formVersion,
      total_questions: data.totalQuestions,
      completion_time_seconds: data.metadata?.completionTime?.totalSeconds,
      tags_collected: data.tags.length,
      unique_tags: [...new Set(data.tags)].length,
      timestamp: data.completedAt,
      user_agent: data.metadata?.userAgent,
      screen_size: data.metadata?.screenSize
    };


    // In production, would send to analytics service:
    // analytics.track('form_completed', analyticsData);
  };

  // Loading State
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌱</div>
          <h2 className="text-xl font-sans font-medium text-gray-800 mb-2">
            Loading Form Configuration...
          </h2>
          <p className="text-gray-600 text-sm">
            Parsing JSON configuration and validating form structure
          </p>
        </div>
      </div>
    );
  }

  // Configuration Error State
  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-red-50 border-2 border-red-200 p-8 text-center"
          style={{ boxShadow: '6px 6px 0px rgba(239, 68, 68, 0.2)' }}>

          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 mb-3">Configuration Error</h2>
          <div className="bg-red-100 p-4 mb-4 text-left">
            <code className="text-sm text-red-700 font-mono break-words">
              {configError}
            </code>
          </div>
          <p className="text-red-600 mb-4 text-sm">
            Please check the form configuration file and reload the page.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white font-sans font-bold px-6 py-2 
                     transition-all duration-200 hover:bg-red-700
                     transform hover:translate-x-1 hover:translate-y-1"
            style={{ boxShadow: '3px 3px 0px rgba(153, 27, 27, 0.6)' }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show saved result for returning users
  if (savedResult && appState === 'ready') {

    return (
      <Result
        answers={savedResult.answers || savedResult.tags || []}
        onRestart={handleRestart}
        isReturningUser={true}
        savedPlant={savedResult.plant}
      />
    );
  }

  // Show form results
  if (appState === 'result' && formData) {
    return (
      <Result
        answers={formData.tags}
        onRestart={handleRestart}
      />
    );
  }

  // Show active form
  if (appState === 'form') {
    return (
      <FormRenderer
        config={config}
        onComplete={handleFormComplete}
        onProgress={handleFormProgress}
      />
    );
  }

  // Landing Page (Default State)
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-forest p-8 text-center"
        style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}>

        {/* Dynamic Title from JSON Config */}
        <div className="mb-6">
          <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight uppercase text-blush"
            style={{
              fontFamily: 'Rubik Mono One, monospace',
              letterSpacing: '0.2em'
            }}>
            {config?.formMetadata?.title?.toUpperCase() || 'FORM SYSTEM'}
          </h1>
        </div>

        {/* Dynamic Description from JSON Config */}
        <div className="mb-8">
          <p className="text-xl font-sans text-white font-light leading-relaxed">
            {config?.formMetadata?.description || 'Powered by JSON configuration'}
          </p>
        </div>

        {/* Plant Illustration Section */}
        <div className="mb-12">
          <div className="h-40 w-full border-2 border-mist overflow-hidden flex items-center justify-center">
            <img
              className="w-full h-full object-cover object-top"
              src="/plants/plant-group-shot.jpg"
              alt="Plant collection"
            />
          </div>
        </div>

        {/* Start Button */}
        <div className="mb-6">
          <button
            onClick={handleStartForm}
            className="bg-mist text-white font-sans font-bold text-xl px-12 py-4 
                     transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
            style={{ boxShadow: '4px 4px 0px #4a5d70' }}
          >
            Start Quiz
          </button>
        </div>

        {/* Time Estimate */}
        <p className="text-white/80 font-sans text-base italic">
          Takes less than 2 minutes!
        </p>
      </div>
      <Footer />

      {/* Debug Info for Development */}
    </div>
  );
}

export default App;