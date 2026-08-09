'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Search, User, LogOut, CalendarDays, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Search className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Persona</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/browse" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
            Browse
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
            How it Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 sm:flex"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:flex"
              >
                <CalendarDays className="h-4 w-4" />
                My Bookings
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="hidden sm:inline">{user.fullName}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}