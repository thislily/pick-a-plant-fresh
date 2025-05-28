// src/App.jsx - Enhanced with localStorage
import { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import Result from './components/Result';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState(null);
  const [savedResult, setSavedResult] = useState(null);

  // Check for saved results on app load
  useEffect(() => {
    const checkSavedResult = () => {
      try {
        const saved = localStorage.getItem('plantQuizResult');
        if (saved) {
          const parsedResult = JSON.parse(saved);
          
          // Only use saved result if:
          // 1. It's recent (within 7 days)
          // 2. User hasn't clicked CTA yet
          const isRecent = Date.now() - parsedResult.timestamp < 7 * 24 * 60 * 60 * 1000;
          
          if (isRecent && !parsedResult.ctaClicked) {
            console.log('Found valid saved result:', parsedResult.plant.name);
            setSavedResult(parsedResult);
            setAnswers(parsedResult.answers); // Restore answers for result calculation
            return;
          } else {
            console.log('Clearing old/used result');
            localStorage.removeItem('plantQuizResult');
          }
        }
      } catch (error) {
        console.error('Error loading saved result:', error);
        localStorage.removeItem('plantQuizResult');
      }
    };

    checkSavedResult();
  }, []);

  const handleFinish = (tags) => {
    setAnswers(tags);
  };

  const restartQuiz = () => {
    // Clear localStorage when restarting
    console.log('Clearing localStorage and restarting quiz');
    localStorage.removeItem('plantQuizResult');
    setSavedResult(null);
    setAnswers(null);
    setQuizStarted(false);
  };

  const startNewQuiz = () => {
    // Clear localStorage when starting new quiz
    console.log('Starting fresh quiz');
    localStorage.removeItem('plantQuizResult');
    setSavedResult(null);
    setQuizStarted(true);
  };

  // Show saved result if returning user
  if (savedResult && answers) {
    console.log('Showing saved result for returning user');
    return <Result 
      answers={answers} 
      onRestart={restartQuiz} 
      isReturningUser={true}
      savedPlant={savedResult.plant}
    />;
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-forest p-8 text-center"
             style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}>
          
          <div className="mb-6">
            <h1 className="text-6xl font-black mb-4 leading-tight uppercase text-blush"
                style={{ 
                  fontFamily: 'Rubik Mono One, monospace',
                  letterSpacing: '0.2em'
                }}>
              PICK A<br />PLANT
            </h1>
          </div>

          <div className="mb-8">
            <p className="text-xl font-sans text-white font-light leading-relaxed">
              Discover which leafy companion<br />matches your vibe
            </p>
          </div>

          <div className="mb-12">
            <div className="bg-blush/20 p-6 mx-auto">
              <div className="h-24 bg-white/20 flex items-center justify-center">
                <p className="text-blush/60 font-sans text-xs">Your plant illustration strip will go here</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={startNewQuiz}
              className="bg-mist text-white font-sans font-bold text-xl px-12 py-4 
                       transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
              style={{ boxShadow: '4px 4px 0px #4a5d70' }}
            >
              Start Quiz
            </button>
          </div>

          <p className="text-white/80 font-sans text-base">
            Takes less than 2 minutes!
          </p>
        </div>
      </div>
    );
  }

  if (!answers) {
    return <Quiz onFinish={handleFinish} />;
  }

  return <Result answers={answers} onRestart={restartQuiz} />;
}

export default App;