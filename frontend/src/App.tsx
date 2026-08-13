import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import GitHubAnalyzer from './pages/GitHubAnalyzer';
import PortfolioAnalyzer from './pages/PortfolioAnalyzer';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze/resume" element={<ResumeAnalyzer />} />
          <Route path="/analyze/github" element={<GitHubAnalyzer />} />
          <Route path="/analyze/portfolio" element={<PortfolioAnalyzer />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
