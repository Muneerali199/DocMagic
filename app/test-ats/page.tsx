export default function TestATSPage() {
  const mockData = {
    score: 82,

    analysis: {
      sectionScores: [
        {
          name: "skills",
          score: 82,
          missingKeywords: ["docker", "aws"],
        },

        {
          name: "experience",
          score: 74,
          missingKeywords: ["leadership"],
        },

        {
          name: "education",
          score: 91,
          missingKeywords: [],
        },

        {
          name: "projects",
          score: 68,
          missingKeywords: ["nextjs", "typescript"],
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-6">
        ATS Explainability Panel
      </h1>

      <div className="space-y-6">
        {mockData.analysis.sectionScores.map((section) => (
          <div
            key={section.name}
            className="border border-zinc-700 rounded-xl p-6"
          >
            <div className="flex justify-between mb-3">
              <h2 className="text-2xl font-semibold capitalize">
                {section.name}
              </h2>

              <span className="text-green-400 font-bold">
                {section.score}%
              </span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{
                  width: `${section.score}%`,
                }}
              />
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
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
        ))}
      </div>
    </div>
  );
}