import { NextRequest, NextResponse } from 'next/server';
import { Contest } from '@/lib/models';

// Mock data - replace with actual database calls
let contests: Contest[] = [
  {
    id: '1',
    theme: 'Elegant Evening Gala',
    budget: 500,
    timeLimit: 10,
    status: 'active',
    startTime: new Date(),
    endTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    votingEndTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    participants: [],
    createdAt: new Date()
  }
];

export async function GET() {
  try {
    // Get active or upcoming contests
    const activeContests = contests.filter(c => 
      c.status === 'active' || c.status === 'waiting'
    );
    
    return NextResponse.json({ contests: activeContests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme, budget, timeLimit } = body;
    
    const newContest: Contest = {
      id: Date.now().toString(),
      theme,
      budget,
      timeLimit,
      status: 'waiting',
      startTime: new Date(Date.now() + 60 * 1000), // Start in 1 minute
      endTime: new Date(Date.now() + (timeLimit + 1) * 60 * 1000),
      votingEndTime: new Date(Date.now() + (timeLimit + 6) * 60 * 1000), // 5 min voting period
      participants: [],
      createdAt: new Date()
    };
    
    contests.push(newContest);
    
    return NextResponse.json({ contest: newContest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
  }
}
