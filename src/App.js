// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProfileList from "./pages/profileList";
import ProfileDetails from "./pages/profileDetail";
import CreateProfile from "./pages/createProfile";
import "./App.css";

// Create a simple navigation component without useLocation
function Navigation() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-link">
        <i className="fas fa-home"></i> Home
      </Link>
      <Link to="/create" className="nav-link">
        <i className="fas fa-user-plus"></i> Create Profile
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <h1>Me-API Playground</h1>
          </div>
          <Navigation />
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProfileList />} />
            <Route path="/profile/:id" element={<ProfileDetails />} />
            <Route path="/create" element={<CreateProfile />} />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>&copy; {new Date().getFullYear()} Me-API Playground. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;