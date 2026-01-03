import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Activity, Target, Trophy, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

const PerformanceOverview = ({ data }) => {
  const COLORS = {
    correct: '#10B981',   
    incorrect: '#EF4444', 
    skipped: '#475569',  
    cyan: '#06B6D4',      
    grid: '#334155',     
    text: '#94a3b8',
    primary: '#06B6D4',
    secondary: '#10B981',
    accent: '#8B5CF6',
    slate: '#64748b',
  };
  const {theme } = useTheme()
  const darkMode = theme === "dark"
  const DARK_BG = darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-black" : "bg-white";
  const CARD_BG = darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200";
  const TEXT_PRIMARY = darkMode ? "text-white" : "text-gray-900";
  const TEXT_SECONDARY = darkMode ? "text-slate-400" : "text-gray-600";

  if (!data) {
    return (
      <div className={`${DARK_BG} min-h-screen p-8 rounded-2xl`}>
        <div className="flex flex-col items-center justify-center py-20">
          <BarChart3 className="w-16 h-16 mb-4 opacity-30 text-cyan-400" />
          <p className="text-xl font-light text-slate-300">No Performance Data</p>
          <p className="text-sm mt-2 font-mono text-cyan-500/60">
            Complete tests to see your performance metrics
          </p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Correct', value: data.correctAnswers, color: COLORS.correct },
    { name: 'Incorrect', value: data.incorrectAnswers, color: COLORS.incorrect },
    { name: 'Skipped', value: data.skippedAnswers, color: COLORS.skipped },
  ];

  const barData = data.testTypes?.map(test => ({
    name: test.type,
    attempts: test.attemptCount,
    avgScore: test.averageScore,
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-slate-200 font-bold mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs font-mono mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.fill }}
              ></span>
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

return (
  <div className={`p-4 md:p-6 min-h-screen font-sans ${darkMode ? "bg-linear-to-br from-slate-950 via-slate-900 to-black" : "bg-linear-to-br from-gray-50 via-white to-gray-100"} rounded-2xl`}>
    <div className="max-w-7xl mx-auto">
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-8">
          <Activity className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
          <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} tracking-tight`}>
            Performance Overview
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-1 group-hover:text-emerald-400 transition-colors`}>
                {data.totalTests || 0}
              </div>
              <div className={`${darkMode ? "text-emerald-500/80" : "text-emerald-600/80"} text-xs font-mono uppercase tracking-wider`}>
                Total Tests
              </div>
              <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                Deployments executed
              </p>
            </div>
          </div>

          <div className={`${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 className="w-12 h-12 text-cyan-500" />
            </div>
            <div className="relative z-10">
              <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-1 group-hover:text-cyan-400 transition-colors`}>
                {data.averageScore || 0}%
              </div>
              <div className={`${darkMode ? "text-cyan-500/80" : "text-cyan-600/80"} text-xs font-mono uppercase tracking-wider`}>
                Average Score
              </div>
              <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                Mean performance
              </p>
            </div>
          </div>

          <div className={`${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition-colors`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-12 h-12 text-purple-500" />
            </div>
            <div className="relative z-10">
              <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-1 group-hover:text-purple-400 transition-colors`}>
                {data.bestScore || 0}%
              </div>
              <div className={`${darkMode ? "text-purple-500/80" : "text-purple-600/80"} text-xs font-mono uppercase tracking-wider`}>
                Peak Efficiency
              </div>
              <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                All-time high
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-6 backdrop-blur-sm hover:border-slate-700 transition-colors`}>
            <div className="flex items-center gap-2 mb-6">
              <Activity className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Distribution Metrics
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className={`${darkMode ? "text-slate-400" : "text-gray-600"} ml-2 text-sm`}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-6 backdrop-blur-sm hover:border-slate-700 transition-colors`}>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className={`w-5 h-5 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Type Analysis
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={COLORS.grid} 
                    strokeOpacity={0.5}
                    vertical={false} 
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: COLORS.slate, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: COLORS.grid }}
                  />
                  <YAxis 
                    tick={{ fill: COLORS.slate, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: COLORS.grid }}
                  />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className={`${darkMode ? "text-slate-400" : "text-gray-600"} ml-2 text-sm`}>{value}</span>
                    )}
                  />
                  <Bar 
                    dataKey="attempts" 
                    fill={COLORS.cyan} 
                    name="Attempts" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill={COLORS.correct} 
                    name="Avg Score (%)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default PerformanceOverview;