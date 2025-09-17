'use client';

import { useState, useEffect } from 'react';
import { Contest, Design } from '@/lib/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Timer, Trophy } from 'lucide-react';

export default function ContestVoting() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [votedDesigns, setVotedDesigns] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestAndDesigns();
  }, []);

  useEffect(() => {
    if (contest && contest.status === 'voting') {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(contest.votingEndTime).getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [contest]);

  const fetchContestAndDesigns = async () => {
    try {
      // Fetch contest
      const contestResponse = await fetch('/api/contests');
      const contestData = await contestResponse.json();
      
      if (contestData.contests && contestData.contests.length > 0) {
        const activeContest = contestData.contests[0];
        setContest(activeContest);
        
        // Fetch designs for this contest
        const designsResponse = await fetch(`/api/designs?contestId=${activeContest.id}`);
        const designsData = await designsResponse.json();
        
        if (designsData.designs) {
          setDesigns(designsData.designs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch contest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (designId: string, rating: number) => {
    if (!contest || votedDesigns.has(designId)) return;
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId: contest.id,
          designId,
          userId: 'voter123', // In real app, get from auth
          rating,
        }),
      });
      
      if (response.ok) {
        setVotedDesigns(new Set([...votedDesigns, designId]));
        // Update local design votes count
        setDesigns(designs.map(design => 
          design.id === designId 
            ? { ...design, votes: design.votes + rating }
            : design
        ));
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const StarRating = ({ designId, disabled = false }: { designId: string; disabled?: boolean }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    const handleStarClick = (rating: number) => {
      if (disabled) return;
      setSelectedRating(rating);
      submitVote(designId, rating);
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={disabled}
            className={`transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoveredRating || selectedRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading voting...</div>;
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No Active Contest</h1>
        <p className="text-gray-600">Check back soon for voting!</p>
      </div>
    );
  }

  if (contest.status !== 'voting' && designs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Voting Not Available</h1>
        <p className="text-gray-600">
          {contest.status === 'active' ? 'Contest is still active. Wait for voting to begin!' : 'No designs to vote on yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contest Header */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Vote for the Best: {contest.theme}
            </span>
            {contest.status === 'voting' && (
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span className="text-xl font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">Theme: {contest.theme}</p>
              <p className="text-sm text-gray-600">
                Budget was: ${contest.budget} • {designs.length} submissions
              </p>
            </div>
            <Badge variant={contest.status === 'voting' ? "default" : "secondary"}>
              {contest.status === 'voting' ? 'Voting Open' : 'Voting Closed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={design.userAvatar} />
                  <AvatarFallback>
                    {design.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{design.userName}</h3>
                  <p className="text-sm text-gray-600">
                    Total: ${design.totalCost} • {design.votes} votes
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Design Items */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Outfit Items:</h4>
                {design.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-green-600">${item.price}</span>
                  </div>
                ))}
              </div>
              
              {/* Budget Usage */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Budget Used:</span>
                  <span className="font-semibold">
                    ${design.totalCost} / ${contest.budget}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(design.totalCost / contest.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Voting */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rate this design:</span>
                  {votedDesigns.has(design.id) && (
                    <Badge variant="outline" className="text-xs">Voted!</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <StarRating 
                    designId={design.id} 
                    disabled={votedDesigns.has(design.id) || timeLeft === 0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {designs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No designs submitted yet.</p>
          <p className="text-gray-400">Be the first to create an outfit!</p>
          <Button className="mt-4" onClick={() => window.location.href = '/design-contest'}>
            Join Contest
          </Button>
        </div>
      )}

      {/* Results Button */}
      {contest.status === 'completed' && (
        <div className="text-center mt-8">
          <Button size="lg" onClick={() => window.location.href = '/contest-results'}>
            <Trophy className="w-4 h-4 mr-2" />
            View Results
          </Button>
        </div>
      )}
    </div>
  );
}
