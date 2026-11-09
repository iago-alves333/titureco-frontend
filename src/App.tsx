import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useIsDark } from '@/lib/theme';

// Code-split pages (keeps Leaflet & route chunks out of initial bundle)
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Feed = lazy(() => import('@/pages/tourist/Feed'));
const NearbyMap = lazy(() => import('@/pages/tourist/NearbyMap'));
const AttractionDetail = lazy(() => import('@/pages/tourist/AttractionDetail'));
const MyReservations = lazy(() => import('@/pages/tourist/MyReservations'));
const Profile = lazy(() => import('@/pages/Profile'));
const GuideDashboard = lazy(() => import('@/pages/guide/Dashboard'));
const GuideParticipants = lazy(() => import('@/pages/guide/Participants'));
const GuideMapRegister = lazy(() => import('@/pages/guide/MapRegister'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const isDark = useIsDark();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          richColors
          position="top-right"
          theme={isDark ? 'dark' : 'light'}
        />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public (no Layout — full-bleed auth pages) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public (with Layout) */}
            <Route path="/" element={<Layout><Feed /></Layout>} />
            <Route path="/nearby" element={<Layout><NearbyMap /></Layout>} />
            <Route path="/attractions/:id" element={<Layout><AttractionDetail /></Layout>} />

            {/* Authenticated Tourist / Admin */}
            <Route
              path="/reservations"
              element={
                <ProtectedRoute allowedRoles={['TOURIST', 'ADMIN']}>
                  <Layout><MyReservations /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Authenticated Profile (any role) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['TOURIST', 'GUIDE', 'ADMIN']}>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Guide / Admin */}
            <Route
              path="/guide/dashboard"
              element={
                <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
                  <Layout><GuideDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide/map"
              element={
                <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
                  <Layout><GuideMapRegister /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide/attractions/:id/participants"
              element={
                <ProtectedRoute allowedRoles={['GUIDE', 'ADMIN']}>
                  <Layout><GuideParticipants /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout><AdminUsers /></Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
