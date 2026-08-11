'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Persona, Skill } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Search, Star, BadgeCheck, ShieldCheck, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  persona: { id: string; headline: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    hourlyRate: '',
    userId: '',
    skillIds: [] as string[],
    isVerified: false,
  });
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PERSONA' as 'USER' | 'PERSONA' | 'ADMIN',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Check admin access
  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, loading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-personas', debouncedSearch],
    queryFn: async () => {
      const res = await api.get('/personas', {
        params: { search: debouncedSearch || undefined, limit: 100 },
      });
      return res.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await api.get('/skills');
      return res.data as Skill[];
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data as AdminUser[];
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      const res = await api.patch(`/personas/${id}/verify`, { isVerified });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/personas/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/users', {
        fullName: newUserData.fullName,
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role,
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Refresh user list
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
      // Select the newly created user
      setFormData((prev) => ({ ...prev, userId: data.id }));
      setShowNewUserForm(false);
      setNewUserData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PERSONA',
      });
      setFormError('');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to create user');
    },
  });

  const handleCreateUser = () => {
    setFormError('');

    if (!newUserData.fullName || !newUserData.email || !newUserData.password) {
      setFormError('Please fill in all user fields');
      return;
    }

    if (newUserData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    createUserMutation.mutate();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        headline: formData.headline,
        bio: formData.bio || undefined,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        skillIds: formData.skillIds,
        isVerified: formData.isVerified,
      };

      if (editingPersona) {
        const res = await api.patch(`/personas/${editingPersona.id}`, payload);
        return res.data;
      } else {
        payload.userId = formData.userId;
        const res = await api.post('/personas', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreateModal(false);
      setEditingPersona(null);
      setFormData({
        headline: '',
        bio: '',
        hourlyRate: '',
        userId: '',
        skillIds: [],
        isVerified: false,
      });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to save persona');
    },
  });

  const openCreateModal = () => {
    setEditingPersona(null);
    setFormData({
      headline: '',
      bio: '',
      hourlyRate: '',
      userId: '',
      skillIds: [],
      isVerified: false,
    });
    setShowNewUserForm(false);
    setFormError('');
    setShowCreateModal(true);
  };

  const openEditModal = (persona: Persona) => {
    setEditingPersona(persona);
    setFormData({
      headline: persona.headline,
      bio: persona.bio || '',
      hourlyRate: persona.hourlyRate?.toString() || '',
      userId: persona.user.id,
      skillIds: persona.skills.map((s) => s.id),
      isVerified: persona.isVerified,
    });
    setFormError('');
    setShowCreateModal(true);
  };

  const toggleSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId],
    }));
  };

  // Filter out users who already have a persona when creating new
  const availableUsers = usersData?.filter((u) => !u.persona) || [];

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Manage experts (personas) on the platform</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Expert
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experts by name, skill, or expertise..."
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

      {data && data.items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-gray-900">No experts found</p>
          <p className="mt-2 text-gray-600">Try different search keywords or add a new expert.</p>
        </div>
      )}

      <div className="space-y-4">
        {data?.items.map((persona: Persona) => (
          <div
            key={persona.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {persona.user.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{persona.user.fullName}</h3>
                {persona.isVerified ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{persona.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {persona.rating.toFixed(1)} ({persona.ratingCount})
                </span>
                {persona.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => verifyMutation.mutate({ id: persona.id, isVerified: !persona.isVerified })}
                disabled={verifyMutation.isPending}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  persona.isVerified
                    ? 'border border-yellow-200 text-yellow-700 hover:bg-yellow-50'
                    : 'border border-green-200 text-green-700 hover:bg-green-50'
                }`}
              >
                {persona.isVerified ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {persona.isVerified ? 'Unverify' : 'Verify'}
              </button>
              <button
                onClick={() => openEditModal(persona)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${persona.user.fullName}'s persona?`)) {
                    deleteMutation.mutate(persona.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPersona ? 'Edit Expert' : 'Add New Expert'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowNewUserForm(false);
                }}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-4 space-y-4">
              {!editingPersona && !showNewUserForm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assign to User *
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>
                  {availableUsers.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      All users already have personas. Create a new user first.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewUserForm(true);
                      setFormError('');
                    }}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    + Create a new user instead
                  </button>
                </div>
              )}

              {!editingPersona && showNewUserForm && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-indigo-900">Create New User</h4>
                    <button
                      type="button"
                      onClick={() => setShowNewUserForm(false)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      ← Select existing user
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                      <input
                        type="text"
                        value={newUserData.fullName}
                        onChange={(e) =>
                          setNewUserData({ ...newUserData, fullName: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Alex Johnson"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        value={newUserData.email}
                        onChange={(e) =>
                          setNewUserData({ ...newUserData, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="alex@example.com"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={newUserData.password}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, password: e.target.value })
                          }
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Min 8 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          value={newUserData.confirmPassword}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, confirmPassword: e.target.value })
                          }
                          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Repeat password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={newUserData.role}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            role: e.target.value as 'USER' | 'PERSONA' | 'ADMIN',
                          })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="PERSONA">Persona (Expert)</option>
                        <option value="USER">User (Customer)</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateUser}
                      disabled={createUserMutation.isPending}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Headline *</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Professional bio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills?.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        formData.skillIds.includes(skill.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isVerified" className="text-sm font-medium text-gray-700">
                  Verified expert
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowNewUserForm(false);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={
                  saveMutation.isPending ||
                  !formData.headline ||
                  (!editingPersona && !formData.userId)
                }
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saveMutation.isPending
                  ? 'Saving...'
                  : editingPersona
                    ? 'Save Changes'
                    : 'Create Expert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}