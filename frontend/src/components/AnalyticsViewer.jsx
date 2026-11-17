import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

export default function AnalyticsViewer({ subjectId, subjectName, onClose }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLimit, setViewLimit] = useState('top10'); // 'top10' | 'top25' | 'all'

  useEffect(() => {
    if (subjectId) {
      api.get(`subjects/${subjectId}/analytics/`).then(res => setData(res.data));
    }
  }, [subjectId]);

  if (!data) return <div className="p-8 text-center text-gray-500 font-bold">Loading analytics...</div>;

  const { students, averages, subject_type } = data;

  const getMetricLabel = (key) => {
    if (key === 'internal_1') return subject_type === 'THEORY' ? 'Internal 1' : 'Test 1';
    if (key === 'internal_2') return subject_type === 'THEORY' ? 'Internal 2' : 'Test 2';
    if (key === 'internal_3') return 'Internal 3';
    if (key === 'end_semester') return subject_type === 'THEORY' ? 'End Semester' : 'Final Viva';
    if (key === 'overall') return 'Overall Combined';
    return key;
  };

  // Sort students descending by selected metric
  const sortedStudents = [...students].sort((a, b) => {
    const scoreA = Number(a[filter] ?? 0);
    const scoreB = Number(b[filter] ?? 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.roll_number || '').localeCompare(b.roll_number || '');
  });

  // Assign ranks (handling ties properly)
  let currentRank = 1;
  const rankedStudents = sortedStudents.map((s, idx) => {
    if (idx > 0) {
      const prevScore = Number(sortedStudents[idx - 1][filter] ?? 0);
      const currScore = Number(s[filter] ?? 0);
      if (currScore !== prevScore) {
        currentRank = idx + 1;
      }
    }
    return { ...s, rank: currentRank };
  });

  // Filter by search query
  const filteredStudents = rankedStudents.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (s.student_name && s.student_name.toLowerCase().includes(term)) ||
           (s.roll_number && s.roll_number.toLowerCase().includes(term));
  });

  // Sliced according to view limit
  const displayedStudents = viewLimit === 'all'
    ? filteredStudents
    : viewLimit === 'top25'
      ? filteredStudents.slice(0, 25)
      : filteredStudents.slice(0, 10);

  const getPerformanceBadge = (score) => {
    const num = Number(score ?? 0);
    if (num >= 80) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Distinction (80%+)</span>;
    if (num >= 60) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">First Class (60-79%)</span>;
    if (num >= 40) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pass (40-59%)</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Needs Attention (&lt;40%)</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 shadow-sm">🥇 1</span>;
    if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-sm">🥈 2</span>;
    if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-800 font-bold text-xs border border-orange-300 shadow-sm">🥉 3</span>;
    return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200">#{rank}</span>;
  };

  return (
    <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Performance Analytics: {subjectName}</h2>
        {onClose && <button onClick={onClose} className="text-red-500 hover:text-red-700 font-bold">Close Analytics</button>}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6 p-5 bg-blue-50 rounded-lg border border-blue-100 items-center">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Filter Metric (Normalized to 100%)</label>
          <select className="border border-gray-300 p-2 rounded shadow-sm bg-white min-w-[200px]" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="overall">Overall Combined</option>
            <option value="internal_1">{getMetricLabel('internal_1')}</option>
            <option value="internal_2">{getMetricLabel('internal_2')}</option>
            {subject_type === 'THEORY' && <option value="internal_3">{getMetricLabel('internal_3')}</option>}
            <option value="end_semester">{getMetricLabel('end_semester')}</option>
          </select>
        </div>
        
        <div className="ml-auto flex gap-8">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Class Avg ({getMetricLabel(filter)})</div>
            <div className="font-bold text-3xl text-blue-600">{averages[filter] || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Students</div>
            <div className="font-bold text-3xl text-gray-800">{students.length}</div>
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={students} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="roll_number" tick={{fontSize: 12}} />
            <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey={filter} name={getMetricLabel(filter) + ' (%)'} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏆 Student Leaderboard & Performance Ranking
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Ranked by <strong>{getMetricLabel(filter)}</strong> ({filter === 'overall' ? 'Combined Score' : 'Normalized to 100%'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search name or roll no..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setViewLimit('top10')}
                className={`px-3 py-1.5 transition ${viewLimit === 'top10' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Top 10
              </button>
              <button
                onClick={() => setViewLimit('top25')}
                className={`px-3 py-1.5 border-l border-r border-gray-300 transition ${viewLimit === 'top25' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Top 25
              </button>
              <button
                onClick={() => setViewLimit('all')}
                className={`px-3 py-1.5 transition ${viewLimit === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                All ({students.length})
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        {rankedStudents.length >= 3 && !searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <div className="bg-gradient-to-b from-slate-50 to-gray-100 border border-slate-300 rounded-xl p-4 text-center shadow-sm order-2 md:order-1">
              <div className="text-3xl mb-1">🥈</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">2nd Place</div>
              <div className="font-bold text-base text-gray-800 mt-1 truncate" title={rankedStudents[1].student_name}>
                {rankedStudents[1].student_name}
              </div>
              <div className="text-xs font-mono text-gray-500">{rankedStudents[1].roll_number}</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-700">{rankedStudents[1][filter] ?? 0}%</div>
            </div>

            {/* 1st Place */}
            <div className="bg-gradient-to-b from-amber-50 to-yellow-100 border-2 border-amber-400 rounded-xl p-4 text-center shadow-md transform md:-translate-y-2 order-1 md:order-2">
              <div className="text-3xl mb-1">👑 🥇</div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Class Topper</div>
              <div className="font-bold text-lg text-gray-900 mt-1 truncate" title={rankedStudents[0].student_name}>
                {rankedStudents[0].student_name}
              </div>
              <div className="text-xs font-mono text-gray-600">{rankedStudents[0].roll_number}</div>
              <div className="mt-2 text-3xl font-black text-amber-800">{rankedStudents[0][filter] ?? 0}%</div>
            </div>

            {/* 3rd Place */}
            <div className="bg-gradient-to-b from-orange-50 to-amber-100 border border-orange-300 rounded-xl p-4 text-center shadow-sm order-3">
              <div className="text-3xl mb-1">🥉</div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-700">3rd Place</div>
              <div className="font-bold text-base text-gray-800 mt-1 truncate" title={rankedStudents[2].student_name}>
                {rankedStudents[2].student_name}
              </div>
              <div className="text-xs font-mono text-gray-500">{rankedStudents[2].roll_number}</div>
              <div className="mt-2 text-2xl font-extrabold text-orange-800">{rankedStudents[2][filter] ?? 0}%</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm max-h-[450px] overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0 shadow-sm text-gray-700 font-semibold">
              <tr>
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3 w-36">Roll Number</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 w-32 text-center">{getMetricLabel(filter)}</th>
                <th className="p-3 w-44 text-center">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedStudents.map(s => (
                <tr key={s.roll_number} className="hover:bg-blue-50/50 transition">
                  <td className="p-3 text-center">{getRankBadge(s.rank)}</td>
                  <td className="p-3 font-mono font-medium text-gray-800">{s.roll_number}</td>
                  <td className="p-3 font-medium text-gray-900">{s.student_name}</td>
                  <td className="p-3 text-center font-bold text-blue-700 font-mono">
                    {s[filter] !== null && s[filter] !== undefined ? `${s[filter]}%` : 'N/A'}
                  </td>
                  <td className="p-3 text-center">
                    {getPerformanceBadge(s[filter])}
                  </td>
                </tr>
              ))}
              {displayedStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500 font-medium">
                    No students match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
