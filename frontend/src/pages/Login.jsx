import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('auth/login/', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/faculty');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl mb-6 font-bold text-center text-gray-800">System Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input className="w-full border border-gray-300 rounded p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full border border-gray-300 rounded p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded transition duration-200">Login</button>
        <div className="text-center mt-4 text-sm text-gray-600">
          New faculty? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </div>
      </form>
    </div>
  );
}
