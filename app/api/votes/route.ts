import { NextRequest, NextResponse } from 'next/server';
import { Vote } from '@/lib/models';

// Mock data - replace with actual database calls
let votes: Vote[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestId, designId, userId, rating } = body;
    
    // Check if user already voted for this design
    const existingVote = votes.find(v => 
      v.contestId === contestId && 
      v.designId === designId && 
      v.userId === userId
    );
    
    if (existingVote) {
      return NextResponse.json({ error: 'Already voted for this design' }, { status: 400 });
    }
    
    // Check if user is voting for their own design
    // This would require checking the designs array - simplified for now
    
    const newVote: Vote = {
      id: Date.now().toString(),
      contestId,
      designId,
      userId,
      rating,
      createdAt: new Date()
    };
    
    votes.push(newVote);
    
    // Update design vote count (in real app, this would be in database transaction)
    // For now, just return success
    
    return NextResponse.json({ vote: newVote }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const contestId = url.searchParams.get('contestId');
    
    if (!contestId) {
      return NextResponse.json({ error: 'Contest ID is required' }, { status: 400 });
    }
    
    const contestVotes = votes.filter(v => v.contestId === contestId);
    
    return NextResponse.json({ votes: contestVotes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}
