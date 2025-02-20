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
                <button className="hamburger" onClick={toggleMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
                <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
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
        </nav>
    );
};

export default Navbar;