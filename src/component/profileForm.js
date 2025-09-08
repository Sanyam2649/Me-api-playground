import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProfile, updateProfile } from "../api/api";
import "./profileForm.css";

const ProfileForm = ({ mode = "create", existingProfile = null, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Default empty profile structure
  const emptyProfile = {
    name: "",
    email: "",
    skills: [],
    education: [],
    projects: [],
    work: [],
    links: {
      github: "",
      linkedin: "",
      portfolio: ""
    }
  };

  const [formData, setFormData] = useState(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Add this state to your ProfileForm component
const [currentSkill, setCurrentSkill] = useState("");

// Add these functions to your ProfileForm component
const addCurrentSkill = () => {
  if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
    const newSkills = [...formData.skills, currentSkill.trim()];
    setFormData({ ...formData, skills: newSkills });
    setCurrentSkill("");
    
    // Clear error if skills were previously empty
    if (errors.skills) {
      setErrors({ ...errors, skills: "" });
    }
  }
};

const removeSkill = (index) => {
  const newSkills = [...formData.skills];
  newSkills.splice(index, 1);
  setFormData({ ...formData, skills: newSkills });
};

const handleSkillKeyDown = (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addCurrentSkill();
  }
};

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (mode === "edit" && existingProfile) {
      setFormData(existingProfile);
    }
  }, [mode, existingProfile]);

  // Handle simple field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle array field changes (education, etc.)
  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field, value = "") => {
    setFormData({ ...formData, [field]: [...formData[field], value] });
  };

  const removeArrayItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  // Handle nested object changes (projects, work)
  const handleNestedChange = (field, index, key, value) => {
    const updated = [...formData[field]];
    updated[index][key] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const addNestedItem = (field, template) => {
    setFormData({ ...formData, [field]: [...formData[field], template] });
  };

  const removeNestedItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  // Handle links changes
  const handleLinksChange = (platform, value) => {
    setFormData({
      ...formData,
      links: { ...formData.links, [platform]: value }
    });
  };

  // Handle skills as comma-separated string
  const handleSkillsChange = (e) => {
    const skillsString = e.target.value;
    const skillsArray = skillsString.split(",").map(skill => skill.trim()).filter(skill => skill);
    setFormData({ ...formData, skills: skillsArray });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let res;
      if (mode === "create") {
        res = await createProfile(formData);
        alert("Profile created successfully!");
        if (onSuccess) {
          onSuccess(res.data.profile);
        } else {
          navigate(`/profile/${res.data.profile._id}`);
        }
      } else {
        res = await updateProfile(id || existingProfile._id, formData);
        alert("Profile updated successfully!");
        if (onSuccess) {
          onSuccess(res.data.profile);
        }
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `${mode === "create" ? "Creation" : "Update"} failed`);
    } finally {
      setLoading(false);
    }
  };

  const skillsString = formData.skills.join(", ");

  return (
    <div className="profile-form-container">
      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter full name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter email address"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
<div className="form-group">
  <label htmlFor="skills-input" className="form-label">Skills *</label>
  
  <div className="skills-input-container">
    <div className="skills-input-wrapper">
      <input
        type="text"
        id="skills-input"
        value={currentSkill}
        onChange={(e) => setCurrentSkill(e.target.value)}
        onKeyDown={handleSkillKeyDown}
        className={`form-input ${errors.skills ? 'error' : ''}`}
        placeholder="Type a skill and press Enter or click Add"
      />
      <button 
        type="button" 
        onClick={addCurrentSkill}
        className="add-skill-btn"
        disabled={!currentSkill.trim()}
      >
        <i className="fas fa-plus"></i> Add
      </button>
    </div>
    
    {errors.skills && <span className="error-text">{errors.skills}</span>}
    
              <div className="skills-tags-container">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag-input">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="remove-skill-btn"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}

                {formData.skills.length === 0 && (
                  <div className="no-skills-message">
                    <i className="fas fa-info-circle"></i>
                    No skills added yet. Add at least one skill.
                  </div>
                )}
              </div>

              {formData.skills.length > 0 && (
                <div className="skills-count">
                  {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} added
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="form-section">
          <h3>Education</h3>
          {formData.education.map((edu, i) => (
            <div key={i} className="array-item">
              <input
                type="text"
                value={edu}
                onChange={(e) => handleArrayChange("education", i, e.target.value)}
                className="form-input"
                placeholder="Degree or certification"
              />
              <button 
                type="button" 
                onClick={() => removeArrayItem("education", i)}
                className="remove-btn"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addArrayItem("education", "")}
            className="add-item-btn"
          >
            <i className="fas fa-plus"></i> Add Education
          </button>
        </div>

        {/* Projects Section */}
        <div className="form-section">
          <h3>Projects</h3>
          {formData.projects.map((proj, i) => (
            <div key={i} className="nested-item">
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={proj.title || ""}
                  onChange={(e) => handleNestedChange("projects", i, "title", e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Description"
                  value={proj.description || ""}
                  onChange={(e) => handleNestedChange("projects", i, "description", e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Links (comma separated)</label>
                <input
                  type="text"
                  placeholder="Links (comma separated)"
                  value={proj.links ? proj.links.join(", ") : ""}
                  onChange={(e) => handleNestedChange(
                    "projects",
                    i,
                    "links",
                    e.target.value.split(",").map(l => l.trim())
                  )}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={proj.skills ? proj.skills.join(", ") : ""}
                  onChange={(e) => handleNestedChange(
                    "projects",
                    i,
                    "skills",
                    e.target.value.split(",").map(s => s.trim())
                  )}
                  className="form-input"
                />
              </div>
              
              <button 
                type="button" 
                onClick={() => removeNestedItem("projects", i)}
                className="remove-btn"
              >
                <i className="fas fa-trash"></i> Remove Project
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addNestedItem("projects", {
              title: "",
              description: "",
              links: [],
              skills: [],
            })}
            className="add-item-btn"
          >
            <i className="fas fa-plus"></i> Add Project
          </button>
        </div>

        {/* Work Experience Section */}
        <div className="form-section">
          <h3>Work Experience</h3>
          {formData.work.map((job, i) => (
            <div key={i} className="nested-item">
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  placeholder="Company"
                  value={job.company || ""}
                  onChange={(e) => handleNestedChange("work", i, "company", e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  placeholder="Role"
                  value={job.role || ""}
                  onChange={(e) => handleNestedChange("work", i, "role", e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  placeholder="Duration (e.g. Jan 2020 - Present)"
                  value={job.duration || ""}
                  onChange={(e) => handleNestedChange("work", i, "duration", e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Description"
                  value={job.description || ""}
                  onChange={(e) => handleNestedChange("work", i, "description", e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <button 
                type="button" 
                onClick={() => removeNestedItem("work", i)}
                className="remove-btn"
              >
                <i className="fas fa-trash"></i> Remove Job
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addNestedItem("work", {
              company: "",
              role: "",
              duration: "",
              description: "",
            })}
            className="add-item-btn"
          >
            <i className="fas fa-plus"></i> Add Job
          </button>
        </div>

        {/* Links Section */}
        <div className="form-section">
          <h3>Links</h3>
          <div className="form-group">
            <label className="form-label">GitHub</label>
            <input
              type="url"
              placeholder="GitHub URL"
              value={formData.links.github || ""}
              onChange={(e) => handleLinksChange("github", e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={formData.links.linkedin || ""}
              onChange={(e) => handleLinksChange("linkedin", e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Portfolio</label>
            <input
              type="url"
              placeholder="Portfolio URL"
              value={formData.links.portfolio || ""}
              onChange={(e) => handleLinksChange("portfolio", e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onClose && (
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              <>
                <i className={`fas ${mode === "create" ? "fa-user-plus" : "fa-save"}`}></i> 
                {mode === "create" ? " Create Profile" : " Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;