import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const AdminRoute = ({ children }) => {
    const { user, loading, refreshToken } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const attemptTokenRefresh = async () => {
            if (!user) {
                await refreshToken();
            }
        };
        attemptTokenRefresh();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7400B8]"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute; 