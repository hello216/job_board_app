import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './components/Logout';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobNote from './pages/JobNote';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/create-job" element={
            <ProtectedRoute>
              <CreateJob />
            </ProtectedRoute>
          }
        />
      <Route path="/edit-job/:id" element={
        <ProtectedRoute>
          <EditJob />
        </ProtectedRoute>
      } />
      <Route path="/job-note/:id" element={
        <ProtectedRoute>
          <JobNote />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      </Routes>
    </Router>
  )
}

export default App;