// src/components/Result.jsx - Enhanced with localStorage
import { plants } from '../data/plantData';
import { useState, useMemo, useEffect } from 'react';
import LeadFormModal from './LeadFormModal';

export default function Result({ answers, onRestart, isReturningUser = false, savedPlant = null }) {
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Use saved plant if returning user, otherwise calculate new one
  const { selectedItem, topPlant } = useMemo(() => {
    if (isReturningUser && savedPlant) {
      console.log('Using saved plant for returning user:', savedPlant.name);
      // Return saved plant for returning users
      const mockSelectedItem = { rawScore: 0, plant: savedPlant };
      return { selectedItem: mockSelectedItem, topPlant: savedPlant };
    }

    console.log('Calculating new plant match...');
    // Normal plant selection logic for new results
    const scoreMap = {};

    answers.forEach(tag => {
      plants.forEach(plant => {
        if (plant.tags.includes(tag)) {
          scoreMap[plant.name] = (scoreMap[plant.name] || 0) + 1;
        }
      });
    });

    const normalizedScores = plants.map(plant => {
      const rawScore = scoreMap[plant.name] || 0;
      const normalizedScore = plant.tags.length > 0 ? rawScore / plant.tags.length : 0;
      return {
        plant,
        rawScore,
        normalizedScore,
        finalScore: normalizedScore + (Math.random() * 0.1)
      };
    });

    normalizedScores.sort((a, b) => b.finalScore - a.finalScore);

    const topScore = normalizedScores[0].finalScore;
    const topCandidates = normalizedScores.filter(item =>
      Math.abs(item.finalScore - topScore) < 0.15
    );

    const selectedItem = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const topPlant = selectedItem.plant;

    console.log('Selected plant:', topPlant.name);
    return { selectedItem, topPlant };
  }, [answers, isReturningUser, savedPlant]);

  // Save result to localStorage (only for NEW results, not returning users)
  useEffect(() => {
    if (!isReturningUser && topPlant && answers) {
      const resultData = {
        plant: topPlant,
        answers: answers,
        timestamp: Date.now(),
        ctaClicked: false
      };

      try {
        localStorage.setItem('plantQuizResult', JSON.stringify(resultData));
        console.log('Saved result to localStorage:', topPlant.name);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [topPlant, answers, isReturningUser]);

  // Handle CTA click - mark as used in localStorage
  const handleCTAClick = () => {
    console.log('CTA clicked - marking result as used');

    try {
      const saved = localStorage.getItem('plantQuizResult');
      if (saved) {
        const parsedResult = JSON.parse(saved);
        parsedResult.ctaClicked = true;
        parsedResult.ctaClickedAt = Date.now();
        localStorage.setItem('plantQuizResult', JSON.stringify(parsedResult));
        console.log('Marked result as used in localStorage');
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    setShowLeadForm(true);
  };

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-forest p-8 text-center"
          style={{
            boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
            minHeight: '600px'
          }}>

          {/* Different header for returning users */}
          <div className="mb-8">
            {isReturningUser ? (
              <>
                <h2 className="text-2xl font-sans font-bold text-blush mb-2">
                  Welcome back!
                </h2>
                <h3 className="text-3xl font-bold text-blush mb-6"
                  style={{ fontFamily: 'Rubik Mono One, monospace' }}>
                  {topPlant.name.toUpperCase()}<br />
                  <span className="text-xl font-sans font-medium">is still waiting for you!</span>
                </h3>
              </>
            ) : (
              <h2 className="text-3xl font-sans font-bold text-blush mb-6">
                Your plant match is...
              </h2>
            )}
          </div>

          {/* Polaroid Plant Result */}
          <div className="mb-8">
            <div className="bg-white p-4 mx-auto max-w-sm"
              style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>

              <div className="bg-gray-100 mb-4 aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src={`/plants/${topPlant.image}`}
                  alt={topPlant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center flex-col">
                  <span className="text-4xl mb-2">🪴</span>
                  <span className="font-medium text-gray-600"
                    style={{ fontFamily: 'Rubik Mono One, monospace' }}>
                    {topPlant.name}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2"
                  style={{ fontFamily: 'Rubik Mono One, monospace' }}>
                  {topPlant.name}
                </h3>
                <p className="text-sm font-sans text-gray-600 leading-relaxed">
                  {topPlant.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center items-center">
            <button
              onClick={handleCTAClick}
              className="bg-mist text-white font-sans font-bold text-lg px-8 py-3
                       transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
              style={{ boxShadow: '4px 4px 0px #4a5d70' }}
            >
              {isReturningUser ? 'Get my plant now!' : 'Get this plant now!'}
            </button>

            <button
              onClick={onRestart}
              className="border-2 border-blush hover:border-blush text-blush font-sans font-medium px-6 py-3 mt-2
                       transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
              style={{ boxShadow: '3px 3px 0px rgba(253, 226, 228, 0.5)' }}
            >
              {isReturningUser ? 'Pick a Different Plant' : 'Pick Again'}
            </button>
          </div>


        </div>
      </div>

      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        plantName={topPlant.name}
      />
    </>
  );
}