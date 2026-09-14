import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Feed from '@/pages/tourist/Feed';
import NearbyMap from '@/pages/tourist/NearbyMap';
import AttractionDetail from '@/pages/tourist/AttractionDetail';
import GuideDashboard from '@/pages/guide/Dashboard';
import GuideParticipants from '@/pages/guide/Participants';
import GuideMapRegister from '@/pages/guide/MapRegister';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/nearby" element={<NearbyMap />} />
          <Route path="/attractions/:id" element={<AttractionDetail />} />

          {/* Guide */}
          <Route path="/guide/dashboard" element={
            <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
              <GuideDashboard />
            </ProtectedRoute>
          } />
          <Route path="/guide/map" element={
            <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
              <GuideMapRegister />
            </ProtectedRoute>
          } />
          <Route path="/guide/attractions/:id/participants" element={
            <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
              <GuideParticipants />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
