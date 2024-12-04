import axios from "axios";

const nginxHost = process.env.NEXT_PUBLIC_NGINX_HOST;
const nginxPort = process.env.NEXT_PUBLIC_NGINX_PORT;
const isLocalEnv = process.env.NEXT_PUBLIC_NGINX_ENV === 'local';

let baseURL = '';

if (nginxHost && nginxPort) {
    if (isLocalEnv) {
        baseURL = `http://${nginxHost}:${nginxPort}`;
    } else {
        baseURL = `https://${nginxHost}`;
    }
} else {
    baseURL = 'http://localhost:8080';
}

const API = axios.create({
    baseURL,
    withCredentials: true, // Add this line to enable credentials
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging
API.interceptors.request.use(
    (config) => {
        console.log('Request Config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            withCredentials: config.withCredentials
        });
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
API.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response Error:', {
            status: error.response?.status,
            headers: error.response?.headers,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default API;