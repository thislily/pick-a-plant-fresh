// src/App.jsx
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
      <div className="min-h-screen bg-gradient-to-br from-blush via-white to-mist/20 flex flex-col items-center justify-center p-6">
        {/* Welcome Card */}
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/50">
          {/* Header */}
         <div className="bg-test text-white p-4">
  Config Test - should be bright red
</div>
          <div className="mb-8">
            <h1 className="text-6xl font-hand text-forest mb-4 leading-tight">
              🌱 Pick a Plant 🌱
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-forest to-mist rounded-full mx-auto mb-6"></div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <p className="text-xl font-sans text-forest/80 leading-relaxed max-w-lg mx-auto">
              Take our quiz to discover which leafy companion matches your vibe. 
              <span className="block mt-2 text-lg text-forest/60 italic">
                Will you get a dramatic Henrik or a chill Bo?
              </span>
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-gradient-to-br from-blush/30 to-white/50 rounded-2xl p-4 border border-white/50">
              <div className="text-2xl mb-2">🌿</div>
              <div className="font-sans text-sm text-forest/70">
                <strong className="text-forest">10 unique plants</strong><br />
                Each with their own personality
              </div>
            </div>
            <div className="bg-gradient-to-br from-mist/30 to-white/50 rounded-2xl p-4 border border-white/50">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-sans text-sm text-forest/70">
                <strong className="text-forest">4 fun questions</strong><br />
                Quick & personality-based
              </div>
            </div>
            <div className="bg-gradient-to-br from-forest/20 to-white/50 rounded-2xl p-4 border border-white/50">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-sans text-sm text-forest/70">
                <strong className="text-forest">Perfect match</strong><br />
                Based on your unique vibe
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setQuizStarted(true)}
            className="bg-gradient-to-r from-forest to-mist hover:from-forest/90 hover:to-mist/90
                     text-white font-sans font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl
                     transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-2
                     border-2 border-white/20"
          >
            Start Quiz →
          </button>

          {/* Fun subtitle */}
          <p className="mt-6 text-forest/50 font-sans text-sm italic">
            Takes less than 2 minutes ⏱️
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce">🌱</div>
        <div className="absolute bottom-10 right-10 text-3xl opacity-20 animate-pulse">🪴</div>
        <div className="absolute top-1/2 left-5 text-2xl opacity-10 animate-ping">🌿</div>
      </div>
    );
  }

  if (!answers) {
    return <Quiz onFinish={handleFinish} />;
  }

  return <Result answers={answers} onRestart={restartQuiz} />;
}

export default App;