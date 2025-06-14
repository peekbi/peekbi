import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './components/LandingPage'
import Dashboard from './Dashboard'
import DataUpload from './pages/user/DataUpload'
import CategorySelection from './pages/user/CategorySelection'
import UserDashboard from './pages/user/UserDashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/Profile'
import Insights from './pages/Insights'
// Import policy pages
import PrivacyPolicy from './pages/policies/PrivacyPolicy'
import TermsAndConditions from './pages/policies/TermsAndConditions'
import CancellationAndRefund from './pages/policies/CancellationAndRefund'
import ContactUs from './pages/policies/ContactUs'

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashbordss" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />

          {/* Policy pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cancellation-and-refund" element={<CancellationAndRefund />} />
          <Route path="/contact-us" element={<ContactUs />} />

          {/* Protected routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/data-upload"
            element={
              <ProtectedRoute>
                <DataUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/category-selection"
            element={
              <ProtectedRoute>
                <CategorySelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
