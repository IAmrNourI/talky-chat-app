import axios from "axios"; 

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
});

// axiosInstance.interceptors.request.use(
//     (request) => requestHandler(request),
//     (error) => Promise.reject(error),
// )

// axiosInstance.interceptors.response.use(
//     (response) => responseHandler(response),
//     (error) => errorHandler(error),
// )