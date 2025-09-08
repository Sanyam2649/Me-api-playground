// src/components/TopSkills.js
import React, { useEffect, useState } from "react";
import { getTopSkills } from "../api/api";

const TopSkills = ({ limit = 5 }) => {
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopSkills = async () => {
      try {
        const res = await getTopSkills(limit);
        setTopSkills(res.data.skills || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch top skills");
      } finally {
        setLoading(false);
      }
    };
    fetchTopSkills();
  }, [limit]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading top skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="top-skills-section">
      <h2>
        <i className="fas fa-trophy"></i> Most Popular Skills
      </h2>
      <div className="skills-list">
        {topSkills.map((skill, index) => (
          <div key={index} className="top-skill-item">
            <span className="skill-rank">#{index + 1}</span>
            <span className="skill-name">{skill.skill}</span>
            <span className="skill-count">{skill.count} projects</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSkills;