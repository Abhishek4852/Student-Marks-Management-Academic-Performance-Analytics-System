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
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [activeBatch, setActiveBatch] = useState(null);
  const [batchError, setBatchError] = useState('');

  // Starting year range: from 2022 onwards (admin cannot create batch before 2022)
  const startYears = Array.from({ length: 14 }, (_, i) => 2022 + i);

  // When start year is chosen, course duration must be between 2 and 6 years only
  const sYearNum = parseInt(startYear, 10);
  const validEndYears = sYearNum
    ? [2, 3, 4, 5, 6].map(dur => ({
        year: sYearNum + dur,
        duration: dur
      }))
    : [];

  const selectedProgramObj = programs.find(p => String(p.id) === String(selectedProgram));
  const generatedBatchName = (selectedProgramObj && startYear && endYear)
    ? `${selectedProgramObj.name} ${startYear}-${endYear}`
    : '';

  const isDuplicateBatch = Boolean(
    selectedProgram &&
    startYear &&
    endYear &&
    batches.some(b => 
      String(b.degree_program) === String(selectedProgram) &&
      Number(b.start_year) === Number(startYear) &&
      Number(b.end_year) === Number(endYear)
    )
  );

  const handleStartYearChange = (year) => {
    setStartYear(year);
    setBatchError('');
    if (year && endYear) {
      const diff = parseInt(endYear, 10) - parseInt(year, 10);
      if (diff < 2 || diff > 6) {
        setEndYear('');
      }
    }
  };

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
    setBatchError('');
    if (!selectedProgram) {
      setBatchError('Please select a course / degree program.');
      return;
    }
    if (!startYear) {
      setBatchError('Please select a starting year.');
      return;
    }
    if (!endYear) {
      setBatchError('Please select an ending year.');
      return;
    }

    const sYear = parseInt(startYear, 10);
    const eYear = parseInt(endYear, 10);

    if (sYear < 2022) {
      setBatchError('Admin cannot create a batch before 2022.');
      return;
    }

    const duration = eYear - sYear;
    if (duration < 2 || duration > 6) {
      setBatchError('Course duration must be between 2 and 6 years only.');
      return;
    }

    if (isDuplicateBatch) {
      const errMsg = `A batch for "${selectedProgramObj?.name}" with duration ${sYear}-${eYear} already exists. You cannot create the same batch twice.`;
      setBatchError(errMsg);
      alert(errMsg);
      return;
    }

    const finalBatchName = `${selectedProgramObj.name} ${sYear}-${eYear}`;

    try {
      const res = await api.post('batches/', {
        degree_program: selectedProgram,
        name: finalBatchName,
        start_year: sYear,
        end_year: eYear
      });
      setBatches([...batches, res.data]);
      setActiveBatch(res.data);
      setStartYear('');
      setEndYear('');
      setBatchError('');
      alert(`Batch "${res.data.name}" created successfully!`);
    } catch (err) {
      const errorMsg = err.response?.data
        ? (typeof err.response.data === 'string'
            ? err.response.data
            : Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '))
        : 'Failed to create batch.';
      setBatchError(errorMsg);
      alert(errorMsg);
    }
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
        <h2 className="text-xl font-bold mb-2 text-gray-800">1. Select Degree Program & Create Batch</h2>
        <p className="text-xs text-gray-500 mb-4">
          Select course, starting year (2022 onwards), and ending year (duration between 2 to 6 years). Resulting batch name is automatically generated.
        </p>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Degree Program / Course */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Degree Program / Course</label>
            <select
              className="border border-gray-300 p-2 rounded bg-white min-w-[200px]"
              value={selectedProgram}
              onChange={e => {
                setSelectedProgram(e.target.value);
                setBatchError('');
              }}
            >
              <option value="">-- Select Course --</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Starting Year */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Starting Year (≥ 2022)</label>
            <select
              className="border border-gray-300 p-2 rounded bg-white min-w-[150px] disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={startYear}
              disabled={!selectedProgram}
              onChange={e => handleStartYearChange(e.target.value)}
            >
              <option value="">{selectedProgram ? '-- Start Year --' : '-- Select Course First --'}</option>
              {startYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Ending Year */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Ending Year (2 to 6 Years)</label>
            <select
              className="border border-gray-300 p-2 rounded bg-white min-w-[180px] disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={endYear}
              disabled={!startYear}
              onChange={e => {
                setEndYear(e.target.value);
                setBatchError('');
              }}
            >
              <option value="">{startYear ? '-- End Year --' : '-- Select Start Year First --'}</option>
              {validEndYears.map(({ year, duration }) => (
                <option key={year} value={year}>{year} ({duration} Years)</option>
              ))}
            </select>
          </div>

          {/* Resulting Batch Name */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Resulting Batch Name</label>
            <input
              type="text"
              readOnly
              className="border border-gray-300 p-2 rounded bg-gray-100 text-gray-700 font-semibold min-w-[240px] cursor-not-allowed"
              placeholder="e.g. BCA+MCA 2022-2027"
              value={generatedBatchName}
            />
          </div>

          {/* Create Batch Button */}
          <button
            onClick={createBatch}
            disabled={!selectedProgram || !startYear || !endYear || isDuplicateBatch}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded h-[42px] transition shadow-sm"
          >
            Create Batch
          </button>
        </div>

        {isDuplicateBatch && (
          <div className="mt-3 text-sm text-amber-700 font-medium bg-amber-50 p-2.5 rounded border border-amber-200">
            ⚠️ A batch for <strong>{selectedProgramObj?.name}</strong> with duration <strong>{startYear}-{endYear}</strong> already exists. Duplicate batches for the same course and duration cannot be created.
          </div>
        )}

        {batchError && !isDuplicateBatch && (
          <div className="mt-3 text-sm text-red-600 font-medium bg-red-50 p-2 rounded border border-red-200">
            ⚠️ {batchError}
          </div>
        )}
        
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
  const [activeSemester, setActiveSemester] = useState(null);
  
  // Student manual management state
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ student_name: '', roll_number: '', enrollment_number: '' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    api.get(`semesters/?batch_id=${activeBatch.id}`).then(res => {
      setSemesters(res.data);
      if (res.data && res.data.length > 0) {
        setActiveSemester(prev => {
          if (prev && res.data.some(s => s.id === prev.id)) {
            return res.data.find(s => s.id === prev.id);
          }
          return res.data[0];
        });
      } else {
        setActiveSemester(null);
      }
    });
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

  const validateStudentInputs = (name, roll, enroll) => {
    const trimmedName = (name || '').trim();
    const trimmedRoll = (roll || '').trim().toUpperCase();
    const trimmedEnroll = (enroll || '').trim().toUpperCase();

    // 1. Name validation: letters, spaces, dots, apostrophes only
    const nameRegex = /^[A-Za-z\s.']+$/;
    if (!trimmedName || trimmedName.length < 2) {
      return "Student name must be at least 2 characters long.";
    }
    if (!nameRegex.test(trimmedName)) {
      return "Student name must contain only letters and spaces (no numbers or special characters).";
    }

    // 2. Roll number validation: format like IC-2K22-107
    const rollRegex = /^[A-Za-z]{2,4}-(?:2K\d{2}|20\d{2})-\d{1,4}$/i;
    if (!trimmedRoll) {
      return "Roll number is required.";
    }
    if (!rollRegex.test(trimmedRoll)) {
      return "Invalid roll number format. Roll number must match format like IC-2K22-107 (e.g. IC-2K22-05).";
    }

    // 3. Enrollment number validation: format like DX2201125
    const enrollRegex = /^(?:[A-Za-z]{2,3}\d{5,8}|EN-[A-Za-z0-9-]+)$/i;
    if (!trimmedEnroll) {
      return "Enrollment number is required.";
    }
    if (!enrollRegex.test(trimmedEnroll)) {
      return "Invalid enrollment number format. Enrollment number must match format like DX2201125 (2-3 letters followed by 5-8 digits).";
    }

    return null;
  };

  const addStudent = async () => {
    const error = validateStudentInputs(
      newStudent.student_name,
      newStudent.roll_number,
      newStudent.enrollment_number
    );
    if (error) {
      alert(error);
      return;
    }

    const payload = {
      student_name: newStudent.student_name.trim(),
      roll_number: newStudent.roll_number.trim().toUpperCase(),
      enrollment_number: newStudent.enrollment_number.trim().toUpperCase(),
      batch: activeBatch.id
    };

    try {
      await api.post('students/', payload);
      setNewStudent({ student_name: '', roll_number: '', enrollment_number: '' });
      fetchStudents();
      alert("Student added successfully!");
    } catch (e) {
      const errorMsg = e.response?.data
        ? (typeof e.response.data === 'string'
            ? e.response.data
            : Object.entries(e.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '))
        : "Failed to add student. Ensure roll/enrollment numbers are unique.";
      alert(errorMsg);
    }
  };

  const updateStudent = async () => {
    const error = validateStudentInputs(
      editingStudent.student_name,
      editingStudent.roll_number,
      editingStudent.enrollment_number || 'EN-DEFAULT'
    );
    if (error && !error.includes("Enrollment number")) {
      alert(error);
      return;
    }

    const payload = {
      ...editingStudent,
      student_name: editingStudent.student_name.trim(),
      roll_number: editingStudent.roll_number.trim().toUpperCase(),
      enrollment_number: (editingStudent.enrollment_number || '').trim().toUpperCase()
    };

    try {
      await api.patch(`students/${editingStudent.id}/`, payload);
      setEditingStudent(null);
      fetchStudents();
      alert("Student updated successfully!");
    } catch (e) {
      const errorMsg = e.response?.data
        ? (typeof e.response.data === 'string'
            ? e.response.data
            : Object.entries(e.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '))
        : "Failed to update student.";
      alert(errorMsg);
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
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex gap-2">
              <input
                className="border p-2 w-1/3 text-sm rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Name (e.g. Rahul Sharma)"
                value={newStudent.student_name}
                onChange={e=>setNewStudent({...newStudent, student_name: e.target.value})}
              />
              <input
                className="border p-2 w-1/3 text-sm rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Roll No (e.g. IC-2K22-107)"
                value={newStudent.roll_number}
                onChange={e=>setNewStudent({...newStudent, roll_number: e.target.value})}
              />
              <input
                className="border p-2 w-1/3 text-sm rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Enroll No (e.g. DX2201125)"
                value={newStudent.enrollment_number}
                onChange={e=>setNewStudent({...newStudent, enrollment_number: e.target.value})}
              />
              <button onClick={addStudent} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition">
                Add
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              Format: Name (letters only) | Roll No: IC-2K22-107 (e.g. IC-2K22-05) | Enrollment No: DX2201125 (e.g. DX2201130)
            </p>
          </div>
          
          <div className="max-h-60 overflow-y-auto border rounded">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Roll No</th>
                  <th className="p-2 border">Enrollment No</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 border-b">
                    {editingStudent?.id === s.id ? (
                      <>
                        <td className="p-1"><input className="border p-1 w-full text-xs" value={editingStudent.student_name} onChange={e=>setEditingStudent({...editingStudent, student_name: e.target.value})} /></td>
                        <td className="p-1"><input className="border p-1 w-full text-xs" value={editingStudent.roll_number} onChange={e=>setEditingStudent({...editingStudent, roll_number: e.target.value})} /></td>
                        <td className="p-1"><input className="border p-1 w-full text-xs" value={editingStudent.enrollment_number} onChange={e=>setEditingStudent({...editingStudent, enrollment_number: e.target.value})} /></td>
                        <td className="p-1 flex gap-1">
                          <button onClick={updateStudent} className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">Save</button>
                          <button onClick={()=>setEditingStudent(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs font-semibold">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{s.student_name}</td>
                        <td className="p-2 font-mono text-xs">{s.roll_number}</td>
                        <td className="p-2 font-mono text-xs text-gray-600">{s.enrollment_number}</td>
                        <td className="p-2 flex gap-2">
                          <button onClick={()=>setEditingStudent(s)} className="text-blue-600 hover:underline">Edit</button>
                          <button onClick={()=>deleteStudent(s.id)} className="text-red-600 hover:underline">Del</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500">No students found.</td></tr>}
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Select Semester</h3>
            <p className="text-xs text-gray-500">
              Semesters are automatically created based on course duration ({activeBatch.start_year && activeBatch.end_year ? `${activeBatch.end_year - activeBatch.start_year} Years / ${semesters.length} Semesters` : `${semesters.length} Semesters`}). Click a semester below to manage its subjects and assign faculty.
            </p>
          </div>
          <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-3 py-1 rounded-full">
            Total Semesters: {semesters.length}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {semesters.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSemester(s)}
              className={`px-4 py-2 rounded font-bold transition shadow-sm ${
                activeSemester?.id === s.id
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {s.name}
            </button>
          ))}
          {semesters.length === 0 && (
            <p className="text-sm text-gray-500 italic">No semesters generated yet.</p>
          )}
        </div>
      </div>

      {activeSemester && <SemesterManager activeSemester={activeSemester} faculties={faculties} />}
    </div>
  );
}

function SemesterManager({ activeSemester, faculties }) {
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
    if (!subName.trim() || !subCode.trim()) {
      alert('Please enter both Subject Name and Subject Code.');
      return;
    }
    try {
      const res = await api.post('subjects/', {
        semester: activeSemester.id,
        name: subName.trim(),
        subject_code: subCode.trim(),
        subject_type: subType,
        assigned_faculty: assignedFac || null
      });
      setSubjects([...subjects, res.data]);
      setSubName('');
      setSubCode('');
      setAssignedFac('');
      alert('Subject added successfully!');
    } catch (e) {
      alert('Failed to add subject.');
    }
  };

  const updateSubjectFaculty = async (subjectId, facultyId) => {
    try {
      const res = await api.patch(`subjects/${subjectId}/`, {
        assigned_faculty: facultyId || null
      });
      setSubjects(subjects.map(s => s.id === subjectId ? res.data : s));
    } catch (e) {
      alert('Failed to update faculty assignment.');
    }
  };

  const deleteSubject = async (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`subjects/${subjectId}/`);
        setSubjects(subjects.filter(s => s.id !== subjectId));
      } catch (e) {
        alert("Failed to delete subject.");
      }
    }
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
        <div>
          <h3 className="text-xl font-bold text-purple-900">Manage Semester: {activeSemester.name}</h3>
          <p className="text-xs text-purple-700">Add subjects, assign faculty, or view performance analytics for this semester.</p>
        </div>
        <button onClick={loadRankings} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow text-sm">View Semester Rankings</button>
      </div>
      
      {/* Add New Subject */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Add New Subject</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border border-gray-300 p-2 rounded text-sm" placeholder="Subject Name (e.g. OOAD)" value={subName} onChange={e=>setSubName(e.target.value)} />
          <input className="border border-gray-300 p-2 rounded text-sm" placeholder="Sub Code (e.g. CS101)" value={subCode} onChange={e=>setSubCode(e.target.value)} />
          <select className="border border-gray-300 p-2 rounded bg-white text-sm" value={subType} onChange={e=>setSubType(e.target.value)}>
            <option value="THEORY">Theory</option>
            <option value="LAB">Lab</option>
            <option value="COMPREHENSIVE_VIVA">Viva</option>
          </select>
          <select className="border border-gray-300 p-2 rounded bg-white text-sm" value={assignedFac} onChange={e=>setAssignedFac(e.target.value)}>
            <option value="">-- Assign Faculty --</option>
            {approvedFaculties.map(f => <option key={f.id} value={f.id}>{f.username}</option>)}
          </select>
          <button onClick={createSubject} className="bg-green-600 hover:bg-green-700 text-white rounded font-bold text-sm transition">Add Subject</button>
        </div>
      </div>

      {/* Subjects List */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-purple-100">
        <h4 className="font-bold text-gray-700 mb-3">Subjects in {activeSemester.name} ({subjects.length}):</h4>
        {subjects.length === 0 ? <p className="text-gray-500 text-sm italic">No subjects added yet to this semester.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map(s => (
              <div key={s.id} className="border border-gray-200 p-3 rounded-lg flex flex-col justify-between shadow-sm hover:border-purple-300 transition bg-white gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{s.subject_code} - {s.name}</div>
                    <span className="text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded inline-block mt-1 font-medium">{s.subject_type}</span>
                  </div>
                  <button onClick={() => deleteSubject(s.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded">Delete</button>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-600">Faculty:</span>
                    <select
                      className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      value={s.assigned_faculty || ''}
                      onChange={e => updateSubjectFaculty(s.id, e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {approvedFaculties.map(f => (
                        <option key={f.id} value={f.id}>{f.username}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => setAnalyticsSubject(s)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded font-bold shadow-sm">Analytics</button>
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
