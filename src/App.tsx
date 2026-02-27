import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StoryProvider } from './contexts/StoryContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateStory from './pages/CreateStory';
import Dashboard from './pages/Dashboard';
import StoryDetail from './pages/StoryDetail';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import GenerationProgress from './pages/GenerationProgress';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <StoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="create" element={<CreateStory />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="story/:id" element={<StoryDetail />} />
                <Route path="story/:id/payment" element={<Payment />} />
                <Route path="story/:id/progress" element={<GenerationProgress />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </StoryProvider>
    </AuthProvider>
  );
}

export default App;
