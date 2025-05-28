import { useState } from 'react';
import Quiz from './components/Quiz';
import Result from './components/Result';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState(null);

  const handleFinish = (tags) => {
    setAnswers(tags);
  };

  const restartQuiz = () => {
    setAnswers(null);
    setQuizStarted(false);
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        {/* Square Card with Sharp Shadow */}
        <div className="w-full max-w-2xl bg-forest p-8 text-center"
             style={{
               boxShadow: '6px 6px 0px rgba(0,0,0,0.3)'
             }}>
          
          {/* Title with crisp blocky font */}
          <div className="mb-6">
            <h1 className="text-6xl font-black mb-4 leading-tight uppercase text-blush"
                style={{ 
                  fontFamily: 'Rubik Mono One, monospace',
                  letterSpacing: '0.2em'
                }}>
              PICK A<br />PLANT
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mb-8">
            <p className="text-xl font-sans text-white font-light leading-relaxed">
              Discover which leafy companion<br />matches your vibe
            </p>
          </div>

          {/* Plant Illustrations Strip */}
          <div className="mb-8">
            <div className="bg-blush/20 p-6 mx-auto">
              {/* Placeholder for your long plant illustration */}
              <div className="h-24 bg-white/20 flex items-center justify-center">
                <p className="text-blush/60 font-sans text-xs">Your plant illustration strip will go here</p>
              </div>
            </div>
          </div>

          {/* Start Button with Block Shadow */}
          <div className="mb-6">
            <button
              onClick={() => setQuizStarted(true)}
              className="bg-mist text-white font-sans font-bold text-xl px-12 py-4 
                       transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
              style={{
                boxShadow: '4px 4px 0px #4a5d70'
              }}
            >
              Start Quiz
            </button>
          </div>

          {/* Subtitle */}
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