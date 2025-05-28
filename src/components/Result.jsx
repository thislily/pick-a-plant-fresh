// src/components/Result.jsx
import { plants } from '../data/plantData';

export default function Result({ answers, onRestart }) {
  const scoreMap = {};
  answers.forEach(tag => {
    plants.forEach(plant => {
      if (plant.tags.includes(tag)) {
        scoreMap[plant.name] = (scoreMap[plant.name] || 0) + 1;
      }
    });
  });

  const topPlant = plants.reduce((best, plant) => {
    const score = scoreMap[plant.name] || 0;
    return score > (scoreMap[best.name] || 0) ? plant : best;
  }, plants[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush via-white to-mist/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Result Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block bg-gradient-to-r from-forest to-mist text-white px-6 py-2 rounded-full font-sans font-semibold text-sm mb-4">
              🌱 Quiz Complete! 🌱
            </div>
            <h2 className="text-4xl font-hand text-forest mb-2">
              Your plant match is...
            </h2>
          </div>

          {/* Plant Name - Big Reveal */}
          <div className="mb-8">
            <h3 className="text-5xl font-hand text-forest mb-4 animate-pulse">
              {topPlant.name}
            </h3>
          </div>

          {/* Plant Image */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-forest/20 to-mist/20 rounded-3xl blur-xl"></div>
              <img
                src={`/plants/${topPlant.image}`}
                alt={topPlant.name}
                className="relative mx-auto max-h-80 w-auto rounded-3xl shadow-2xl border-4 border-white
                         hover:scale-105 transition-transform duration-300 ease-out"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback for missing images */}
              <div className="hidden mx-auto max-h-80 w-80 rounded-3xl shadow-2xl border-4 border-white
                            bg-gradient-to-br from-blush to-mist/30 items-center justify-center flex-col">
                <span className="text-6xl mb-4">🪴</span>
                <span className="font-hand text-2xl text-forest">{topPlant.name}</span>
              </div>
            </div>
          </div>

          {/* Plant Description */}
          <div className="mb-8">
            <p className="text-xl font-sans text-forest/80 leading-relaxed italic">
              "{topPlant.description}"
            </p>
          </div>

          {/* Plant Tags */}
          <div className="mb-8">
            <h4 className="font-sans font-semibold text-forest/70 mb-4 text-sm uppercase tracking-wide">
              Plant Personality Traits
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {topPlant.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-blush/60 to-mist/60 text-forest 
                           rounded-full text-sm font-sans font-medium shadow-md
                           hover:from-blush/80 hover:to-mist/80 transition-colors duration-200
                           border border-white/50"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onRestart}
              className="bg-gradient-to-r from-forest to-mist hover:from-forest/90 hover:to-mist/90
                       text-white font-sans font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl
                       transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1
                       flex items-center gap-2"
            >
              <span>🌿</span>
              Pick Again
            </button>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'My Plant Match!',
                    text: `I got ${topPlant.name}! ${topPlant.description}`,
                    url: window.location.href
                  });
                } else {
                  // Fallback - copy to clipboard
                  navigator.clipboard.writeText(`I got ${topPlant.name}! ${topPlant.description}`);
                  alert('Result copied to clipboard!');
                }
              }}
              className="bg-white/50 hover:bg-white/80 text-forest font-sans font-medium px-6 py-3 rounded-2xl 
                       shadow-lg hover:shadow-xl border border-forest/20 hover:border-forest/40
                       transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1
                       flex items-center gap-2"
            >
              <span>📤</span>
              Share Result
            </button>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="mt-6 text-center">
          <p className="text-forest/60 font-sans text-sm">
            Based on your answers, you matched {scoreMap[topPlant.name] || 0} personality traits with {topPlant.name}!
          </p>
        </div>
      </div>
    </div>
  );
}