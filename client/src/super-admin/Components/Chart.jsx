import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Clock } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-black/80 backdrop-blur-sm border border-emerald-500 rounded-lg shadow-xl">
        <p className="text-sm font-semibold text-white mb-1">{`Month: ${label}`}</p>
        <p className="text-sm text-emerald-400">
          {`Revenue: ₹${(payload[0].value / 100).toLocaleString()}`}
        </p>
      </div>
    );
  }

  return null;
};

const Chart = ({ monthlyData }) => {
  const data = Object.entries(monthlyData || {}).map(([month, revenue]) => ({
    month,
    revenue: revenue / 100,
  }));

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-[#0f172a] rounded-xl border border-white/10 shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-cyan-400" />
          Monthly Revenue Trend
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <Clock size={16} /> Last 6 Months
        </p>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#2e3a51"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#5a6782"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "12px", fill: "#94a3b8" }}
            />
            <YAxis
              stroke="#5a6782"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
              style={{ fontSize: "12px", fill: "#94a3b8" }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ stroke: "#06b6d4", strokeWidth: 2, r: 4, fill: "#0f172a" }}
              activeDot={{
                r: 7,
                strokeWidth: 3,
                stroke: "#facc15",
                fill: "#0f172a",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Chart;
