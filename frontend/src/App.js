import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import PrivateRoute from './components/PrivateRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import TemplateBuilder from './pages/TemplateBuilder';
import Certificates from './pages/Certificates';
import CertificateGenerator from './pages/CertificateGenerator';
import Events from './pages/Events';
import EventCreate from './pages/EventCreate';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Verification from './pages/Verification';

import './App.css';

function AppRouter() {
  const location = useLocation();
  
  // CRITICAL: Check URL fragment for session_id synchronously during render
  // This prevents race conditions by processing Google OAuth callback FIRST
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:code" element={<Verification />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <PrivateRoute>
            <Templates />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates/new"
        element={
          <PrivateRoute>
            <TemplateBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates/:id/edit"
        element={
          <PrivateRoute>
            <TemplateBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <PrivateRoute>
            <Certificates />
          </PrivateRoute>
        }
      />
      <Route
        path="/certificates/new"
        element={
          <PrivateRoute>
            <CertificateGenerator />
          </PrivateRoute>
        }
      />
      <Route
        path="/events"
        element={
          <PrivateRoute>
            <Events />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/new"
        element={
          <PrivateRoute>
            <EventCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <PrivateRoute>
            <Billing />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
