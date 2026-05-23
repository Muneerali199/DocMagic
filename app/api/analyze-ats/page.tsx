export default function TestATSPage() {
  const mockData = {
    score: 82,
    analysis: {
      sectionScores: [
        {
          name: "skills",
          score: 70,
          missingKeywords: ["docker", "aws"],
        },
        {
          name: "experience",
          score: 85,
          missingKeywords: [],
        },
      ],
    },
    improvements: {
      critical: ["Add more cloud keywords"],
      recommended: ["Improve formatting"],
      aiSuggestions: ["Quantify achievements"],
    },
  };

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-6">
        ATS Explainability Panel
      </h1>

      <div className="mb-6">
        <h2 className="text-2xl">Overall Score</h2>
        <p className="text-5xl font-bold text-green-400">
          {mockData.score}
        </p>
      </div>

      <div className="space-y-4">
        {mockData.analysis.sectionScores.map((section) => (
          <div
            key={section.name}
            className="border border-gray-700 rounded-xl p-4"
          >
            <div className="flex justify-between mb-2">
              <h3 className="text-xl capitalize">
                {section.name}
              </h3>

              <span>{section.score}%</span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width: `${section.score}%`,
                }}
              />
            </div>

            <div className="mt-3">
              <p className="text-sm text-red-300">
                Missing Keywords:
              </p>

              <div className="flex gap-2 mt-2">
                {section.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-red-500/20 text-red-300 px-2 py-1 rounded"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}