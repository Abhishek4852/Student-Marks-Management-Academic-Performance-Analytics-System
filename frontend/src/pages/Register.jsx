import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('auth/faculty/register/', { username, email, password });
      setMessage(res.data.message);
      setError('');
      setUsername(''); setEmail(''); setPassword('');
    } catch (err) {
      setError('Registration failed. Please check your inputs or try a different username.');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl mb-6 font-bold text-center text-gray-800">Faculty Registration</h2>
        {message && <div className="text-green-700 font-medium mb-4 p-3 bg-green-100 rounded text-sm">{message}</div>}
        {error && <div className="text-red-600 font-medium mb-4 p-3 bg-red-100 rounded text-sm">{error}</div>}
        
        <input className="w-full border border-gray-300 rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input className="w-full border border-gray-300 rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border border-gray-300 rounded p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded transition duration-200">Register</button>
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </div>
      </form>
    </div>
  );
}
