'use client';

export function ProjectErrorMessage({ message }: { message: string }) {
  return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-red-500">{message}</div>;
}
