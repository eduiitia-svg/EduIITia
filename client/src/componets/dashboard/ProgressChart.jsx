import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Calendar, Target, Award, Activity } from "lucide-react";
import { useTheme } from "../../context/ThemeProvider";

const ProgressChart = ({ data }) => {
  const [chartType, setChartType] = useState("line");
  const [selectedTestType, setSelectedTestType] = useState("all");

  const COLORS = {
    primary: "#06B6D4",
    secondary: "#10B981",
    accent: "#8B5CF6",
    warn: "#F59E0B",
    danger: "#EF4444",
    slate: "#64748b",
    grid: "#334155",
    cyan: "#06B6D4",
  };
  const {theme} = useTheme()
  const darkMode = theme === "dark"

  const DARK_BG = darkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-black"
    : "bg-white";
  const CARD_BG = darkMode
    ? "bg-slate-900/40 border-slate-800"
    : "bg-white border-gray-200";
  const TEXT_PRIMARY = darkMode ? "text-white" : "text-gray-900";
  const TEXT_SECONDARY = darkMode ? "text-slate-400" : "text-gray-600";

  if (!data || !data.progress) {
    return (
      <div className={`${DARK_BG} min-h-screen p-8 rounded-2xl shadow-2xl`}>
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <Activity className="w-16 h-16 mb-4 opacity-30 text-cyan-400" />
            <p className="text-xl font-light text-slate-300">
              No Progress Data
            </p>
            <p className="text-sm mt-2 font-mono text-cyan-500/60">
              Complete more tests to track your progress
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progressData = data.progress;
  const testTypes = [
    "all",
    ...new Set(progressData.map((item) => item.testType)),
  ].filter(Boolean);

  const filteredData =
    selectedTestType === "all"
      ? progressData
      : progressData.filter((item) => item.testType === selectedTestType);

  const calculateMovingAverage = (data, window = 3) => {
    return data.map((item, index) => {
      const start = Math.max(0, index - window + 1);
      const end = index + 1;
      const windowData = data.slice(start, end);
      const average =
        windowData.reduce((sum, d) => sum + d.score, 0) / windowData.length;
      return { ...item, movingAverage: Math.round(average) };
    });
  };

  const dataWithTrend = calculateMovingAverage(filteredData);

  const firstScore = filteredData[0]?.score || 0;
  const latestScore = filteredData[filteredData.length - 1]?.score || 0;
  const progress = latestScore - firstScore;
  const averageScore =
    filteredData.reduce((sum, item) => sum + item.score, 0) /
    filteredData.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dateObject = new Date(label);

      const formattedDate = dateObject.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const scoreData = payload.find((p) => p.dataKey === "score");
      const trendData = payload.find((p) => p.dataKey === "movingAverage");

      return (
        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p
            className={`font-semibold ${
              darkMode ? "text-cyan-400" : "text-cyan-600"
            } mb-2 text-sm`}
          >
            {formattedDate}
          </p>
          {scoreData && (
            <div className="flex items-center gap-2 text-xs font-mono mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS.primary }}
              ></span>
              <span className={darkMode ? "text-slate-400" : "text-gray-600"}>
                Score:
              </span>
              <span
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {scoreData.value}%
              </span>
            </div>
          )}
          {trendData && (
            <div className="flex items-center gap-2 text-xs font-mono mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS.secondary }}
              ></span>
              <span className={darkMode ? "text-slate-400" : "text-gray-600"}>
                Trend:
              </span>
              <span
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {trendData.value}%
              </span>
            </div>
          )}
          <p
            className={`text-sm mt-2 ${
              darkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Test: {payload[0].payload.testType || "N/A"}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: dataWithTrend,
      margin: { top: 10, right: 20, left: 20, bottom: 0 },
    };

    const ChartGrid = (
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={COLORS.grid}
        strokeOpacity={0.5}
        vertical={false}
      />
    );
    const ChartXAxis = (
      <XAxis
        dataKey="date"
        tick={{ fill: COLORS.slate, fontSize: 11 }}
        tickLine={false}
        axisLine={{ stroke: COLORS.grid }}
        padding={{ left: 20, right: 20 }}
      />
    );
    const ChartYAxis = (
      <YAxis
        domain={[0, 100]}
        tick={{ fill: COLORS.slate, fontSize: 11 }}
        tickLine={false}
        axisLine={{ stroke: COLORS.grid }}
      />
    );

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            {ChartGrid}
            {ChartXAxis}
            {ChartYAxis}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#E5E7EB", paddingTop: "10px" }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.2}
              strokeWidth={3}
              name="Test Score"
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke={COLORS.secondary}
              strokeWidth={2}
              strokeDasharray="8 4"
              name="Trend Line (3-Test Avg)"
              dot={false}
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps} barSize={20}>
            {ChartGrid}
            {ChartXAxis}
            {ChartYAxis}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#E5E7EB", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              dataKey="score"
              fill={COLORS.primary}
              radius={[4, 4, 0, 0]}
              name="Test Score"
            />
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            {ChartGrid}
            {ChartXAxis}
            {ChartYAxis}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#E5E7EB", paddingTop: "10px" }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{
                fill: "#000",
                stroke: COLORS.primary,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{ r: 6, fill: COLORS.primary }}
              name="Test Score"
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke={COLORS.secondary}
              strokeWidth={2}
              strokeDasharray="8 4"
              name="Trend Line (3-Test Avg)"
              dot={false}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className={`p-4 md:p-6 min-h-screen font-sans ${DARK_BG} rounded-2xl`}>
      <div className="max-w-7xl mx-auto">
        <div className="animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h2
                  className={`text-3xl font-bold ${TEXT_PRIMARY} tracking-tight`}
                >
                  Performance Analytics
                </h2>
              </div>
              <p className={`${TEXT_SECONDARY} text-sm`}>
                Track your learning journey and improvement over time
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full lg:w-auto">
              <div className="relative group">
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  className={`w-full ${CARD_BG} border ${TEXT_PRIMARY} text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 appearance-none cursor-pointer hover:bg-slate-800/50 transition-colors`}
                >
                  {testTypes.map((type) => (
                    <option key={type} value={type} className="bg-slate-900">
                      {type === "all" ? "All Test Types" : type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`flex ${CARD_BG} border rounded-xl p-1`}>
                {["line", "area", "bar"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition duration-300 ${
                      chartType === type
                        ? "bg-cyan-600 text-white"
                        : `${TEXT_SECONDARY} hover:bg-slate-700/50 hover:text-cyan-400`
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              className={`${CARD_BG} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-12 h-12 text-cyan-500" />
              </div>
              <div className="relative z-10">
                <div
                  className={`text-3xl font-bold mb-1 group-hover:text-cyan-400 transition-colors ${
                    progress > 0
                      ? "text-green-400"
                      : progress < 0
                      ? "text-red-400"
                      : darkMode
                      ? "text-slate-300"
                      : "text-gray-700"
                  }`}
                >
                  {progress > 0 ? "+" : ""}
                  {progress}%
                </div>
                <div className="text-cyan-500/80 text-xs font-mono uppercase tracking-wider">
                  Total Progress
                </div>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  First score to last score
                </p>
              </div>
            </div>

            <div
              className={`${CARD_BG} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-12 h-12 text-purple-500" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-purple-400 mb-1 group-hover:text-purple-300 transition-colors">
                  {latestScore}%
                </div>
                <div className="text-purple-500/80 text-xs font-mono uppercase tracking-wider">
                  Latest Score
                </div>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  Your most recent result
                </p>
              </div>
            </div>

            <div
              className={`${CARD_BG} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-emerald-400 mb-1 group-hover:text-emerald-300 transition-colors">
                  {Math.round(averageScore)}%
                </div>
                <div className="text-emerald-500/80 text-xs font-mono uppercase tracking-wider">
                  Overall Average
                </div>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  Mean score across all tests
                </p>
              </div>
            </div>

            <div
              className={`${CARD_BG} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-12 h-12 text-amber-500" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-amber-400 mb-1 group-hover:text-amber-300 transition-colors">
                  {filteredData.length}
                </div>
                <div className="text-amber-500/80 text-xs font-mono uppercase tracking-wider">
                  Tests Taken
                </div>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  Filtered by: {selectedTestType}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${CARD_BG} border rounded-2xl p-6 mb-8 backdrop-blur-sm hover:border-slate-700 transition-colors`}
          >
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${CARD_BG} border rounded-2xl p-6 backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className={`text-lg font-semibold ${TEXT_PRIMARY}`}>
                Performance Summary
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className={TEXT_SECONDARY}>
                <span
                  className={`font-semibold ${
                    darkMode ? "text-cyan-300" : "text-cyan-600"
                  }`}
                >
                  Trend Status:{" "}
                </span>
                {progress > 5
                  ? "Strong improvement 🚀 - Keep up the momentum!"
                  : progress > 0
                  ? "Steady positive progress 📈 - Consistency pays off."
                  : progress === 0
                  ? "Maintaining stable performance ↔️ - Opportunities for growth may exist."
                  : "Needs attention 📉 - Time to review recent results."}
              </div>
              <div className={TEXT_SECONDARY}>
                <span
                  className={`font-semibold ${
                    darkMode ? "text-cyan-300" : "text-cyan-600"
                  }`}
                >
                  Test Consistency:{" "}
                </span>
                {filteredData.length >= 5
                  ? "High engagement: Regularly practicing ✅"
                  : "Moderate engagement: Practice frequency could be increased 💪"}
              </div>
              <div className={TEXT_SECONDARY}>
                <span
                  className={`font-semibold ${
                    darkMode ? "text-cyan-300" : "text-cyan-600"
                  }`}
                >
                  Peak Score:{" "}
                </span>
                {Math.max(...filteredData.map((item) => item.score))}%
                (Excellent!)
              </div>
              <div className={TEXT_SECONDARY}>
                <span
                  className={`font-semibold ${
                    darkMode ? "text-cyan-300" : "text-cyan-600"
                  }`}
                >
                  Learning Pace:{" "}
                </span>
                {filteredData.length > 1
                  ? `${(progress / filteredData.length).toFixed(
                      1
                    )}% score change per test`
                  : "Analysis requires more data points."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
