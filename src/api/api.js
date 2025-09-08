// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000", // Changed to port 8000
});

// Updated to match your backend endpoints
export const getAllProfiles = () => API.get("/profile/get-all-profiles");
export const getProfileById = (id) => API.get(`/profile/get-profile?profileId=${id}`);
export const createProfile = (data) => API.post("/profile/create-profile", { profileData: data });
export const updateProfile = (id, data) => API.put(`/profile/update-profile?profileId=${id}`, { profileData: data });
export const searchProfiles = (query) => API.get(`/profile/search?q=${query}`);
export const getProfileProjects = (id, skill) => API.get(`/profile/projects?profileId=${id}&skill=${skill}`);
export const getUserTopSkills = (id, limit = 5) => API.get(`/profile/profile-top-skills?profileId=${id}&limit=${limit}`);
export const getTopSkills = (limit = 5) => API.get(`/profile/skills/top?limit=${limit}`);

// Add error handling interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);