import { getPlayerPhotoUrl } from '@/lib/fpl-types';
import { useState } from 'react';
import { User } from 'lucide-react';

interface PlayerPhotoProps {
  code: number;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

export default function PlayerPhoto({ code, name, size = 'sm', className = '' }: PlayerPhotoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !code) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${className}`}>
        <User className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={getPlayerPhotoUrl(code)}
      alt={name}
      className={`${sizeClasses[size]} rounded-full object-cover object-top bg-muted flex-shrink-0 ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
