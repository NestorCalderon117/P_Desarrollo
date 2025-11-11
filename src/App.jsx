import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './components/auth/Login';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin components
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import TeamManagement from './components/admin/TeamManagement';
import PlayerManagement from './components/admin/PlayerManagement';
import GameScheduler from './components/admin/GameScheduler';

// Scoreboard (existente)
import ScoreboardApp from './ScoreboardApp';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta raíz redirige al admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Login (ruta pública) */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas del admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="teams" element={<TeamManagement />} />
            <Route path="players" element={<PlayerManagement />} />
            <Route path="games" element={<GameScheduler />} />
            <Route path="profile" element={<div className="p-5 text-center"><h2>Mi Perfil</h2><p className="text-muted">Próximamente</p></div>} />
          </Route>

          {/* Marcador en vivo (protegido) */}
          <Route
            path="/scoreboard"
            element={
              <ProtectedRoute>
                <ScoreboardApp />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>

        {/* Notificaciones toast */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
