import Link from 'next/link';
import { Search, CalendarCheck, Video, Star } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find Your Expert',
    description: 'Browse through verified professionals and filter by skills, expertise, and ratings.',
  },
  {
    icon: CalendarCheck,
    title: 'Book a Session',
    description: 'Choose a time slot that works for you and confirm your consultation booking.',
  },
  {
    icon: Video,
    title: 'Meet & Consult',
    description: 'Connect with your consultant and get the expert advice you need.',
  },
  {
    icon: Star,
    title: 'Leave a Review',
    description: 'Share your experience and help others find the right professional.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">How It Works</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Getting started with Persona is simple. Follow these four easy steps.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={index} className="relative rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <step.icon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="mt-4 text-sm font-medium text-indigo-600">Step {index + 1}</div>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">{step.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-indigo-600 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
        <p className="mt-2 text-indigo-100">Join Persona today and connect with experts.</p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50"
        >
          Create Your Account
        </Link>
      </div>
    </div>
  );
}