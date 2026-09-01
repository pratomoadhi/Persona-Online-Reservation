'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, uploadAvatar } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/avatar';
import { User, ShieldCheck, CalendarDays, Camera } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploaded, setUploaded] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
    enabled: !!user,
  });

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploaded(false);
    try {
      await uploadAvatar(file);
      await refreshUser();
      setUploaded(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setUploadError(error.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <Avatar src={user.avatarUrl} name={user.fullName} className="h-20 w-20 text-2xl" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {uploading ? 'Uploading...' : user.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {uploadError && <p className="mt-1 text-center text-sm text-red-600">{uploadError}</p>}
            {uploaded && <p className="mt-1 text-center text-sm text-green-600">Photo updated!</p>}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
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