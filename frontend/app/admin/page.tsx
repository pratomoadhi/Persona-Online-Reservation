'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Persona, Skill, MediaType, PersonaMedia, mediaUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import LazyVideo from '@/components/lazy-video';
import { Search, Star, BadgeCheck, ShieldCheck, Plus, Pencil, Trash2, X, Check, Upload, Film } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  persona: { id: string; headline: string } | null;
}

interface PendingMedia {
  file: File;
  type: MediaType;
  caption: string;
  preview: string;
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
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillForm, setSkillForm] = useState({ name: '', category: '' });
  const [skillFormError, setSkillFormError] = useState('');
  const [mediaInput, setMediaInput] = useState<{ type: MediaType; caption: string }>({
    type: 'IMAGE',
    caption: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [mediaError, setMediaError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const createSkillMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/skills', {
        name: skillForm.name,
        category: skillForm.category || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
      setSkillForm({ name: '', category: '' });
      setSkillFormError('');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setSkillFormError(error.response?.data?.message || 'Failed to create skill');
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async () => {
      if (!editingSkill) return;
      const res = await api.patch(`/skills/${editingSkill.id}`, {
        name: skillForm.name,
        category: skillForm.category || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
      setEditingSkill(null);
      setSkillForm({ name: '', category: '' });
      setSkillFormError('');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setSkillFormError(error.response?.data?.message || 'Failed to update skill');
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/skills/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
    },
  });

  const openCreateSkill = () => {
    setEditingSkill(null);
    setSkillForm({ name: '', category: '' });
    setSkillFormError('');
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name, category: skill.category || '' });
    setSkillFormError('');
  };

  const handleSaveSkill = () => {
    if (!skillForm.name.trim()) {
      setSkillFormError('Please enter a skill name');
      return;
    }
    if (editingSkill) {
      updateSkillMutation.mutate();
    } else {
      createSkillMutation.mutate();
    }
  };

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

  const mediaUploadMutation = useMutation({
    mutationFn: async ({
      personaId,
      file,
      type,
      caption,
    }: {
      personaId: string;
      file: File;
      type: MediaType;
      caption: string;
    }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      if (caption) fd.append('caption', caption);
      const res = await api.post(`/personas/${personaId}/media`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
      setSelectedFile(null);
      setMediaInput({ type: 'IMAGE', caption: '' });
      setMediaError('');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setMediaError(error.response?.data?.message || 'Failed to upload media');
    },
  });

  const mediaDeleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await api.delete(`/personas/media/${mediaId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personas'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setMediaError(error.response?.data?.message || 'Failed to delete media');
    },
  });

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const detected = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    setMediaInput((prev) => ({ ...prev, type: detected }));
  };

  const handleMediaUpload = () => {
    setMediaError('');
    if (!selectedFile) {
      setMediaError('Choose a file first.');
      return;
    }
    if (editingPersona) {
      mediaUploadMutation.mutate({
        personaId: editingPersona.id,
        file: selectedFile,
        type: mediaInput.type,
        caption: mediaInput.caption,
      });
    } else {
      // Creating new expert: queue the file and upload after the persona is created
      setPendingMedia((prev) => [
        ...prev,
        {
          file: selectedFile,
          type: mediaInput.type,
          caption: mediaInput.caption,
          preview: URL.createObjectURL(selectedFile),
        },
      ]);
      setSelectedFile(null);
      setMediaInput({ type: 'IMAGE', caption: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
    onSuccess: async (data: Persona) => {
      // Upload any queued media files after the persona exists (create mode)
      try {
        if (pendingMedia.length > 0) {
          const personaId = editingPersona ? editingPersona.id : data.id;
          for (const m of pendingMedia) {
            const fd = new FormData();
            fd.append('file', m.file);
            fd.append('type', m.type);
            if (m.caption) fd.append('caption', m.caption);
            await api.post(`/personas/${personaId}/media`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
          setPendingMedia([]);
        }
      } catch {
        setMediaError('Expert saved, but one or more media uploads failed.');
      }

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
      setSelectedFile(null);
      setMediaInput({ type: 'IMAGE', caption: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    setMediaError('');
    setSelectedFile(null);
    setPendingMedia([]);
    setMediaInput({ type: 'IMAGE', caption: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    setMediaError('');
    setSelectedFile(null);
    setPendingMedia([]);
    setMediaInput({ type: 'IMAGE', caption: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowSkillsModal(true);
              openCreateSkill();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Manage Skills
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Expert
          </button>
        </div>
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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              {(() => {
                const img = persona.media?.find((m) => m.type === 'IMAGE');
                return img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(img.url)} alt={persona.user.fullName} className="h-full w-full object-cover" />
                ) : (
                  persona.user.fullName.charAt(0)
                );
              })()}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-6 pb-4">
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

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {formError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
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

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Film className="h-4 w-4 text-gray-500" />
                  Media (Photos &amp; Videos)
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Unique to this expert — showcase work samples, certificates, or an intro video.
                </p>

                {mediaError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                    {mediaError}
                  </div>
                )}

                {(editingPersona?.media?.length ?? 0) > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {editingPersona?.media?.map((m) => (
                      <div
                        key={m.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white"
                      >
                        {m.type === 'VIDEO' ? (
                          <LazyVideo
                            src={mediaUrl(m.url)}
                            muted
                            label="Preview video"
                            className="h-full w-full"
                            videoClassName="object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(m.url)}
                            alt={m.caption || 'Expert media'}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <span className="absolute left-1 top-1 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          <Film className="h-3 w-3" /> VID
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('Delete this media item?')) mediaDeleteMutation.mutate(m.id);
                          }}
                          className="absolute right-1 top-1 z-20 rounded bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Delete media"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!editingPersona && pendingMedia.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {pendingMedia.map((m, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white"
                      >
                        {m.type === 'VIDEO' ? (
                          <video src={m.preview} muted className="h-full w-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.preview}
                            alt={m.caption || 'Pending media'}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          <Film className="h-3 w-3" /> VID
                        </span>
                        <button
                          onClick={() =>
                            setPendingMedia((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute right-1 top-1 rounded bg-red-600 p-1 text-white"
                          aria-label="Remove pending media"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={handleFileSelected}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={mediaInput.type}
                        onChange={(e) =>
                          setMediaInput({ ...mediaInput, type: e.target.value as MediaType })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Caption</label>
                      <input
                        type="text"
                        value={mediaInput.caption}
                        onChange={(e) => setMediaInput({ ...mediaInput, caption: e.target.value })}
                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Describe the skill shown..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleMediaUpload}
                    disabled={mediaUploadMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {mediaUploadMutation.isPending
                      ? 'Uploading...'
                      : editingPersona
                        ? 'Upload Media'
                        : 'Queue for upload'}
                  </button>
                  {!editingPersona && (
                    <p className="text-xs text-gray-500">
                      Files will upload after the expert is created.
                    </p>
                  )}
                </div>
              </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
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
      {/* Manage Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage Skills</h3>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {skillFormError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {skillFormError}
                </div>
              )}

              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h4 className="text-sm font-semibold text-indigo-900">
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      value={skillForm.category}
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Frontend"
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveSkill}
                    disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {createSkillMutation.isPending || updateSkillMutation.isPending
                      ? editingSkill
                        ? 'Saving...'
                        : 'Adding...'
                      : editingSkill
                        ? 'Save Skill'
                        : 'Add Skill'}
                  </button>
                  {editingSkill && (
                    <button
                      type="button"
                      onClick={openCreateSkill}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {skills && skills.length > 0 ? (
                  skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{skill.name}</p>
                        <p className="text-xs text-gray-500">
                          {skill.category || 'No category'} · {skill._count?.personas ?? 0} expert(s)
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => openEditSkill(skill)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete skill "${skill.name}"? This will remove it from all experts.`,
                              )
                            ) {
                              deleteSkillMutation.mutate(skill.id);
                            }
                          }}
                          disabled={deleteSkillMutation.isPending}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          aria-label={`Delete ${skill.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500">
                    No skills yet. Add one above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}