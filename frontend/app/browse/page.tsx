'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, Persona } from '@/lib/api';
import { Search, Star, BadgeCheck } from 'lucide-react';

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['personas', debouncedSearch],
    queryFn: async () => {
      const res = await api.get('/personas', {
        params: { search: debouncedSearch || undefined },
      });
      return res.data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Consultants</h1>
        <p className="mt-2 text-gray-600">Find the right expert for your needs</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, or expertise..."
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Failed to load personas. Please try again.
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-gray-900">No personas found</p>
          <p className="mt-2 text-gray-600">Try different search keywords.</p>
        </div>
      )}

      <div className="space-y-4">
        {data?.items.map((persona: Persona) => (
          <div
            key={persona.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {persona.user.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{persona.user.fullName}</h3>
                {persona.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{persona.headline}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {persona.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">{persona.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({persona.ratingCount})</span>
              </div>
              <Link
                href={`/persona/${persona.id}`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}