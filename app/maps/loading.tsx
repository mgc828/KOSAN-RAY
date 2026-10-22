import { Compass } from 'lucide-react';

export default function MapsLoading() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-[#F8FAFC]">
      {/* Header Desktop Placeholder */}
      <div className="hidden lg:block max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Main Container Skeleton */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-0 sm:px-4 lg:px-8 pb-4 flex flex-col lg:flex-row gap-6">
        {/* Map Skeleton */}
        <div className="flex-1 min-h-[400px] lg:min-h-[600px] bg-slate-200 rounded-none sm:rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 animate-pulse">
          <Compass className="w-10 h-10 animate-spin text-[#F97316]" />
          <span className="text-sm font-bold text-slate-600">Memuat Peta Interaktif...</span>
        </div>

        {/* Sidebar Skeleton (Desktop only) */}
        <div className="hidden lg:flex w-96 flex-col gap-4">
          <div className="h-12 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

