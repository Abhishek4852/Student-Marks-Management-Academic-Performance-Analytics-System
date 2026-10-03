import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AnalyticsViewer from '../components/AnalyticsViewer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  
  const [selectedProgram, setSelectedProgram] = useState('');
  const [batchName, setBatchName] = useState('');
  const [activeBatch, setActiveBatch] = useState(null);

  useEffect(() => {
    api.get('programs/').then(res => setPrograms(res.data));
    api.get('batches/').then(res => setBatches(res.data));
    fetchFaculties();
  }, []);

  const fetchFaculties = () => {
    api.get('faculty/').then(res => setFaculties(res.data));
  };

  const approveFaculty = async (id) => {
    await api.patch(`faculty/${id}/approve/`, { is_approved: true });
    fetchFaculties();
  };

  const createBatch = async () => {
    const res = await api.post('batches/', {
      degree_program: selectedProgram,
      name: batchName,
      start_year: 2022,
      end_year: 2026
    });
    setBatches([...batches, res.data]);
    setActiveBatch(res.data);
    alert('Batch created!');
  };

  const pendingFaculties = faculties.filter(f => !f.is_approved && f.role === 'FACULTY');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
      </div>

      {pendingFaculties.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded shadow mb-8 border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">Pending Faculty Approvals</h2>
          <ul className="space-y-3">
            {pendingFaculties.map(f => (
              <li key={f.id} className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
                <div>
                  <span className="font-bold">{f.username}</span> ({f.email})
                </div>
                <button onClick={() => approveFaculty(f.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve Faculty</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">1. Select Degree Program & Create Batch</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <select className="border border-gray-300 p-2 rounded" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
            <option value="">-- Select Program --</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="border border-gray-300 p-2 rounded" placeholder="Batch Name (e.g. 2022-2026)" value={batchName} onChange={e => setBatchName(e.target.value)} />
          <button onClick={createBatch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Create Batch</button>
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold text-gray-700">Existing Batches</h3>
          <div className="flex flex-wrap gap-3 mt-3">
            {batches.map(b => (
              <button key={b.id} className={`px-4 py-2 rounded font-semibold ${activeBatch?.id === b.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`} onClick={() => setActiveBatch(b)}>
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeBatch && (
        <BatchManager activeBatch={activeBatch} faculties={faculties} />
      )}
    </div>
  );
}

function BatchManager({ activeBatch, faculties }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [semesterName, setSemesterName] = useState('');
  const [semesterNum, setSemesterNum] = useState(1);
  const [activeSemester, setActiveSemester] = useState(null);
  
  // Student manual management state
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ student_name: '', roll_number: '', enrollment_number: '' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    api.get(`semesters/?batch_id=${activeBatch.id}`).then(res => setSemesters(res.data));
    fetchStudents();
  }, [activeBatch]);

  const fetchStudents = () => {
    api.get(`students/?batch_id=${activeBatch.id}`).then(res => setStudents(res.data));
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('students/import/preview/', formData);
      setPreview(res.data.preview);
    } catch (err) {
      alert('Upload failed. Ensure it is a valid Excel file.');
    }
  };

  const confirmImport = async () => {
    try {
      const res = await api.post('students/import/confirm/', {
        batch_id: activeBatch.id,
        students: preview
      });
      alert(res.data.message || 'Import successful');
      setPreview([]);
      fetchStudents(); 
    } catch (err) {
      alert('Error during import. Check if roll numbers already exist.');
    }
  };

  const createSemester = async () => {
    const res = await api.post('semesters/', {
      batch: activeBatch.id,
      semester_number: semesterNum,
      name: semesterName
    });
    setSemesters([...semesters, res.data]);
    alert('Semester Created!');
  };

  const addStudent = async () => {
    try {
      await api.post('students/', { ...newStudent, batch: activeBatch.id });
      setNewStudent({ student_name: '', roll_number: '', enrollment_number: '' });
      fetchStudents();
    } catch (e) {
      alert("Failed to add student. Ensure roll/enrollment numbers are unique.");
    }
  };

  const updateStudent = async () => {
    try {
      await api.patch(`students/${editingStudent.id}/`, editingStudent);
      setEditingStudent(null);
      fetchStudents();
    } catch (e) {
      alert("Failed to update student.");
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`students/${id}/`);
        fetchStudents();
      } catch (e) {
        alert("Failed to delete student.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-green-500">
      <h2 className="text-2xl font-bold mb-6 text-green-800">Managing Batch: {activeBatch.name}</h2>
      
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-3 border-b pb-2">Batch Students Management</h3>
          <div className="flex gap-2 mb-4">
            <input className="border p-2 w-1/3 text-sm" placeholder="Name" value={newStudent.student_name} onChange={e=>setNewStudent({...newStudent, student_name: e.target.value})} />
            <input className="border p-2 w-1/3 text-sm" placeholder="Roll No" value={newStudent.roll_number} onChange={e=>setNewStudent({...newStudent, roll_number: e.target.value})} />
            <input className="border p-2 w-1/3 text-sm" placeholder="Enrollment No" value={newStudent.enrollment_number} onChange={e=>setNewStudent({...newStudent, enrollment_number: e.target.value})} />
            <button onClick={addStudent} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold">Add</button>
          </div>
          
          <div className="max-h-60 overflow-y-auto border rounded">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr><th className="p-2 border">Name</th><th className="p-2 border">Roll</th><th className="p-2 border">Actions</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 border-b">
                    {editingStudent?.id === s.id ? (
                      <>
                        <td className="p-1"><input className="border p-1 w-full" value={editingStudent.student_name} onChange={e=>setEditingStudent({...editingStudent, student_name: e.target.value})} /></td>
                        <td className="p-1"><input className="border p-1 w-full" value={editingStudent.roll_number} onChange={e=>setEditingStudent({...editingStudent, roll_number: e.target.value})} /></td>
                        <td className="p-1 flex gap-1">
                          <button onClick={updateStudent} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Save</button>
                          <button onClick={()=>setEditingStudent(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{s.student_name}</td>
                        <td className="p-2">{s.roll_number}</td>
                        <td className="p-2 flex gap-2">
                          <button onClick={()=>setEditingStudent(s)} className="text-blue-600 hover:underline">Edit</button>
                          <button onClick={()=>deleteStudent(s.id)} className="text-red-600 hover:underline">Del</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">No students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded border h-fit">
          <h3 className="text-lg font-bold mb-3">Or Bulk Upload via Excel</h3>
          <input type="file" onChange={e => setFile(e.target.files[0])} className="mb-4 block w-full text-sm" />
          <button onClick={handleUpload} className="bg-green-600 text-white px-4 py-2 rounded font-bold w-full mb-4">Preview Excel</button>
          
          {preview.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-bold mb-2">Preview Data ({preview.length} rows):</h4>
              <div className="bg-gray-100 p-2 rounded mb-4 max-h-40 overflow-y-auto text-xs font-mono">{JSON.stringify(preview, null, 2)}</div>
              <button onClick={confirmImport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold w-full shadow-lg">Confirm & Import to Database</button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Create Semester</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <input className="border border-gray-300 p-2 rounded w-32" type="number" placeholder="Sem Num (e.g. 1)" value={semesterNum} onChange={e=>setSemesterNum(e.target.value)} />
          <input className="border border-gray-300 p-2 rounded w-64" placeholder="Semester Name (e.g. Semester 1)" value={semesterName} onChange={e=>setSemesterName(e.target.value)} />
          <button onClick={createSemester} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold">Create Semester</button>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          {semesters.map(s => (
            <button key={s.id} onClick={() => setActiveSemester(s)} className={`px-4 py-2 rounded font-bold shadow-sm ${activeSemester?.id === s.id ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {activeSemester && <SemesterManager activeSemester={activeSemester} batchId={activeBatch.id} faculties={faculties} />}
    </div>
  );
}

function SemesterManager({ activeSemester, batchId, faculties }) {
  const [subjects, setSubjects] = useState([]);
  
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subType, setSubType] = useState('THEORY');
  const [assignedFac, setAssignedFac] = useState('');
  const [analyticsSubject, setAnalyticsSubject] = useState(null);
  
  const [showRankings, setShowRankings] = useState(false);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    api.get(`subjects/?semester_id=${activeSemester.id}`).then(res => setSubjects(res.data));
  }, [activeSemester]);

  const createSubject = async () => {
    const res = await api.post('subjects/', {
      semester: activeSemester.id,
      name: subName,
      subject_code: subCode,
      subject_type: subType,
      assigned_faculty: assignedFac || null
    });
    setSubjects([...subjects, res.data]);
    setSubName(''); setSubCode('');
  };

  const enrollAll = async () => {
    try {
      const res = await api.post(`semesters/${activeSemester.id}/enroll-all/`);
      alert(res.data.message);
    } catch (e) {
      alert("Error enrolling students.");
    }
  };

  const loadRankings = async () => {
    try {
      const res = await api.get(`semesters/${activeSemester.id}/ranking/`);
      setRankings(res.data);
      setShowRankings(true);
    } catch (e) {
      alert("Error loading rankings.");
    }
  };

  const approvedFaculties = faculties.filter(f => f.is_approved && f.role === 'FACULTY');

  return (
    <div className="bg-purple-50 p-6 rounded shadow border border-purple-200 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-purple-900">Manage Semester: {activeSemester.name}</h3>
        <button onClick={loadRankings} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow">View Semester Rankings</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input className="border p-2 rounded" placeholder="Subject Name" value={subName} onChange={e=>setSubName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Sub Code" value={subCode} onChange={e=>setSubCode(e.target.value)} />
        <select className="border p-2 rounded bg-white" value={subType} onChange={e=>setSubType(e.target.value)}>
          <option value="THEORY">Theory</option>
          <option value="LAB">Lab</option>
          <option value="COMPREHENSIVE_VIVA">Viva</option>
        </select>
        <select className="border p-2 rounded bg-white" value={assignedFac} onChange={e=>setAssignedFac(e.target.value)}>
          <option value="">-- Assign Faculty --</option>
          {approvedFaculties.map(f => <option key={f.id} value={f.id}>{f.username}</option>)}
        </select>
        <button onClick={createSubject} className="bg-green-600 hover:bg-green-700 text-white rounded font-bold">Add Subject</button>
      </div>

      <div className="mb-6 bg-white p-4 rounded border">
        <h4 className="font-bold text-gray-700 mb-3">Subjects List ({subjects.length}):</h4>
        {subjects.length === 0 ? <p className="text-gray-500 text-sm">No subjects yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map(s => (
              <div key={s.id} className="border p-3 rounded flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-bold text-gray-800">{s.subject_code} - {s.name}</div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">{s.subject_type}</div>
                </div>
                <div className="flex gap-2 items-center text-sm text-gray-600">
                  <span>Teacher ID: {s.assigned_faculty || 'None'}</span>
                  <button onClick={() => setAnalyticsSubject(s)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded font-bold shadow-sm ml-2">Analytics</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {analyticsSubject && (
        <div className="mb-6">
          <AnalyticsViewer subjectId={analyticsSubject.id} subjectName={analyticsSubject.name} onClose={() => setAnalyticsSubject(null)} />
        </div>
      )}

      {showRankings && (
        <div className="mb-6 bg-white p-4 rounded shadow border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg">Semester Rankings</h4>
            <button onClick={() => setShowRankings(false)} className="text-red-500 hover:underline">Close Rankings</button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 border">Rank</th>
                  <th className="p-2 border">Roll No</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Overall Marks</th>
                  <th className="p-2 border">End Sem Total</th>
                  <th className="p-2 border">Int 2 Total</th>
                  <th className="p-2 border">Int 1 Total</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-b">
                    <td className="p-2 border font-bold text-blue-600">#{r.rank}</td>
                    <td className="p-2 border">{r.roll_number}</td>
                    <td className="p-2 border">{r.name}</td>
                    <td className="p-2 border font-bold">{r.overall}</td>
                    <td className="p-2 border">{r.end_sem}</td>
                    <td className="p-2 border">{r.int2}</td>
                    <td className="p-2 border">{r.int1}</td>
                  </tr>
                ))}
                {rankings.length === 0 && <tr><td colSpan="7" className="p-4 text-center">No rankings available yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button onClick={enrollAll} className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-4 rounded shadow-lg font-bold w-full text-lg tracking-wide transition transform hover:-translate-y-1">
        FINAL STEP: ENROLL ALL BATCH STUDENTS TO THIS SEMESTER'S SUBJECTS
      </button>
      <p className="text-center text-sm text-gray-600 mt-2">This will assign the subjects to all students in the batch and make them visible to the assigned faculty for marks entry.</p>
    </div>
  );
}
