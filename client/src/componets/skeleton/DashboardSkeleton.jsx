const DashboardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-[#121418] border border-white/10 shadow-lg"
          >
            <div className="h-4 w-28 bg-white/10 rounded mb-4"></div>
            <div className="h-8 w-32 bg-white/20 rounded mb-2"></div>
            <div className="h-3 w-24 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-[#121418] rounded-xl border border-white/10 shadow-xl">
        <div className="h-64 w-full bg-white/10 rounded"></div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-6 bg-[#121418] rounded-xl border border-white/10"
          >
            <div className="h-5 w-40 bg-white/10 rounded mb-4"></div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-white/10 rounded"></div>
                <div className="h-4 w-10 bg-white/20 rounded"></div>
              </div>

              <div className="flex justify-between">
                <div className="h-4 w-32 bg-white/10 rounded"></div>
                <div className="h-4 w-10 bg-white/20 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
