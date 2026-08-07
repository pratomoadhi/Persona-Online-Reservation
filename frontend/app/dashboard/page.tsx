'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Reservation } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CalendarDays, Clock, CalendarCheck, CalendarX } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: async () => {
      const res = await api.get('/reservations/me');
      return res.data;
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/reservations/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    },
  });

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.fullName}!</h1>
        <p className="mt-2 text-gray-600">Manage your consultations</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">No bookings yet</p>
          <p className="mt-2 text-gray-600">Browse consultants and book your first consultation.</p>
          <button
            onClick={() => router.push('/browse')}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Browse Consultants
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((reservation: Reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                {reservation.persona.user.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {reservation.persona.user.fullName}
                </h3>
                <p className="text-sm text-gray-600">{reservation.persona.headline}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(reservation.availability.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(reservation.availability.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(reservation.availability.endTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[reservation.status]}`}
                >
                  {reservation.status}
                </span>
                {reservation.status === 'PENDING' || reservation.status === 'CONFIRMED' ? (
                  <button
                    onClick={() => cancelMutation.mutate(reservation.id)}
                    disabled={cancelMutation.isPending}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <CalendarX className="h-4 w-4" />
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}