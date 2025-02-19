import React from 'react';
import '../css/Navbar.css';

const Navbar = () => {

    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li>
                    <a href="/" className="nav-link">Home</a>
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
        </nav>
    );
};

export default Navbar;