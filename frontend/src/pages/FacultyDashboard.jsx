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
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    api.get('faculty/my-subjects/').then(res => setSubjects(res.data));
  }, []);

  const loadMarks = async (subject) => {
    setActiveSubject(subject);
    setActiveTab('marks');
    setStatusMessage(null);
    const res = await api.get(`subjects/${subject.id}/marks/`);
    setMarks(res.data);
  };

  const isInvalidMark = (val, min = 0, max = null) => {
    if (val === '' || val === null || val === undefined) return false;
    const n = Number(val);
    if (isNaN(n) || n < min) return true;
    if (max !== null && max !== undefined && n > max) return true;
    return false;
  };

  const handleMarkChange = (id, field, value) => {
    setMarks(marks.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const validateAllMarks = () => {
    if (!activeSubject) return null;
    for (const m of marks) {
      const studentLabel = `${m.student_name || 'Student'} (${m.roll_number || m.id})`;

      if (activeSubject.subject_type === 'THEORY') {
        const theoryChecks = [
          { key: 'internal_1', label: 'Internal 1', min: 0, max: 20 },
          { key: 'internal_2', label: 'Internal 2', min: 0, max: 20 },
          { key: 'internal_3', label: 'Internal 3', min: 0, max: 20 },
          { key: 'end_semester', label: 'End Semester', min: 0, max: 60 },
        ];
        for (const check of theoryChecks) {
          const val = m[check.key];
          if (val !== '' && val !== null && val !== undefined) {
            const num = Number(val);
            if (isNaN(num)) return `${studentLabel}: ${check.label} must be a number.`;
            if (num < check.min) return `${studentLabel}: ${check.label} cannot be negative (min: ${check.min}).`;
            if (num > check.max) return `${studentLabel}: ${check.label} cannot exceed ${check.max}.`;
          }
        }
      } else if (activeSubject.subject_type === 'LAB') {
        const maxMarks = activeSubject.maximum_marks || 100;
        const labChecks = [
          { key: 'lab_test_1', label: 'Lab Test 1' },
          { key: 'lab_test_2', label: 'Lab Test 2' },
          { key: 'final_lab_viva', label: 'Final Lab Viva' },
        ];
        for (const check of labChecks) {
          const val = m[check.key];
          if (val !== '' && val !== null && val !== undefined) {
            const num = Number(val);
            if (isNaN(num)) return `${studentLabel}: ${check.label} must be a number.`;
            if (num < 0) return `${studentLabel}: ${check.label} cannot be negative.`;
            if (num > maxMarks) return `${studentLabel}: ${check.label} cannot exceed ${maxMarks}.`;
          }
        }
      } else if (activeSubject.subject_type === 'COMPREHENSIVE_VIVA') {
        const maxMarks = activeSubject.maximum_marks || 100;
        const val = m.comprehensive_viva;
        if (val !== '' && val !== null && val !== undefined) {
          const num = Number(val);
          if (isNaN(num)) return `${studentLabel}: Comprehensive Viva must be a number.`;
          if (num < 0) return `${studentLabel}: Comprehensive Viva cannot be negative.`;
          if (num > maxMarks) return `${studentLabel}: Comprehensive Viva cannot exceed ${maxMarks}.`;
        }
      }
    }
    return null;
  };

  const saveMarks = async () => {
    setStatusMessage(null);
    const validationError = validateAllMarks();
    if (validationError) {
      setStatusMessage({ type: 'error', text: validationError });
      alert(validationError);
      return;
    }

    try {
      const res = await api.post(`subjects/${activeSubject.id}/marks/`, { marks });
      setStatusMessage({ type: 'success', text: res.data.message || 'Marks saved successfully.' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to save marks';
      setStatusMessage({ type: 'error', text: errorMsg });
      alert(errorMsg);
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
          <ul className="space-y-2">
            {subjects.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => loadMarks(s)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    activeSubject?.id === s.id
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`font-semibold text-sm ${activeSubject?.id === s.id ? 'text-blue-700' : 'text-gray-800'}`}>
                    {s.subject_code} - {s.name}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    {s.batch_name && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        Batch: {s.batch_name}
                      </span>
                    )}
                    {s.semester_name && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {s.semester_name}
                      </span>
                    )}
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      {s.subject_type}
                    </span>
                  </div>
                </button>
              </li>
            ))}
            {subjects.length === 0 && <p className="text-sm text-gray-500">No subjects assigned.</p>}
          </ul>
        </div>

        <div className="col-span-3 bg-white p-6 shadow rounded">
          {activeSubject ? (
            <div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Managing: {activeSubject.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                    <span><strong className="text-gray-700">Code:</strong> {activeSubject.subject_code}</span>
                    {activeSubject.batch_name && (
                      <span><strong className="text-gray-700">Batch:</strong> {activeSubject.batch_name}</span>
                    )}
                    {activeSubject.semester_name && (
                      <span><strong className="text-gray-700">Semester:</strong> {activeSubject.semester_name}</span>
                    )}
                    <span><strong className="text-gray-700">Type:</strong> {activeSubject.subject_type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('marks')} className={`px-4 py-2 font-bold rounded shadow-sm transition ${activeTab==='marks'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Marks Entry</button>
                  <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 font-bold rounded shadow-sm transition ${activeTab==='analytics'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>View Analytics</button>
                </div>
              </div>

              {statusMessage && (
                <div className={`mb-4 p-3 rounded font-medium text-sm flex items-center justify-between ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  <span>{statusMessage.text}</span>
                  <button onClick={() => setStatusMessage(null)} className="text-sm font-bold ml-4 hover:opacity-75">✕</button>
                </div>
              )}

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
                          <th className="p-2 border text-center">Int 1 (0-20)</th>
                          <th className="p-2 border text-center">Int 2 (0-20)</th>
                          <th className="p-2 border text-center">Int 3 (0-20)</th>
                          <th className="p-2 border text-center">End Sem (0-60)</th>
                        </>
                      )}
                      
                      {activeSubject.subject_type === 'LAB' && (
                        <>
                          <th className="p-2 border text-center">Test 1</th>
                          <th className="p-2 border text-center">Test 2</th>
                          <th className="p-2 border text-center">Final Viva</th>
                        </>
                      )}
                      
                      {activeSubject.subject_type === 'COMPREHENSIVE_VIVA' && (
                        <th className="p-2 border text-center">Viva Marks</th>
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
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="any"
                                placeholder="0-20"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.internal_1, 0, 20) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.internal_1 ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'internal_1', e.target.value)}
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="any"
                                placeholder="0-20"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.internal_2, 0, 20) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.internal_2 ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'internal_2', e.target.value)}
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="any"
                                placeholder="0-20"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.internal_3, 0, 20) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.internal_3 ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'internal_3', e.target.value)}
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max="60"
                                step="any"
                                placeholder="0-60"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.end_semester, 0, 60) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.end_semester ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'end_semester', e.target.value)}
                              />
                            </td>
                          </>
                        )}

                        {activeSubject.subject_type === 'LAB' && (
                          <>
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max={activeSubject.maximum_marks || 100}
                                step="any"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.lab_test_1, 0, activeSubject.maximum_marks || 100) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.lab_test_1 ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'lab_test_1', e.target.value)}
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max={activeSubject.maximum_marks || 100}
                                step="any"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.lab_test_2, 0, activeSubject.maximum_marks || 100) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.lab_test_2 ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'lab_test_2', e.target.value)}
                              />
                            </td>
                            <td className="p-1 border text-center">
                              <input
                                type="number"
                                min="0"
                                max={activeSubject.maximum_marks || 100}
                                step="any"
                                className={`w-20 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.final_lab_viva, 0, activeSubject.maximum_marks || 100) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                value={m.final_lab_viva ?? ''}
                                onChange={e=>handleMarkChange(m.id, 'final_lab_viva', e.target.value)}
                              />
                            </td>
                          </>
                        )}
                        
                        {activeSubject.subject_type === 'COMPREHENSIVE_VIVA' && (
                          <td className="p-1 border text-center">
                            <input
                              type="number"
                              min="0"
                              max={activeSubject.maximum_marks || 100}
                              step="any"
                              className={`w-24 border rounded p-1 text-center font-mono text-sm focus:outline-none transition ${isInvalidMark(m.comprehensive_viva, 0, activeSubject.maximum_marks || 100) ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                              value={m.comprehensive_viva ?? ''}
                              onChange={e=>handleMarkChange(m.id, 'comprehensive_viva', e.target.value)}
                            />
                          </td>
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
