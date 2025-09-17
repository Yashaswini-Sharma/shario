'use client';

import { useState, useEffect } from 'react';
import { Contest, ClothingItem, Design } from '@/lib/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer } from 'lucide-react';

// Mock clothing items - in real app, fetch from API
const mockClothingItems: ClothingItem[] = [
  { id: '1', name: 'Elegant Black Dress', type: 'dress', price: 120, image: '/placeholder.jpg', color: 'black', style: 'elegant', tags: ['formal', 'evening'] },
  { id: '2', name: 'Red High Heels', type: 'shoes', price: 80, image: '/placeholder.jpg', color: 'red', style: 'formal', tags: ['heels', 'formal'] },
  { id: '3', name: 'Pearl Necklace', type: 'accessory', price: 60, image: '/placeholder.jpg', color: 'white', style: 'elegant', tags: ['jewelry', 'formal'] },
  { id: '4', name: 'Gold Earrings', type: 'accessory', price: 45, image: '/placeholder.jpg', color: 'gold', style: 'elegant', tags: ['jewelry'] },
  { id: '5', name: 'Blue Cocktail Dress', type: 'dress', price: 100, image: '/placeholder.jpg', color: 'blue', style: 'cocktail', tags: ['formal', 'party'] },
  { id: '6', name: 'Silver Clutch', type: 'accessory', price: 35, image: '/placeholder.jpg', color: 'silver', style: 'elegant', tags: ['bag', 'formal'] },
];

export default function DesignContest() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveContest();
  }, []);

  useEffect(() => {
    if (contest && contest.status === 'active') {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(contest.endTime).getTime();
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

  const fetchActiveContest = async () => {
    try {
      const response = await fetch('/api/contests');
      const data = await response.json();
      if (data.contests && data.contests.length > 0) {
        setContest(data.contests[0]);
      }
    } catch (error) {
      console.error('Failed to fetch contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCost = () => {
    return selectedItems.reduce((total, item) => total + item.price, 0);
  };

  const isWithinBudget = () => {
    return contest ? getTotalCost() <= contest.budget : false;
  };

  const addItem = (item: ClothingItem) => {
    const newTotal = getTotalCost() + item.price;
    if (contest && newTotal <= contest.budget) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const submitDesign = async () => {
    if (!contest || selectedItems.length === 0 || !isWithinBudget()) return;
    
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestId: contest.id,
          userId: 'user123', // In real app, get from auth
          userName: 'Fashion Designer',
          items: selectedItems,
          totalCost: getTotalCost(),
        }),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit design:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading contest...</div>;
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No Active Contest</h1>
        <p className="text-gray-600">Check back soon for the next fashion challenge!</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">Design Submitted!</h1>
        <p className="text-gray-600 mb-4">Your outfit has been submitted for voting.</p>
        <Button onClick={() => window.location.href = '/contest-voting'}>
          View All Submissions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contest Info & Timer */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl">🎭 {contest.theme}</span>
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <span className="text-xl font-mono">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg">Budget: ${contest.budget}</p>
                  <p className="text-sm text-gray-600">
                    Create the perfect outfit for: {contest.theme}
                  </p>
                </div>
                <Badge variant={timeLeft > 0 ? "default" : "destructive"}>
                  {timeLeft > 0 ? "Active" : "Time's Up!"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clothing Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockClothingItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-green-600">${item.price}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {item.type}
                    </Badge>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => addItem(item)}
                      disabled={timeLeft === 0 || getTotalCost() + item.price > contest.budget}
                    >
                      Add to Outfit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Items & Budget */}
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Your Outfit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500">No items selected</p>
                ) : (
                  selectedItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-green-600">${item.price}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span className="font-bold">${getTotalCost()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span>${contest.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={`font-bold ${isWithinBudget() ? 'text-green-600' : 'text-red-600'}`}>
                    ${contest.budget - getTotalCost()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isWithinBudget() ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((getTotalCost() / contest.budget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={submitDesign}
                disabled={timeLeft === 0 || selectedItems.length === 0 || !isWithinBudget()}
              >
                Submit Design
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
