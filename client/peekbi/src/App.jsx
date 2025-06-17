import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

// Pages
import LandingPage from './components/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './pages/user/UserDashboard';
import Dashboard from './Dashboard';
import DataUpload from './components/dashboard/DataUpload';
import Profile from './components/dashboard/Profile';
import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import TermsAndConditions from './pages/policies/TermsAndConditions';
import CancellationAndRefund from './pages/policies/CancellationAndRefund';
import ContactUs from './pages/policies/ContactUs';
import FilesList from './components/dashboard/FilesList';
import AnalysisStatus from './components/dashboard/AnalysisStatus';
import ApiLogs from './components/dashboard/ApiLogs';
import UserDashboard from './pages/user/UserDashboard';
import DataSources from './components/dashboard/DataSources';

import './App.css'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Preload key images
  useEffect(() => {
    const imagesToPreload = [
      '/assets/logos.png',
      '/assets/20945368.jpg',
      // Add other critical images here
    ];

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setImagesLoaded(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } />
          <Route path="/register" element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          } />
          <Route path="/dashbordss" element={<Dashboard />} />

          {/* Policy pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cancellation-and-refund" element={<CancellationAndRefund />} />
          <Route path="/contact-us" element={<ContactUs />} />

          {/* Protected Routes with Dashboard Layout */}
          <Route path="/user/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="data-upload" element={<DataUpload />} />
            <Route path="data-sources" element={<DataSources />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
