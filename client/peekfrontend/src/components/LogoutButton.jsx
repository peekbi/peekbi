import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = ({ className = '' }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <button
            onClick={handleLogout}
            className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 ${className}`}
        >
            Logout
        </button>
    );
};

export default LogoutButton; 