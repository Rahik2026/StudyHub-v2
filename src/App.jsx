import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Homework = lazy(() => import('./pages/Homework'));
const Exams = lazy(() => import('./pages/Exams'));
const Notes = lazy(() => import('./pages/Notes'));
const Messenger = lazy(() => import('./pages/Messenger'));
const Community = lazy(() => import('./pages/Community'));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/homework" element={
              <ProtectedRoute>
                <Layout><Homework /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/exams" element={
              <ProtectedRoute>
                <Layout><Exams /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/notes" element={
              <ProtectedRoute>
                <Layout><Notes /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/messenger" element={
              <ProtectedRoute>
                <Layout><Messenger /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/messenger/:chatId" element={
              <ProtectedRoute>
                <Layout><Messenger /></Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Layout><Community /></Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
