import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function fetchGitHubMetaData(repoUrl: string) {
  try {
    const urlPattern = /github\.com\/([^/]+)\/([^/]+)/;
    const match = repoUrl.match(urlPattern);
    if (!match) return null;

    const [_, owner, repo] = match;
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'Draftdeckai-Portfolio-Hub'
      }
    });
    const repoData = await repoResponse.json();

    return {
      name: repoData.name,
      description: repoData.description,
      topics: repoData.topics || [],
    };
  } catch (error) {
    console.error("Failed fetching GitHub metadata:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectInput, githubUrl, targetRole } = await req.json();

    if (!projectInput && !githubUrl) {
      return Response.json({ error: 'Missing project details or GitHub URL' }, { status: 400 });
    }

    let ContextString = projectInput || '';

    if (githubUrl) {
      const gitMeta = await fetchGitHubMetaData(githubUrl);
      if (gitMeta) {
        ContextString += `\n[GitHub Repository Meta Data] Name: ${gitMeta.name}. Description: ${gitMeta.description}. Tech Stack/Topics: ${gitMeta.topics.join(', ')}.`;
      }
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" } 
    });

    const systemPrompt = `
      You are the core orchestration engine for Draftdeck AI. Your job is to take a raw technical project description and generate a structured JSON containing specific assets for 4 different tools: Resume Builder, Diagram Builder (Mermaid.js), Presentation Creator, and Letter Generator.
      
      Target Role Context: ${targetRole || 'Software Engineer / Full Stack Developer'}

      Return strictly valid JSON matching this TypeScript interface structure:
      {
        "resume": {
          "projectTitle": "String",
          "bulletPoints": ["3-4 highly optimized, impact-driven, ATS-friendly bullet points using action verbs and XYZ formulas"]
        },
        "diagram": {
          "syntax": "Valid Mermaid.js graph TD or sequenceDiagram representing the core architecture inferred from the description"
        },
        "presentation": {
          "title": "String",
          "slides": [
            { "slideNumber": 1, "heading": "Title Slide", "content": ["Project Title", "Subtitle/Tagline"] },
            { "slideNumber": 2, "heading": "The Problem", "content": ["Point 1", "Point 2"] },
            { "slideNumber": 3, "heading": "System Architecture", "content": ["Technical breakdown", "Core stacks utilized"] },
            { "slideNumber": 4, "heading": "Key Challenges & Solutions", "content": ["Challenge faced", "How it was optimized/solved"] }
          ]
        },
        "letter": {
          "justificationText": "A professional paragraph tailored for a cover letter explaining how the engineering architectural decisions made in this specific project directly qualify the candidate for the target role."
        }
      }
    `;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Analyze this project data and generate the assets: ${ContextString}` }
    ]);

    const responseText = result.response.text();
    
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const orchestratedPayload = JSON.parse(cleanJson);

    return Response.json({ success: true, data: orchestratedPayload });

  } catch (error: any) {
    console.error('Orchestration Hub Error:', error);
    return Response.json({ error: 'Failed to process project data', details: error.message }, { status: 500 });
  }
}