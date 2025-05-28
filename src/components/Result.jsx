import { plants } from '../data/plantData';

export default function Result({ answers, onRestart }) {
  const scoreMap = {};
  
  // Calculate base scores
  answers.forEach(tag => {
    plants.forEach(plant => {
      if (plant.tags.includes(tag)) {
        scoreMap[plant.name] = (scoreMap[plant.name] || 0) + 1;
      }
    });
  });

  // Normalize scores to account for plants with different numbers of tags
  const normalizedScores = plants.map(plant => {
    const rawScore = scoreMap[plant.name] || 0;
    const normalizedScore = plant.tags.length > 0 ? rawScore / plant.tags.length : 0;
    return {
      plant,
      rawScore,
      normalizedScore,
      // Add small random factor to break ties and add variety
      finalScore: normalizedScore + (Math.random() * 0.1)
    };
  });

  // Sort by final score and get top candidates
  normalizedScores.sort((a, b) => b.finalScore - a.finalScore);
  
  // Get all plants with the highest score (in case of ties)
  const topScore = normalizedScores[0].finalScore;
  const topCandidates = normalizedScores.filter(item => 
    Math.abs(item.finalScore - topScore) < 0.15 // Allow for small variations
  );

  // Randomly select from top candidates
  const selectedItem = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  const topPlant = selectedItem.plant;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-forest p-8 text-center"
           style={{
             boxShadow: '6px 6px 0px rgba(0,0,0,0.3)',
             minHeight: '600px' // Keep consistent size
           }}>
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-sans font-bold text-blush mb-6">
            Your plant match is...
          </h2>
        </div>

        {/* Polaroid Plant Result */}
        <div className="mb-8">
          <div className="bg-white p-4 mx-auto max-w-sm"
               style={{
                 boxShadow: '6px 6px 0px rgba(0,0,0,0.2)'
               }}>
            {/* Plant Image */}
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
              {/* Fallback for missing images */}
              <div className="hidden w-full h-full bg-gray-200 items-center justify-center flex-col">
                <span className="text-4xl mb-2">🪴</span>
                <span className="font-medium text-gray-600" style={{ fontFamily: 'Rubik Mono One, monospace' }}>
                  {topPlant.name}
                </span>
              </div>
            </div>
            
            {/* Polaroid White Section */}
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-2"
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
            onClick={() => {
              // TODO: Open lead form modal or redirect to lead form
              alert('Lead form would open here!');
            }}
            className="bg-mist text-white font-sans font-bold text-lg px-8 py-3
                     transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
            style={{
              boxShadow: '4px 4px 0px #4a5d70'
            }}
          >
            🌱 Get this plant now!
          </button>
          
          <button
            onClick={onRestart}
            className="border-2 border-blush hover:border-blush text-blush font-sans font-medium px-6 py-3 mt-2
                     transition-all duration-200 ease-out transform hover:translate-x-1 hover:translate-y-1"
            style={{
              boxShadow: '3px 3px 0px rgba(253, 226, 228, 0.5)'
            }}
          >
            Pick Again
          </button>
        </div>
      </div>
    </div>
  );
}