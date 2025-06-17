import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

/**
 * AuthRedirect component redirects authenticated users away from login/register pages
 * to the dashboard, preventing unnecessary authentication screens
 */
const AuthRedirect = ({ children }) => {
    const { user, loading, refreshToken } = useAuth();

    // Attempt to refresh token on component mount
    useEffect(() => {
        const attemptTokenRefresh = async () => {
            // Only attempt refresh if no user is currently loaded
            if (!user) {
                await refreshToken();
            }
        };

        attemptTokenRefresh();
    }, []);

    // Show loading spinner while authentication state is being determined
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7400B8]"></div>
            </div>
        );
    }

    // If user is already authenticated, redirect to dashboard
    if (user) {
        return <Navigate to="/user/dashboard" replace />;
    }

    // Otherwise, render the children (login or register component)
    return children;
};

export default AuthRedirect;