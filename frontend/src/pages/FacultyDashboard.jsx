import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AnalyticsViewer from '../components/AnalyticsViewer';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [marks, setMarks] = useState([]);
  const [activeTab, setActiveTab] = useState('marks'); // 'marks' | 'analytics'

  useEffect(() => {
    api.get('faculty/my-subjects/').then(res => setSubjects(res.data));
  }, []);

  const loadMarks = async (subject) => {
    setActiveSubject(subject);
    setActiveTab('marks');
    const res = await api.get(`subjects/${subject.id}/marks/`);
    setMarks(res.data);
  };

  const handleMarkChange = (id, field, value) => {
    setMarks(marks.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const saveMarks = async () => {
    try {
      const res = await api.post(`subjects/${activeSubject.id}/marks/`, { marks });
      alert(res.data.message);
    } catch (err) {
      alert('Failed to save marks');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 bg-white p-4 shadow rounded h-fit">
          <h2 className="font-bold text-xl mb-4 border-b pb-2">My Subjects</h2>
          <ul>
            {subjects.map(s => (
              <li key={s.id} className="mb-2">
                <button onClick={() => loadMarks(s)} className={`w-full text-left px-3 py-2 rounded ${activeSubject?.id === s.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                  {s.subject_code} - {s.name} <br/><span className="text-xs text-gray-500">{s.subject_type}</span>
                </button>
              </li>
            ))}
            {subjects.length === 0 && <p className="text-sm text-gray-500">No subjects assigned.</p>}
          </ul>
        </div>

        <div className="col-span-3 bg-white p-6 shadow rounded">
          {activeSubject ? (
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-2xl font-bold">Managing: {activeSubject.name}</h2>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('marks')} className={`px-4 py-2 font-bold rounded shadow-sm transition ${activeTab==='marks'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Marks Entry</button>
                  <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 font-bold rounded shadow-sm transition ${activeTab==='analytics'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>View Analytics</button>
                </div>
              </div>

              {activeTab === 'marks' ? (
                <div>
                  <div className="overflow-x-auto border rounded max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-gray-100 sticky top-0 shadow-sm">
                        <tr>
                          <th className="p-3 border-b border-r bg-gray-100">Roll No</th>
                      <th className="p-2 border">Student Name</th>
                      
                      {activeSubject.subject_type === 'THEORY' && (
                        <>
                          <th className="p-2 border">Int 1 (20)</th>
                          <th className="p-2 border">Int 2 (20)</th>
                          <th className="p-2 border">Int 3 (20)</th>
                          <th className="p-2 border">End Sem (60)</th>
                        </>
                      )}
                      
                      {activeSubject.subject_type === 'LAB' && (
                        <>
                          <th className="p-2 border">Test 1</th>
                          <th className="p-2 border">Test 2</th>
                          <th className="p-2 border">Final Viva</th>
                        </>
                      )}
                      
                      {activeSubject.subject_type === 'COMPREHENSIVE_VIVA' && (
                        <th className="p-2 border">Viva Marks</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-2 border font-mono text-sm">{m.roll_number}</td>
                        <td className="p-2 border">{m.student_name}</td>
                        
                        {activeSubject.subject_type === 'THEORY' && (
                          <>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.internal_1 || ''} onChange={e=>handleMarkChange(m.id, 'internal_1', e.target.value)} /></td>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.internal_2 || ''} onChange={e=>handleMarkChange(m.id, 'internal_2', e.target.value)} /></td>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.internal_3 || ''} onChange={e=>handleMarkChange(m.id, 'internal_3', e.target.value)} /></td>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.end_semester || ''} onChange={e=>handleMarkChange(m.id, 'end_semester', e.target.value)} /></td>
                          </>
                        )}

                        {activeSubject.subject_type === 'LAB' && (
                          <>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.lab_test_1 || ''} onChange={e=>handleMarkChange(m.id, 'lab_test_1', e.target.value)} /></td>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.lab_test_2 || ''} onChange={e=>handleMarkChange(m.id, 'lab_test_2', e.target.value)} /></td>
                            <td className="p-1 border"><input type="number" className="w-16 border p-1" value={m.final_lab_viva || ''} onChange={e=>handleMarkChange(m.id, 'final_lab_viva', e.target.value)} /></td>
                          </>
                        )}
                        
                        {activeSubject.subject_type === 'COMPREHENSIVE_VIVA' && (
                          <td className="p-1 border"><input type="number" className="w-20 border p-1" value={m.comprehensive_viva || ''} onChange={e=>handleMarkChange(m.id, 'comprehensive_viva', e.target.value)} /></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={saveMarks} className="mt-6 bg-blue-600 text-white font-bold py-3 px-8 rounded shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">Save All Marks</button>
            </div>
              ) : (
                <AnalyticsViewer subjectId={activeSubject.id} subjectName={activeSubject.name} />
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-20">Select a subject to enter marks</div>
          )}
        </div>
      </div>
    </div>
  );
}
