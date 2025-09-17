import { NextRequest, NextResponse } from 'next/server';
import { Design } from '@/lib/models';

// Mock data - replace with actual database calls
let designs: Design[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const contestId = url.searchParams.get('contestId');
    
    if (!contestId) {
      return NextResponse.json({ error: 'Contest ID is required' }, { status: 400 });
    }
    
    const contestDesigns = designs.filter(d => d.contestId === contestId);
    
    return NextResponse.json({ designs: contestDesigns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestId, userId, userName, userAvatar, items, totalCost } = body;
    
    // Check if user already submitted for this contest
    const existingDesign = designs.find(d => d.contestId === contestId && d.userId === userId);
    if (existingDesign) {
      return NextResponse.json({ error: 'Already submitted design for this contest' }, { status: 400 });
    }
    
    const newDesign: Design = {
      id: Date.now().toString(),
      contestId,
      userId,
      userName,
      userAvatar,
      items,
      totalCost,
      submittedAt: new Date(),
      votes: 0,
      voters: []
    };
    
    designs.push(newDesign);
    
    return NextResponse.json({ design: newDesign }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit design' }, { status: 500 });
  }
}
