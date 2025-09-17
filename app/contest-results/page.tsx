'use client';

import { useState, useEffect } from 'react';
import { Contest, Design, ContestResult } from '@/lib/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContestResults() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Fetch contest
      const contestResponse = await fetch('/api/contests');
      const contestData = await contestResponse.json();
      
      if (contestData.contests && contestData.contests.length > 0) {
        const activeContest = contestData.contests[0];
        setContest(activeContest);
        
        // Fetch designs
        const designsResponse = await fetch(`/api/designs?contestId=${activeContest.id}`);
        const designsData = await designsResponse.json();
        
        if (designsData.designs) {
          // Sort designs by votes (descending)
          const sortedDesigns = designsData.designs.sort((a: Design, b: Design) => b.votes - a.votes);
          setDesigns(sortedDesigns);
        }
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{position}</span>;
    }
  };

  const getRankBadgeVariant = (position: number) => {
    switch (position) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading results...</div>;
  }

  if (!contest || designs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No Results Available</h1>
        <p className="text-gray-600">Contest results will appear here when available.</p>
      </div>
    );
  }

  const winner = designs[0];
  const topThree = designs.slice(0, 3);
  const otherDesigns = designs.slice(3);
  const totalVotes = designs.reduce((sum, design) => sum + design.votes, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contest Header */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Contest Results: {contest.theme}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{designs.length}</p>
              <p className="text-gray-600">Participants</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalVotes}</p>
              <p className="text-gray-600">Total Votes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${contest.budget}</p>
              <p className="text-gray-600">Budget Limit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winner Spotlight */}
      {winner && (
        <Card className="mb-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              🎉 Contest Winner!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={winner.userAvatar} />
                <AvatarFallback className="text-lg">
                  {winner.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold">{winner.userName}</h3>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold">{winner.votes} votes</span>
                </div>
                <p className="text-gray-600">Budget used: ${winner.totalCost} / ${contest.budget}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Winning Outfit:</h4>
                <div className="space-y-1">
                  {winner.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between text-sm bg-white p-2 rounded">
                      <span>{item.name}</span>
                      <span className="text-green-600">${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-lg font-semibold">Champion</p>
                  <p className="text-gray-600">Most Creative Design</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏅 Top 3 Finalists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((design, index) => (
                <div key={design.id} className={`text-center p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                  'bg-amber-50 border-2 border-amber-200'
                }`}>
                  <div className="flex justify-center mb-2">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={design.userAvatar} />
                    <AvatarFallback>
                      {design.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold">{design.userName}</h4>
                  <p className="text-lg font-bold">{design.votes} votes</p>
                  <p className="text-sm text-gray-600">${design.totalCost} spent</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Complete Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {designs.map((design, index) => (
              <div key={design.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                index < 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  {getRankIcon(index + 1)}
                  <Badge variant={getRankBadgeVariant(index + 1)}>
                    #{index + 1}
                  </Badge>
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={design.userAvatar} />
                  <AvatarFallback>
                    {design.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-semibold">{design.userName}</h4>
                  <p className="text-sm text-gray-600">
                    {design.items.length} items • ${design.totalCost} total
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-lg">{design.votes}</span>
                  </div>
                  <p className="text-sm text-gray-600">votes</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {totalVotes > 0 ? Math.round((design.votes / totalVotes) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">of votes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Contest Button */}
      <div className="text-center mt-8">
        <Button size="lg" onClick={() => window.location.href = '/design-contest'}>
          Join Next Contest
        </Button>
      </div>
    </div>
  );
}
