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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-forest p-8 text-center"
           style={{
             boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
             minHeight: '600px' // Keep consistent size
           }}>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-blush font-sans text-sm font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-blush font-sans text-sm font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-blush/20 h-2">
            <div 
              className="bg-mist h-2 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-sans font-medium text-blush leading-relaxed">
            {q.text}
          </h2>
        </div>

        {q.type === 'multiple' && (
          <div className="space-y-3">
            {/* Reverse order for question 3 (index 2) */}
            {(currentQuestion === 2 ? [...q.options].reverse() : q.options).map((opt, idx) => (
              <button
                key={opt.text}
                onClick={() => handleAnswer(opt.tags)}
                className="w-full bg-mist/20 hover:bg-mist/30 border-2 border-mist/40 hover:border-mist/60
                         text-blush text-lg font-sans px-6 py-4 text-left
                         transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
                style={{
                  boxShadow: '3px 3px 0px #4a5d70'
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {q.type === 'slider' && (
          <div className="space-y-6">
            <div className="px-4">
              <div className="relative mb-6">
                <input
                  type="range"
                  min="0"
                  max={q.range.length - 1}
                  step="1"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-mist/30 appearance-none cursor-pointer"
                />
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FDE2E4;
                    border: 2px solid #6C8EAD;
                    cursor: pointer;
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FDE2E4;
                    border: 2px solid #6C8EAD;
                    cursor: pointer;
                  }
                `}</style>
              </div>
              
              <div className="flex justify-between text-sm text-blush/70 font-sans mb-6">
                {q.range.map((item, index) => (
                  <span 
                    key={index} 
                    className={`transition-all duration-200 ${
                      index === sliderValue ? 'font-bold text-blush' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="font-sans font-medium text-xl text-blush mb-6">
                "{q.range[sliderValue].label}"
              </p>
              <button
                onClick={handleSliderSubmit}
                className="bg-mist text-white font-sans font-bold text-lg px-8 py-3
                         transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
                style={{
                  boxShadow: '4px 4px 0px #4a5d70'
                }}
              >
                Next Question →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}