// src/pages/ProfileDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileForm from "../component/profileForm";
import { getProfileById, getProfileProjects, getUserTopSkills } from "../api/api";
import "../pages/profileDetail.css"

const ProfileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillProjects, setSkillProjects] = useState({});
  const [loadingProjects, setLoadingProjects] = useState({});
  const [userTopSkills, setUserTopSkills] = useState([]);
  const [activeSkillTab, setActiveSkillTab] = useState("all");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, skillsRes] = await Promise.all([
          getProfileById(id),
          getUserTopSkills(id, 5)
        ]);
        
        setProfile(profileRes.data.profile || null);
        setUserTopSkills(skillsRes.data.skills || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  const fetchProjectsBySkill = async (skill) => {
    if (skillProjects[skill]) return; // Already fetched
    
    setLoadingProjects(prev => ({ ...prev, [skill]: true }));
    
    try {
      const res = await getProfileProjects(id, skill);
      setSkillProjects(prev => ({
        ...prev,
        [skill]: res.data.projects || []
      }));
    } catch (err) {
      console.error(`Failed to fetch projects for skill: ${skill}`, err);
      setSkillProjects(prev => ({
        ...prev,
        [skill]: []
      }));
    } finally {
      setLoadingProjects(prev => ({ ...prev, [skill]: false }));
    }
  };

  const handleSkillTabClick = (skill) => {
    setActiveSkillTab(skill);
    if (skill !== "all") {
      fetchProjectsBySkill(skill);
    }
  };

  const handleUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditing(false);
    // Refresh top skills after update
    getUserTopSkills(id, 5)
      .then(res => setUserTopSkills(res.data.skills || []))
      .catch(err => console.error("Failed to refresh skills:", err));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Profile Not Found</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            <i className="fas fa-home"></i> Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-user-slash"></i>
          <h3>Profile Not Found</h3>
          <p>The profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            <i className="fas fa-home"></i> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Filter projects based on active skill tab
  const filteredProjects = activeSkillTab === "all" 
    ? profile.projects || []
    : skillProjects[activeSkillTab] || [];

  return (
    <div className="profile-details-page">
      {!editing ? (
        <div className="profile-details">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>{profile.name}</h1>
              <p className="profile-title">{profile?.work[0]?.role || "Fresher"}</p>
              <p className="profile-email">
                <i className="fas fa-envelope"></i> {profile.email}
              </p>
            </div>
            <div className="profile-actions">
              <button 
                onClick={() => setEditing(true)} 
                className="btn btn-primary"
              >
                <i className="fas fa-edit"></i> Edit Profile
              </button>
              <button onClick={() => navigate("/")} className="btn btn-secondary">
                <i className="fas fa-home"></i> Home
              </button>
            </div>
          </div>

          {/* Top Skills Section */}
          {userTopSkills.length > 0 && (
            <div className="profile-section">
              <h2>
                <i className="fas fa-star"></i> Top Skills
              </h2>
              <div className="skills-container">
                {userTopSkills.map((skillObj, index) => (
                  <div key={index}>
                    <span className="skill-tag">{skillObj.skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="profile-section">
              <h2>
                <i className="fas fa-tools"></i> Skills
              </h2>
              <div className="skills-container">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {profile.description && (
            <div className="profile-section">
              <h2>
                <i className="fas fa-user"></i> About
              </h2>
              <p className="profile-description">{profile.description}</p>
            </div>
          )}

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <div className="profile-section">
              <h2>
                <i className="fas fa-graduation-cap"></i> Education
              </h2>
              <div className="education-list">
                {profile.education.map((edu, i) => (
                  <div key={i} className="education-item">
                    <i className="fas fa-book"></i>
                    <span>{edu}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section with Skill Filtering */}
          {profile.projects && profile.projects.length > 0 && (
            <div className="profile-section">
              <div className="section-header-with-tabs">
                <h2>
                  <i className="fas fa-project-diagram"></i> Projects
                </h2>
                
                {/* Skill Tabs */}
                <div className="skill-tabs">
                  <button
                    className={`tab-btn ${activeSkillTab === "all" ? "active" : ""}`}
                    onClick={() => handleSkillTabClick("all")}
                  >
                    All Projects
                  </button>
                  
                  {userTopSkills.slice(0, 5).map((skillObj) => (
                    <button
                      key={skillObj.skill}
                      className={`tab-btn ${activeSkillTab === skillObj.skill ? "active" : ""}`}
                      onClick={() => handleSkillTabClick(skillObj.skill)}
                    >
                      {skillObj.skill}
                      {loadingProjects[skillObj.skill] && (
                        <i className="fas fa-spinner fa-spin ml-1"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="projects-grid">
                  {filteredProjects.map((proj, i) => (
                    <div key={i} className="project-card">
                      <h3>{proj.title}</h3>
                      <p className="project-description">{proj.description}</p>
                      
                      {proj.skills && proj.skills.length > 0 && (
                        <div className="project-skills">
                          {proj.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag small">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {proj.links && proj.links.length > 0 && (
                        <div className="project-links">
                          {proj.links.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="project-link"
                            >
                              <i className="fas fa-external-link-alt"></i> View Project
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : activeSkillTab !== "all" ? (
                <div className="empty-state">
                  <i className="fas fa-code"></i>
                  <p>No projects found for {activeSkillTab} skill.</p>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-folder-open"></i>
                  <p>No projects available.</p>
                </div>
              )}
            </div>
          )}

          {/* Work Experience Section */}
          {profile.work && profile.work.length > 0 && (
            <div className="profile-section">
              <h2>
                <i className="fas fa-briefcase"></i> Work Experience
              </h2>
              <div className="experience-list">
                {profile.work.map((job, i) => (
                  <div key={i} className="experience-item">
                    <div className="experience-header">
                      <h3>{job.role}</h3>
                      <span className="experience-duration">{job.duration}</span>
                    </div>
                    <p className="experience-company">{job.company}</p>
                    <p className="experience-description">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          {(profile.links?.github || profile.links?.linkedin || profile.links?.portfolio) && (
            <div className="profile-section">
              <h2>
                <i className="fas fa-link"></i> Links
              </h2>
              <div className="links-container">
                {profile.links.github && (
                  <a 
                    href={profile.links.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link github"
                  >
                    <i className="fab fa-github"></i> GitHub
                  </a>
                )}
                {profile.links.linkedin && (
                  <a 
                    href={profile.links.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                  >
                    <i className="fab fa-linkedin"></i> LinkedIn
                  </a>
                )}
                {profile.links.portfolio && (
                  <a 
                    href={profile.links.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link portfolio"
                  >
                    <i className="fas fa-globe"></i> Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="edit-profile-section">
          <div className="edit-header">
            <h2>
              <i className="fas fa-edit"></i> Edit Profile
            </h2>
            <button 
              onClick={() => setEditing(false)} 
              className="btn btn-secondary"
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
          <ProfileForm 
            mode="edit" 
            existingProfile={profile} 
            onClose={() => setEditing(false)}
            onSuccess={handleUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;