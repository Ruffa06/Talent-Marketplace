import { Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import Opportunities from './pages/Opportunities'
import OpportunityDetail from './pages/OpportunityDetail'
import PostOpportunity from './pages/PostOpportunity'
import Profile from './pages/Profile'
import MyMatches from './pages/MyMatches'
import Dashboard from './pages/Dashboard'
import Feedback from './pages/Feedback'
import FAQ from './pages/FAQ'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="opportunities/:id" element={<OpportunityDetail />} />
        <Route path="post" element={<PostOpportunity />} />
        <Route path="profile" element={<Profile />} />
        <Route path="matches" element={<MyMatches />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="faq" element={<FAQ />} />
      </Route>
    </Routes>
  )
}
