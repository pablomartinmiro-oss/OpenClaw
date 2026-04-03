"use client";

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-16 bg-gray-100 rounded-full" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
            <div className="flex justify-between pt-2">
              <div className="h-5 w-20 bg-gray-100 rounded" />
              <div className="h-7 w-16 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
