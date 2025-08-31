import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mappingPath = path.join(process.cwd(), 'app', 'publications', 'paper-mapping.json');
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    return NextResponse.json(mapping);
  } catch (error) {
    console.error('Error loading paper mapping:', error);
    return NextResponse.json({}, { status: 500 });
  }
}
