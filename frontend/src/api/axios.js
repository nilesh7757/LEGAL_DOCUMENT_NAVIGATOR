import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ||   'http://localhost:8000/api/', // Your backend URL
        timeout: 10000, // Optional: timeout after 10 seconds
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add the JWT token to headers
instance.interceptors.request.use(
    (config) => {
        const publicUrls = ['/auth/signup/', '/auth/login/', '/auth/google/', '/auth/verify-otp/', '/auth/resend-otp/']; // Add other public URLs as needed
        const isPublicUrl = publicUrls.some(url => config.url.includes(url));

        if (isPublicUrl) {
            delete config.headers.Authorization;
            config.headers.Authorization = undefined; // Explicitly set to undefined
        } else {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
