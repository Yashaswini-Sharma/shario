'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CountdownTimerProps {
  endTime: Date;
  onTimeUp?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ endTime, onTimeUp, className = '', size = 'md' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      
      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
        setIsActive(false);
        clearInterval(timer);
        onTimeUp?.();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-2xl';
      default:
        return 'text-lg';
    }
  };

  const getUrgencyVariant = () => {
    if (timeLeft > 300) return 'default'; // > 5 minutes
    if (timeLeft > 60) return 'secondary'; // > 1 minute
    return 'destructive'; // <= 1 minute
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Timer className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'}`} />
      <Badge variant={isActive ? getUrgencyVariant() : 'outline'} className={getSizeClasses()}>
        {isActive ? formatTime(timeLeft) : 'Time\'s Up!'}
      </Badge>
    </div>
  );
}
