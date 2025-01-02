import { NextRequest, NextResponse } from 'next/server';
import { getAvailability } from '@/app/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    const data = await getAvailability(start, end);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting availability:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get availability' },
      { status: 500 }
    );
  }
} 