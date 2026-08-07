import Link from 'next/link';
import { Search, Star, ArrowRight, Users, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Find Your Perfect
              <span className="block text-indigo-600">Professional Consultant</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Connect with experts across technology, career, health, and finance.
              Book consultations that fit your schedule.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
              >
                <Search className="h-5 w-5" />
                Browse Consultants
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Expert Professionals</h3>
            <p className="mt-2 text-gray-600">
              Browse verified professionals with proven expertise in their fields.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <CalendarCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Flexible Scheduling</h3>
            <p className="mt-2 text-gray-600">
              Book consultations at times that work for you with real-time availability.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Trusted Reviews</h3>
            <p className="mt-2 text-gray-600">
              Make informed decisions with verified reviews and ratings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join Persona today and connect with experts who can help you grow.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Create Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-base font-medium text-white hover:bg-white/10"
            >
              <Star className="h-5 w-5" />
              Explore Personas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}