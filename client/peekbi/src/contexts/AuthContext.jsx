import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'https://api.peekbi.com';

// Helper functions for localStorage and cookies
const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
};

const getLocalStorage = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('Error getting localStorage:', error);
        return null;
    }
};

// Cookie helper functions for better persistence
const setCookie = (name, value, days = 7) => {
    try {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
    } catch (error) {
        console.error('Error setting cookie:', error);
    }
};

const getCookie = (name) => {
    try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    } catch (error) {
        console.error('Error getting cookie:', error);
        return null;
    }
};

const deleteCookie = (name) => {
    try {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    } catch (error) {
        console.error('Error deleting cookie:', error);
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null);

    // Function to get auth token with priority: localStorage > cookie
    const getAuthToken = () => {
        try {
            // Try localStorage first
            const token = localStorage.getItem('token');
            console.log('LocalStorage token:', token); // Debug log

            if (token) {
                // If token exists in localStorage, ensure it's also in cookie
                const date = new Date();
                date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
                const expires = `expires=${date.toUTCString()}`;
                document.cookie = `token=${token};${expires};path=/;SameSite=Strict;secure`;
                return token;
            }

            // Try cookie if localStorage is empty
            const cookieToken = getCookie('token');
            console.log('Cookie token:', cookieToken); // Debug log

            if (cookieToken) {
                // If token exists in cookie but not in localStorage, sync it
                localStorage.setItem('token', cookieToken);
                return cookieToken;
            }

            return null;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    };

    // Function to save auth token in both cookie and localStorage
    const saveAuthToken = (token) => {
        if (!token) {
            console.log('No token provided to saveAuthToken'); // Debug log
            return;
        }
        
        try {
            console.log('Saving token to storage...'); // Debug log
            
            // Store in localStorage
            localStorage.setItem('token', token);
            console.log('Token saved to localStorage'); // Debug log
            
            // Store in cookie with 7 days expiry
            const date = new Date();
            date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `token=${token};${expires};path=/;SameSite=Strict;secure`;
            console.log('Token saved to cookie'); // Debug log
            
            // Verify the token was saved
            const savedToken = localStorage.getItem('token');
            const savedCookie = getCookie('token');
            console.log('Verification - localStorage:', savedToken); // Debug log
            console.log('Verification - cookie:', savedCookie); // Debug log
        } catch (error) {
            console.error('Error saving token:', error);
        }
    };

    // Function to clear auth data
    const clearAuthData = () => {
        try {
            console.log('Clearing auth data...'); // Debug log
            localStorage.removeItem('token');
            document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict';
            setUser(null);
            if (tokenRefreshTimer) {
                clearInterval(tokenRefreshTimer);
                setTokenRefreshTimer(null);
            }
            console.log('Auth data cleared'); // Debug log
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    };

    // Function to verify token
    const verifyToken = (token) => {
        if (!token) {
            console.log('No token provided to verifyToken'); // Debug log
            return false;
        }
        
        try {
            // Simple token validation - check if it exists and has a valid format
            if (typeof token !== 'string' || token.length < 10) {
                console.log('Invalid token format'); // Debug log
                return false;
            }
            
            // Check if token is expired (assuming token contains expiration time)
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            console.log('Token data in verifyToken:', tokenData); // Debug log
            
            // If token doesn't have exp, use iat + 7 days as expiration
            const expirationTime = tokenData.exp ? tokenData.exp * 1000 : (tokenData.iat * 1000) + (7 * 24 * 60 * 60 * 1000);
            const isValid = Date.now() < expirationTime;
            
            if (!isValid) {
                console.log('Token is expired'); // Debug log
                clearAuthData();
            } else {
                console.log('Token is valid'); // Debug log
            }
            
            return isValid;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    };

    // Function to refresh token
    const refreshToken = async () => {
        const token = getAuthToken();
        if (!token) return false;

        try {
            if (verifyToken(token)) {
                // Token is still valid, extend its lifetime
                saveAuthToken(token);
                return true;
            } else {
                // Token is expired, clear auth data
                clearAuthData();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            clearAuthData();
            return false;
        }
    };

    // Setup token refresh interval
    const setupTokenRefresh = () => {
        // Clear any existing interval
        if (tokenRefreshTimer) {
            clearInterval(tokenRefreshTimer);
        }

        // Check token every 5 minutes
        const interval = setInterval(async () => {
            const token = getAuthToken();
            if (!token) {
                clearInterval(interval);
                return;
            }

            if (!verifyToken(token)) {
                clearAuthData();
                clearInterval(interval);
            }
        }, 5 * 60 * 1000);

        setTokenRefreshTimer(interval);
    };

    // Load user data from storage on initial load
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = getAuthToken();
                console.log('Token on load:', token); // Debug log

                if (!token) {
                    console.log('No token found'); // Debug log
                    setLoading(false);
                    return;
                }

                if (!verifyToken(token)) {
                    console.log('Token verification failed'); // Debug log
                    clearAuthData();
                    setLoading(false);
                    return;
                }

                // If we have a valid token, set the user data from token
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                console.log('Token data:', tokenData); // Debug log

                setUser({
                    _id: tokenData.id,
                    email: tokenData.email,
                    name: tokenData.name || tokenData.email.split('@')[0],
                    role: tokenData.role || 'user'
                });

                // Setup token refresh
                setupTokenRefresh();
            } catch (error) {
                console.error('Error loading user data:', error);
                clearAuthData();
            } finally {
                setLoading(false);
            }
        };

        loadUserData();

        // Cleanup function
        return () => {
            if (tokenRefreshTimer) {
                clearInterval(tokenRefreshTimer);
            }
        };
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
                const token = response.data.token;
                console.log('Login token received:', token); // Debug log
                
                // Save token first
                saveAuthToken(token);
                
                // Verify token was saved
                const savedToken = getAuthToken();
                console.log('Token after save:', savedToken); // Debug log
                
                // Then verify and set user data
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                console.log('Login token data:', tokenData); // Debug log
                
                setUser({
                    _id: tokenData.id, // Changed from userId to id to match your token
                    email: tokenData.email,
                    name: tokenData.name || email.split('@')[0], // Fallback to email username if name not provided
                    role: tokenData.role || 'user' // Fallback to user if role not provided
                });

                // Setup token refresh
                setupTokenRefresh();
                
                return { success: true };
            }
            return { success: false, error: 'Invalid response from server' };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed'
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

                // Save token and user data in both cookie and localStorage
                saveAuthToken(token);
                setLocalStorage('user', user);

                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Setup token refresh
                setupTokenRefresh();

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
        clearAuthData();
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

    // Add axios interceptors for authentication and token refresh
    useEffect(() => {
        // Request interceptor - add token to all requests
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - handle 401 errors
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 and we haven't tried to refresh token yet
                if (error.response?.status === 401 && !originalRequest._retry && user) {
                    originalRequest._retry = true;

                    try {
                        // Try to refresh the token
                        const refreshed = await refreshToken();

                        if (refreshed) {
                            // Update the token in the current request
                            originalRequest.headers['Authorization'] = `Bearer ${getAuthToken()}`;
                            // Retry the original request
                            return axios(originalRequest);
                        } else {
                            // If refresh failed, logout
                            clearAuthData();
                            setUser(null);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh error:', refreshError);
                        clearAuthData();
                        setUser(null);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [user]);

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
        refreshToken,
        getAuthToken,
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