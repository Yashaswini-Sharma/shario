'use client';

import { Design } from '@/lib/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, Share2, User } from 'lucide-react';
import { useState } from 'react';

interface VotingCardProps {
  design: Design;
  contestBudget: number;
  onVote: (designId: string, rating: number) => void;
  hasVoted?: boolean;
  showVoteButton?: boolean;
  rank?: number;
  className?: string;
}

export function VotingCard({ 
  design, 
  contestBudget, 
  onVote, 
  hasVoted = false, 
  showVoteButton = true,
  rank,
  className = '' 
}: VotingCardProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const budgetUsagePercentage = (design.totalCost / contestBudget) * 100;

  const handleStarClick = (rating: number) => {
    if (hasVoted || !showVoteButton) return;
    setSelectedRating(rating);
    onVote(design.id, rating);
  };

  const getRankBadge = () => {
    if (!rank) return null;
    
    const getRankVariant = () => {
      switch (rank) {
        case 1: return 'default';
        case 2: return 'secondary';
        case 3: return 'outline';
        default: return 'outline';
      }
    };

    const getRankEmoji = () => {
      switch (rank) {
        case 1: return '🏆';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '#';
      }
    };

    return (
      <Badge variant={getRankVariant()} className="absolute top-2 left-2">
        {getRankEmoji()} {rank}
      </Badge>
    );
  };

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={hasVoted || !showVoteButton}
          className={`transition-all duration-200 ${
            hasVoted || !showVoteButton 
              ? 'cursor-not-allowed' 
              : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hoveredRating || selectedRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 relative ${className}`}>
      {getRankBadge()}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={design.userAvatar} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{design.userName}</h3>
              <p className="text-sm text-gray-600">
                {design.votes} votes • ${design.totalCost}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className="p-2"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Outfit Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            Outfit Details
            <Badge variant="outline" className="text-xs">
              {design.items.length} items
            </Badge>
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {design.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {item.type}
                  </Badge>
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="text-green-600 font-medium">${item.price}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Budget Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Usage:</span>
            <span className="font-semibold">
              ${design.totalCost} / ${contestBudget} ({budgetUsagePercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                budgetUsagePercentage > 90 
                  ? 'bg-red-500' 
                  : budgetUsagePercentage > 70 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Voting Section */}
        {showVoteButton && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Rate this design:</span>
              {hasVoted && (
                <Badge variant="outline" className="text-xs">
                  Voted!
                </Badge>
              )}
            </div>
            <StarRating />
            {hasVoted && (
              <p className="text-xs text-gray-500 mt-2">
                Thank you for voting! 
              </p>
            )}
          </div>
        )}
        
        {/* Stats Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
          <span>Submitted: {new Date(design.submittedAt).toLocaleTimeString()}</span>
          <span>{design.votes} total votes</span>
        </div>
      </CardContent>
    </Card>
  );
}
