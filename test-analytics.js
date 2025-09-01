const test = async () => {
  try {
    console.log('Testing GET endpoint...');
    const getResponse = await fetch('http://localhost:3000/api/analytics');
    const getData = await getResponse.json();
    console.log('GET Response:', getData);

    console.log('Testing POST endpoint...');
    const postResponse = await fetch('http://localhost:3000/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: 'test-session-123' }),
    });
    const postData = await postResponse.json();
    console.log('POST Response:', postData);

    console.log('Testing GET endpoint again...');
    const getResponse2 = await fetch('http://localhost:3000/api/analytics');
    const getData2 = await getResponse2.json();
    console.log('GET Response 2:', getData2);

  } catch (error) {
    console.error('Error:', error.message);
  }
};

test();
