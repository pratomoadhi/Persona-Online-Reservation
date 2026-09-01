'use client';

import { useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/api';

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

/**
 * Circular profile picture. Renders the uploaded photo when available,
 * otherwise falls back to the first letter of the person's name.
 */
export function Avatar({ src, name, className = 'h-10 w-10 text-lg' }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  // Reset the fallback state when the source changes (e.g. after a new upload)
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolved = src ? mediaUrl(src) : null;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-600 ${className}`}
    >
      {resolved && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        name.charAt(0)
      )}
    </div>
  );
}