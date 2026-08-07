'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, PersonaDetail, AvailabilitySlot } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Star, BadgeCheck, CalendarDays, Clock, X } from 'lucide-react';

export default function PersonaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { data: persona, isLoading, error } = useQuery({
    queryKey: ['persona', id],
    queryFn: async () => {
      const res = await api.get(`/personas/${id}`);
      return res.data as PersonaDetail;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reservations', {
        personaId: id,
        availabilityId: selectedSlot?.id,
        notes: notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persona', id] });
      setSelectedSlot(null);
      setNotes('');
      router.push('/dashboard');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setBookingError(error.response?.data?.message || 'Failed to book. Please try again.');
    },
  });

  const handleBook = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedSlot) return;
    setBookingError('');
    bookMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="h-64 rounded-xl bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-lg font-medium text-gray-900">Persona not found</p>
        <p className="mt-2 text-gray-600">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
            {persona.user.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{persona.user.fullName}</h1>
              {persona.isVerified && <BadgeCheck className="h-6 w-6 text-indigo-600" />}
            </div>
            <p className="mt-1 text-lg text-gray-600">{persona.headline}</p>
            <div className="mt-2 flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{persona.rating.toFixed(1)}</span>
              <span className="text-gray-500">({persona.ratingCount} reviews)</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {persona.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
          {persona.hourlyRate && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${persona.hourlyRate}</p>
              <p className="text-sm text-gray-500">per hour</p>
            </div>
          )}
        </div>

        {persona.bio && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900">About</h2>
            <p className="mt-2 text-gray-600">{persona.bio}</p>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Available Slots</h2>
        {persona.availability.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No available slots at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {persona.availability.map((slot) => (
              <div
                key={slot.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {new Date(slot.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(slot.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(slot.endTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSlot(slot)}
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Book Consultation</h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(selectedSlot.startTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(selectedSlot.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(selectedSlot.endTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {bookingError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {bookingError}
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Add any notes for the consultant..."
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedSlot(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={bookMutation.isPending}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}