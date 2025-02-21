import React, { useState } from 'react';
import '../css/Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Hamburger button will be hidden on desktop via CSS */}
                <button className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
                {/* Desktop and mobile nav links */}
                <ul className="nav-links">
                    <li>
                        <a href="/" className="nav-link">Home</a>
                    </li>
                    <li>
                        <a href="/create-job" className="nav-link">Add Application</a>
                    </li>
                    <li>
                        <a href="/files" className="nav-link">Files</a>
                    </li>
                    <li>
                        <a href="/dashboard" className="nav-link">Dashboard</a>
                    </li>
                    <li>
                        <a href="/logout" className="nav-link">Logout</a>
                    </li>
                </ul>
            </div>

            {/* Full-page overlay menu for mobile only (handled by CSS) */}
            <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <ul className="overlay-nav-links">
                    <li>
                        <a href="/" className="nav-link" onClick={toggleMenu}>Home</a>
                    </li>
                    <li>
                        <a href="/create-job" className="nav-link" onClick={toggleMenu}>Add App</a>
                    </li>
                    <li>
                        <a href="/files" className="nav-link" onClick={toggleMenu}>Files</a>
                    </li>
                    <li>
                        <a href="/dashboard" className="nav-link" onClick={toggleMenu}>Dashboard</a>
                    </li>
                    <li>
                        <a href="/logout" className="nav-link" onClick={toggleMenu}>Logout</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;