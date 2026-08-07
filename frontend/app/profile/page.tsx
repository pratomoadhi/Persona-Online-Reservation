'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { User, ShieldCheck, CalendarDays } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
    enabled: !!user,
  });

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {user.role}
              </span>
              {user.isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Full Name
            </div>
            <p className="mt-1 text-gray-900">{profile?.fullName || user.fullName}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarDays className="h-4 w-4" />
              Member Since
            </div>
            <p className="mt-1 text-gray-900">
              {new Date(profile?.createdAt || user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {profile?.persona && (
          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="font-semibold text-indigo-900">Persona Profile</h3>
            <p className="mt-1 text-sm text-indigo-700">{profile.persona.headline}</p>
            <a
              href={`/persona/${profile.persona.id}`}
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View my persona profile →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}