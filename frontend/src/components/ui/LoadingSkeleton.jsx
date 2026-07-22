const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const StatCardSkeleton = () => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-10 w-10 rounded-xl" />
    </div>
    <SkeletonBlock className="h-9 w-20 mt-1" />
    <SkeletonBlock className="h-3 w-32" />
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-dark-800">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <SkeletonBlock className={`h-4 ${i === 0 ? 'w-40' : i === cols - 1 ? 'w-16' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

const LoadingSkeleton = ({ type = 'block', count = 1, height = 4 }) => {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className={`h-${height} w-full rounded-xl`} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
