import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Table = ({ columns, data, renderRowActions, isLoading, onRowClick }) => {
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-500 italic"
                >
                  No records found in the network.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {data.map((row, index) => (
                  <motion.tr
                    key={row._id || row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`group hover:bg-emerald-500/5 transition-colors duration-200 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 group-hover:text-white transition-colors"
                      >
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                    {renderRowActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {renderRowActions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;