import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="bondmatch-app">
      <header className="bm-header">
        <div className="bm-header-inner">
          <div className="bm-logo">
            Bond<span>Match</span>
          </div>
          <nav className="bm-nav">
            <NavLink end to="/">
              Home
            </NavLink>
            <NavLink to="/how-it-works">
              How It Works
            </NavLink>
            <a href="/#about">
              About
            </a>
          </nav>
        </div>
      </header>

      <main>
        <div className="bm-container">
          <Outlet />
        </div>
      </main>

      <footer className="bm-footer">
        <div className="bm-footer-inner">
          <span>© {new Date().getFullYear()} BondMatch. All rights reserved.</span>
          <span>
            Contact:{' '}
            <a href="mailto:support@bondmatch.com">
              support@bondmatch.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

