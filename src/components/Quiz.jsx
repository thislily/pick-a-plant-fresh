// src/components/Quiz.jsx
import { useState } from 'react';
import { questions } from '../data/quizQuestions';

export default function Quiz({ onFinish }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sliderValue, setSliderValue] = useState(1);

  const handleAnswer = (tags) => {
    setAnswers((prev) => [...prev, ...tags]);
    setSliderValue(1);
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleSliderSubmit = () => {
    const tagSet = questions[currentQuestion].range[sliderValue]?.tags || [];
    handleAnswer(tagSet);
  };

  if (currentQuestion >= questions.length) {
    onFinish(answers);
    return null;
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush via-white to-mist/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-forest/70 font-sans text-sm font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-forest/70 font-sans text-sm font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-forest to-mist h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-3xl font-hand text-forest mb-8 text-center leading-relaxed">
            {q.text}
          </h2>

          {q.type === 'multiple' && (
            <div className="space-y-4">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.tags)}
                  className="group w-full bg-gradient-to-r from-white to-blush/30 hover:from-blush/50 hover:to-mist/30 
                           text-forest text-lg font-sans px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl 
                           border border-white/50 hover:border-forest/20 
                           transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-1
                           text-left"
                >
                  <span className="group-hover:text-forest/90 transition-colors duration-200">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {q.type === 'slider' && (
            <div className="space-y-8">
              <div className="px-4">
                <div className="relative mb-6">
                  <input
                    type="range"
                    min="0"
                    max={q.range.length - 1}
                    step="1"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blush to-mist rounded-lg appearance-none cursor-pointer
                             focus:outline-none focus:ring-4 focus:ring-forest/20"
                  />
                  <style jsx>{`
                    input[type="range"]::-webkit-slider-thumb {
                      appearance: none;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: #294A38;
                      border: 4px solid white;
                      box-shadow: 0 4px 12px rgba(41, 74, 56, 0.3);
                      cursor: pointer;
                      transition: all 0.2s ease;
                    }
                    input[type="range"]::-webkit-slider-thumb:hover {
                      transform: scale(1.2);
                      box-shadow: 0 6px 20px rgba(41, 74, 56, 0.4);
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: #294A38;
                      border: 4px solid white;
                      box-shadow: 0 4px 12px rgba(41, 74, 56, 0.3);
                      cursor: pointer;
                    }
                  `}</style>
                </div>
                
                <div className="flex justify-between text-sm text-forest/70 font-sans mb-6">
                  {q.range.map((item, index) => (
                    <span 
                      key={index} 
                      className={`transition-all duration-200 ${
                        index === sliderValue ? 'font-bold text-forest text-base scale-110' : ''
                      }`}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="font-hand text-2xl text-forest mb-6">
                  "{q.range[sliderValue].label}"
                </p>
                <button
                  onClick={handleSliderSubmit}
                  className="bg-gradient-to-r from-forest to-mist hover:from-forest/90 hover:to-mist/90
                           text-white font-sans font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl
                           transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1"
                >
                  Next Question →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}