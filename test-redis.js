// Test Redis connection
const { Redis } = require('@upstash/redis');

async function testRedis() {
  console.log('Testing Redis connection...');
  
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('❌ Missing Redis environment variables');
    console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT SET');
    console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'NOT SET');
    return;
  }
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    console.log('✅ Redis client initialized');
    
    // Test basic operations
    await redis.set('test-key', 'test-value');
    console.log('✅ Set test value');
    
    const value = await redis.get('test-key');
    console.log('✅ Retrieved value:', value);
    
    await redis.del('test-key');
    console.log('✅ Cleaned up test key');
    
    console.log('🎉 Redis connection successful!');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
}

testRedis();
