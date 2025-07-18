import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './components/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import TermsAndConditions from './pages/policies/TermsAndConditions';
import CancellationAndRefund from './pages/policies/CancellationAndRefund';
import ContactUs from './pages/policies/ContactUs';
import HowItWorksDetails from './pages/HowItWorksDetails';
import AllTestimonials from './pages/AllTestimonials';

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
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '1rem', borderRadius: '1rem' } }} />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

          {/* Policy pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cancellation-and-refund" element={<CancellationAndRefund />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/how-it-works-details" element={<HowItWorksDetails />} />
          <Route path="/testimonials" element={<AllTestimonials />} />

          {/* Protected Routes with Dashboard Layout */}
          <Route path="/user/*" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Admin Dashboard Route */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
