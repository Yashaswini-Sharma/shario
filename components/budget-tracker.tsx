'use client';

import { ClothingItem } from '@/lib/models';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BudgetTrackerProps {
  budget: number;
  selectedItems: ClothingItem[];
  className?: string;
}

export function BudgetTracker({ budget, selectedItems, className = '' }: BudgetTrackerProps) {
  const totalSpent = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const remaining = budget - totalSpent;
  const percentageUsed = (totalSpent / budget) * 100;
  const isOverBudget = totalSpent > budget;
  const isNearBudget = percentageUsed > 90 && !isOverBudget;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearBudget) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusVariant = () => {
    if (isOverBudget) return 'destructive';
    if (isNearBudget) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget!';
    if (isNearBudget) return 'Almost There';
    return 'Within Budget';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Overview */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Spent</span>
            <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ₹{totalSpent.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Budget</span>
            <span className="font-medium">₹{budget.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-blue-600'}`}>
              ₹{remaining.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Budget Usage</span>
            <Badge variant={getStatusVariant()}>
              {getStatusText()}
            </Badge>
          </div>
          
          <div className="relative">
            <Progress 
              value={Math.min(percentageUsed, 100)} 
              className="h-3"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          
          <div className="text-center">
            <span className="text-sm font-medium">
              {percentageUsed.toFixed(1)}% used
            </span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                  <span className="truncate">{item.name}</span>
                  <span className="text-green-600 font-medium">${item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Warning */}
        {isOverBudget && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Budget Exceeded!</p>
              <p className="text-xs text-red-600">
                Remove items worth ₹{(totalSpent - budget).toFixed(2)} to continue
              </p>
            </div>
          </div>
        )}

        {isNearBudget && !isOverBudget && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Almost at budget limit</p>
              <p className="text-xs text-yellow-600">
                Only ₹{remaining.toFixed(2)} remaining
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
