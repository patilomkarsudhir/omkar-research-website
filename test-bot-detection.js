// Simple test to verify bot detection works
const testBotDetection = async () => {
  console.log('Testing bot detection...');
  
  // Test with a normal browser request
  try {
    const normalResponse = await fetch('http://localhost:3000/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({ sessionId: 'test-normal-user' }),
    });
    
    const normalData = await normalResponse.json();
    console.log('Normal browser request:', normalData);
  } catch (error) {
    console.error('Error with normal request:', error);
  }
  
  // Test with a bot user agent
  try {
    const botResponse = await fetch('http://localhost:3000/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)'
      },
      body: JSON.stringify({ sessionId: 'test-bot-user' }),
    });
    
    const botData = await botResponse.json();
    console.log('Bot request:', botData);
  } catch (error) {
    console.error('Error with bot request:', error);
  }
};

// Run the test
testBotDetection();
