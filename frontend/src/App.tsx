import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Shell from '@/components/Shell'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import RecruiterDashboard from '@/pages/recruiter/Dashboard'
import ApplicantDashboard from '@/pages/applicant/Dashboard'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminOpportunities from '@/pages/admin/Opportunities'
import AdminFeedbacks from '@/pages/admin/Feedbacks'
import PostOpportunity from '@/pages/recruiter/PostOpportunity'
import MyOpenings from '@/pages/recruiter/MyOpenings'
import OpportunitiesPage from '@/pages/shared/Opportunities'
import Profile from '@/pages/shared/Profile'
import FAQ from '@/pages/shared/FAQ'
import NotificationsPage from '@/components/NotificationsPage'
import type { Role } from '@/context/AuthContext'

function RequireAuth({ children, role }: { children: React.ReactNode; role?: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'administrator') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />
  return <Navigate to="/applicant/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAuth role="administrator"><Shell /></RequireAuth>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="opportunities" element={<AdminOpportunities />} />
            <Route path="feedbacks" element={<AdminFeedbacks />} />
          </Route>

          {/* Recruiter */}
          <Route path="/recruiter" element={<RequireAuth role="recruiter"><Shell /></RequireAuth>}>
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="matches" element={<OpportunitiesPage matchesOnly />} />
            <Route path="openings" element={<MyOpenings />} />
            <Route path="post" element={<PostOpportunity />} />
            <Route path="profile" element={<Profile />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Applicant */}
          <Route path="/applicant" element={<RequireAuth role="applicant"><Shell /></RequireAuth>}>
            <Route path="dashboard" element={<ApplicantDashboard />} />
            <Route path="opportunities" element={<OpportunitiesPage matchesOnly />} />
            <Route path="profile" element={<Profile />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}
