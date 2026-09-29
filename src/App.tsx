import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Feed from '@/pages/tourist/Feed';
import NearbyMap from '@/pages/tourist/NearbyMap';
import AttractionDetail from '@/pages/tourist/AttractionDetail';
import GuideDashboard from '@/pages/guide/Dashboard';
import GuideParticipants from '@/pages/guide/Participants';
import GuideMapRegister from '@/pages/guide/MapRegister';

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public (no Layout — full-bleed auth pages) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public (with Layout) */}
          <Route path="/" element={<Layout><Feed /></Layout>} />
          <Route path="/nearby" element={<Layout><NearbyMap /></Layout>} />
          <Route path="/attractions/:id" element={<Layout><AttractionDetail /></Layout>} />

          {/* Guide */}
          <Route path="/guide/dashboard" element={
            <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
              <Layout><GuideDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/guide/map" element={
            <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
              <Layout><GuideMapRegister /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/guide/attractions/:id/participants" element={
            <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
              <Layout><GuideParticipants /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
