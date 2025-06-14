import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'https://api.peekbi.com';

// Helper functions for localStorage
const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

const getLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user data from localStorage on initial load
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                if (token && storedUser) {
                    // Verify token with backend
                    const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.data.valid) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            } catch (err) {
                console.error('Error loading user data:', err);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            setError(null);
            setLoading(true);

            if (!userId) {
                throw new Error('User ID is required');
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status === 'success') {
                // Update user state with the complete user data from Data field
                const userData = response.data.Data;
                setUser(userData);
                setLocalStorage('user', userData);
                return userData;
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user profile';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/login`, {
                email,
                password
            });

            if (response.data.token) {
                const { token, user: userData } = response.data;
                
                // Store token and user data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Update state
                setUser(userData);
                return { success: true };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);

            // Validate required fields
            const requiredFields = ['name', 'email', 'password', 'username', 'userType', 'category', 'phone'];
            const missingFields = requiredFields.filter(field => !userData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate userType
            if (!['individual', 'business'].includes(userData.userType)) {
                throw new Error('Invalid user type. Must be either "individual" or "business"');
            }

            // Validate category
            if (!['manufacturing', 'education', 'healthcare', 'technology', 'retail'].includes(userData.category)) {
                throw new Error('Invalid category. Must be one of: manufacturing, education, healthcare, technology, retail');
            }

            const response = await axios.post(`${API_BASE_URL}/users/regester`, {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                username: userData.username,
                userType: userData.userType,
                category: userData.category,
                phone: userData.phone
            });

            if (response.data.status === 'success') {
                const { token, user } = response.data;

                // Save token and user data
                localStorage.setItem('token', token);
                setLocalStorage('user', user);

                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                setUser(user);
                return { success: true };
            }
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        // Clear storage and state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateProfile = async (userId, userData) => {
        try {
            setError(null);
            setLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.patch(`${API_BASE_URL}/users/${userId}`, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status === 'success') {
                const updatedUser = response.data.Data;
                setUser(updatedUser);
                setLocalStorage('user', updatedUser);
                return { success: true, user: updatedUser };
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (userId, file, industryCategory) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            if (!file) {
                throw new Error('No file provided for upload');
            }

            if (!industryCategory) {
                throw new Error('Industry category is required');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('industryCategory', industryCategory);

            const response = await axios.post(
                `${API_BASE_URL}/files/upload/${userId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.status === 'success') {
                // Update user data with new file
                const updatedUser = {
                    ...user,
                    files: [...(user.files || []), response.data.file]
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data.message || 'Upload failed' };
            }
        } catch (err) {
            console.error('File upload error:', err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'File upload failed',
            };
        }
    };

    const getAllUserFiles = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/files/all/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("✅ Response from /files/all:", response.data);

            if (response.data.files) {
                return {
                    success: true,
                    data: { files: response.data.files },
                };
            } else {
                return {
                    success: false,
                    error: 'Files not found in response',
                };
            }
        } catch (err) {
            console.error('❌ Error fetching files:', err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Fetch failed',
            };
        }
    };

    const downloadFiles = async (userId, fileId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/files/download/${userId}/${fileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob'
                }
            );
            
            // Check if the response is a blob (file data)
            if (response.data instanceof Blob) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid response format'
                };
            }
        } catch (err) {
            console.error('❌ Error downloading file:', err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to download file'
            };
        }
    }

    // Add axios interceptor for authentication
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        fetchUserProfile,
        uploadFile,
        getAllUserFiles,
        downloadFiles,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export default AuthContext; 