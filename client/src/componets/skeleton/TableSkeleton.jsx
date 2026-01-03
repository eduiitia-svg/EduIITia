const SkeletonRow = ({ columnsCount, hasActions }) => {
  const placeholders = Array.from({ length: columnsCount });

  return (
    <tr className="animate-pulse">
      {placeholders.map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div 
            className="bg-white/10 rounded h-5" 
            style={{ width: `${Math.random() * 40 + 50}%` }} 
          />
        </td>
      ))}
      {hasActions && (
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="bg-white/10 rounded-full h-8 w-8" />
            <div className="bg-white/10 rounded-full h-8 w-8" />
          </div>
        </td>
      )}
    </tr>
  );
};

export const TableSkeleton = ({ columns, renderRowActions, rowCount = 5 }) => {
  const columnsCount = columns.length;

  return (
    <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-black/20">
            <tr>
              {columns.map((c) => (
                <th 
                  key={c.key} 
                  className="px-6 py-4 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider"
                >
                  {c.header}
                </th>
              ))}
              {renderRowActions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Array.from({ length: rowCount }).map((_, index) => (
              <SkeletonRow
                key={index}
                columnsCount={columnsCount}
                hasActions={!!renderRowActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};