import React, { useState } from 'react';
import { LayoutGrid, FileText, Share2, Presentation, ArrowRight, Code, Terminal } from 'lucide-react';

interface HubData {
  resume: { projectTitle: string; bulletPoints: string[] };
  diagram: { syntax: string };
  presentation: { title: string; slides: { slideNumber: number; heading: string; content: string[] }[] };
  letter: { justificationText: string };
}

export default function PortfolioHub() {
  const [projectInput, setProjectInput] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'diagram' | 'presentation' | 'letter'>('resume');
  const [generatedData, setGeneratedData] = useState<HubData | null>(null);

  const handleOrchestrate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectInput, githubUrl, targetRole }),
      });
      const result = await res.json();
      if (result.success) {
        setGeneratedData(result.data);
      } else {
        alert('Error parsing compilation assets.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Portfolio Hub & Case Study Orchestrator</h1>
        <p className="text-slate-500 mt-1">Input once. Instantly seed cross-functional professional assets for your ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Configuration Panel */}
        <form onSubmit={handleOrchestrate} className="lg:col-span-5 bg-white p-6 rounded-xl border shadow-sm space-y-5 h-fit">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Terminal className="w-5 h-5 text-indigo-600" /> Source Context Engine
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Summary / Architecture Details</label>
            <textarea
              className="w-full min-h-[140px] p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="Describe features, problems solved, scaling choices, systems infrastructure..."
              value={projectInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectInput(e.target.value)}
              required={!githubUrl}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Public GitHub URL (Optional)</label>
            <input
              type="url"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="https://github.com/user/repository"
              value={githubUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Application Role</label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="e.g., Senior Full Stack Engineer"
              value={targetRole}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetRole(e.target.value)}
            />
          </div>

          {/* FIX: Corrected "display-flex" to standard Tailwind layout class "flex" */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Synthesizing Orchestration Vectors...' : 'Generate Multi-Tool Assets'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Centralized Output Dashboard */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 border flex flex-col min-h-[500px]">
          {generatedData ? (
            <>
              {/* Tool Navigation Headings */}
              <div className="flex border-b bg-white rounded-t-lg overflow-x-auto text-sm font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('resume')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${activeTab === 'resume' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
                >
                  <FileText className="w-4 h-4" /> Resume Module
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diagram')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${activeTab === 'diagram' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
                >
                  <Code className="w-4 h-4" /> Architecture Diagrams
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presentation')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${activeTab === 'presentation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
                >
                  <Presentation className="w-4 h-4" /> Slide Deck Outlines
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('letter')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${activeTab === 'letter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}
                >
                  <Share2 className="w-4 h-4" /> Cover Letter
                </button>
              </div>

              {/* Dynamic Content Frame panels */}
              <div className="p-5 flex-1 bg-white rounded-b-lg border-x border-b overflow-y-auto">
                {activeTab === 'resume' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">{generatedData.resume.projectTitle}</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-700">
                      {generatedData.resume.bulletPoints.map((bp, index) => (
                        <li key={index} className="text-sm leading-relaxed">{bp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'diagram' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-mono bg-slate-100 p-2 rounded">Generated Mermaid Syntax Engine Payload</p>
                    <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
                      {generatedData.diagram.syntax}
                    </pre>
                  </div>
                )}

                {activeTab === 'presentation' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800">{generatedData.presentation.title}</h3>
                    <div className="space-y-3">
                      {generatedData.presentation.slides.map((slide) => (
                        <div key={slide.slideNumber} className="border p-3 rounded-lg bg-slate-50">
                          <span className="text-xs font-bold text-indigo-600 block mb-1">Slide {slide.slideNumber}: {slide.heading}</span>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                            {slide.content.map((pt, idx) => <li key={idx}>{pt}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'letter' && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Role Alignment Context Integration:</h3>
                    <p className="text-slate-600 text-sm leading-relaxed italic bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      "{generatedData.letter.justificationText}"
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center m-auto p-6">
              <LayoutGrid className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">Orchestration Board is idle</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Provide your raw architecture inputs on the left panel to populate synchronous ecosystem components instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}