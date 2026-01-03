import React, { useState } from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Users, Target, TrendingUp, Award } from 'lucide-react';

const ComparisonChart = ({ data }) => {
  const [view, setView] = useState('radar');

  
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🏆</div>
        <p className="text-lg">No comparison data available</p>
        <p className="text-sm mt-2">Complete more tests to see comparisons</p>
      </div>
    );
  }

  const { userStats, averageStats, percentile, strengths, weaknesses } = data;

  
  const subjects = Object.keys(userStats);
  const radarData = subjects.map((subject) => ({
    subject: subject.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    user: userStats[subject] || 0,
    average: averageStats[subject] || 0,
    fullMark: 100,
  }));

  const barData = subjects.map((subject) => ({
    name: subject.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    yourScore: userStats[subject] || 0,
    avgScore: averageStats[subject] || 0,
  }));

  const skillDistribution = [
    { name: 'Strengths', value: strengths.length, color: '#10B981' },
    { name: 'Average', value: subjects.length - strengths.length - weaknesses.length, color: '#F59E0B' },
    { name: 'Weaknesses', value: weaknesses.length, color: '#EF4444' },
  ];

  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  
  const renderChart = () => {
    switch (view) {
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Your Score"
                dataKey="user"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.6}
              />
              <Radar
                name="Average Score"
                dataKey="average"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="yourScore" name="Your Score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgScore" name="Average Score" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  
  return (
    <div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Comparison</h2>
          <p className="text-gray-600 mt-1">See how you stack up against other test takers</p>
        </div>

        <div className="flex gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => setView('radar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'radar' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Radar View
          </button>
          <button
            onClick={() => setView('bar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === 'bar' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Bar View
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">{percentile}%</div>
          <div className="text-purple-700 font-medium">Percentile Rank</div>
          <div className="text-purple-600 text-sm mt-2">
            You scored better than {percentile}% of users
          </div>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <Award className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{strengths.length}</div>
          <div className="text-green-700 font-medium">Strong Areas</div>
          <div className="text-green-600 text-sm mt-2">
            {strengths.join(', ') || 'None identified yet'}
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{weaknesses.length}</div>
          <div className="text-blue-700 font-medium">Areas to Improve</div>
          <div className="text-blue-600 text-sm mt-2">
            {weaknesses.join(', ') || 'Great job across all areas!'}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Comparison</h3>
          <div className="h-80">{renderChart()}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'skills']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-linear-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Your Strengths
          </h3>
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium capitalize">{strength}</span>
                <span className="text-green-600 text-sm font-semibold">
                  +{Math.round((userStats[strength] || 0) - (averageStats[strength] || 0))}%
                </span>
              </li>
            ))}
            {strengths.length === 0 && (
              <li className="text-gray-600 text-sm">Complete more tests to identify your strengths</li>
            )}
          </ul>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-red-100 border border-orange-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Improvement Opportunities
          </h3>
          <ul className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700 font-medium capitalize">{weakness}</span>
                <span className="text-orange-600 text-sm font-semibold">
                  {Math.round((averageStats[weakness] || 0) - (userStats[weakness] || 0))}% below avg
                </span>
              </li>
            ))}
            {weaknesses.length === 0 && (
              <li className="text-green-600 text-sm font-medium">🎉 Excellent! You're performing well in all areas</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;
