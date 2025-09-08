// src/pages/ProfileList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProfiles, searchProfiles } from "../api/api";
import "../pages/profileList.css";

const ProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [skillsFilter, setSkillsFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Initial fetch
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await getAllProfiles();
        // Updated to match your API response structure
        const profilesData = res.data.profiles || [];
        setProfiles(profilesData);
        setFilteredProfiles(profilesData);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch profiles");
        setProfiles([]);
        setFilteredProfiles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Search with backend API
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.trim() === "" && skillsFilter.trim() === "") {
        // If both search and skills filter are empty, fetch all profiles
        try {
          const res = await getAllProfiles();
          const profilesData = res.data.profiles || [];
          setProfiles(profilesData);
          setFilteredProfiles(profilesData);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch profiles");
        }
        return;
      }

      try {
        const searchQuery = search;
        const res = await searchProfiles(searchQuery);
        // Updated to match your API response structure
        const searchResults = res.data.results || [];
        setFilteredProfiles(searchResults);
        setError("");
      } catch (err) {
        console.error(err);
        setFilteredProfiles([]);
        setError("No profiles found matching your criteria");
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, skillsFilter]);

  // Sort profiles
  useEffect(() => {
    const sorted = [...filteredProfiles].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });
    setFilteredProfiles(sorted);
  }, [sortBy, profiles]);

  // Extract all unique skills for filter
  const allSkills = [...new Set(profiles.flatMap(profile => profile.skills || []))].sort();

  const handleViewProfile = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const handleEditProfile = (profileId) => {
    navigate(`/profile/${profileId}?edit=true`);
  };

  const clearFilters = () => {
    setSearch("");
    setSkillsFilter("");
    setSortBy("name");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="profile-list-page">
      <div className="filters-section">
        <div className="filters-header">
          <h3>
            <i className="fas fa-search"></i> Search Profiles
          </h3>
          {search && (
            <button onClick={clearFilters} className="clear-filters-btn">
              <i className="fas fa-times"></i> Clear Search
            </button>
          )}
        </div>

        <div className="filters-content">
            <div className="search-input-wrapper">
              <input
                type="text"
                id="search-input"
                placeholder="Search by name, email, skills, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="clear-input-btn"
                  type="button"
                  aria-label="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          {/* Active Search Display */}
          {search && (
            <div className="active-filters">
              <span className="active-filters-label">Current Search:</span>
              <div className="active-filter-tags">
                <span className="active-filter-tag">
                  "{search}"
                  <button
                    onClick={() => setSearch('')}
                    className="remove-filter-btn"
                    aria-label="Remove search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {filteredProfiles.length} of {profiles.length} profiles
          {(search) && " matching your criteria"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}

      {/* Profiles Grid */}
      {filteredProfiles.length > 0 ? (
        <div className="profiles-grid">
          {filteredProfiles.map((profile) => (
            <div key={profile._id} className="profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h5 className="profile-name">{profile.name}</h5>
                  <p className="profile-title">{profile?.work?.[0]?.role || "Developer"}</p>
                  <p className="profile-email">
                    <i className="fas fa-envelope"></i> {profile.email}
                  </p>
                </div>
              </div>

              {profile.description && (
                <p className="profile-description">
                  {profile.description.length > 100 
                    ? `${profile.description.substring(0, 100)}...` 
                    : profile.description
                  }
                </p>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="profile-skills">
                  {profile.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 4 && (
                    <span className="skill-tag-more">
                      +{profile.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="profile-card-actions">
                <button 
                  onClick={() => handleViewProfile(profile._id)}
                  className="btn btn-primary"
                >
                  <i className="fas fa-eye"></i> View Profile
                </button>
                <button 
                  onClick={() => handleEditProfile(profile._id)}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !error && (
        <div className="empty-state">
          <i className="fas fa-users"></i>
          <h3>No Profiles Found</h3>
          <p>No developer profiles match your search criteria. Try adjusting your filters.</p>
          <button onClick={clearFilters} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      )}

      {/* Create Profile CTA */}
      {profiles.length === 0 && !loading && (
        <div className="empty-state">
          <i className="fas fa-user-plus"></i>
          <h3>No Profiles Yet</h3>
          <p>Be the first to create a developer profile!</p>
          <button 
            onClick={() => navigate("/create")} 
            className="btn btn-primary"
          >
            <i className="fas fa-plus"></i> Create Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileList;