async function testDiagramAPI() {
  console.log('Testing /api/generate/diagram...');
  try {
    const response = await fetch('http://localhost:3000/api/generate/diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'System Architecture for a web app with Client, API, and Database layers',
        type: 'flowchart'
      }),
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      console.log('Diagram generated successfully!');
      console.log('Content preview:', data.diagram?.substring(0, 100) + '...');
      if (data.diagram?.includes('subgraph')) {
        console.log('✅ Success: Diagram contains subgraphs as expected.');
      } else {
        console.log('⚠️ Warning: Diagram does not contain subgraphs.');
      }
    } else {
      console.log('Failed to generate diagram:', data.error);
      if (data.error?.includes('API key')) {
        console.log('Note: This is expected if GEMINI_API_KEY is not configured correctly in .env');
      }
    }
  } catch (error) {
    console.error('Error testing Diagram API:', error.message);
  }
}

testDiagramAPI();
