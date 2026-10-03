import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

export default function AnalyticsViewer({ subjectId, subjectName, onClose }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('overall');

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

      <div className="h-[400px] w-full">
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
    </div>
  );
}
