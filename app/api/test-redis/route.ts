import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET() {
  try {
    console.log('Testing Redis connection...');
    console.log('Environment variables check:');
    console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'SET' : 'NOT SET');
    console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'SET' : 'NOT SET');
    
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Redis environment variables not set',
        hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
      });
    }
    
    const redis = Redis.fromEnv();
    
    // Test basic operations
    const testKey = `test-${Date.now()}`;
    await redis.set(testKey, 'Redis connection working!');
    const value = await redis.get(testKey);
    await redis.del(testKey);
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection successful',
      testValue: value,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Redis test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
