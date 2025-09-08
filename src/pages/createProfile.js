// src/pages/CreateProfile.js
import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../component/profileForm";
import { createProfile } from "../api/api";

const CreateProfile = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      const res = await createProfile(data);
      // Updated to match your API response structure
      alert("Profile created successfully!");
      navigate(`/profile/${res.data.profile._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create profile");
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1>Create New Profile</h1>
        <ProfileForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateProfile;