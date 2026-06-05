async function testHealth() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    console.log('Health Check Status:', response.status);
    console.log('Performance Data:', JSON.stringify(data.performance, null, 2));
    console.log('Queue Data:', JSON.stringify(data.queue, null, 2));
  } catch (error) {
    console.error('Error fetching health endpoint:', error.message);
  }
}

testHealth();
