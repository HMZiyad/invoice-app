import { NavLink } from 'react-router-dom';
import { Upload, Clock, LifeBuoy, BookOpen } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-title">Luminous</div>
        <div className="sidebar-logo-subtitle">Extraction Suite</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <Upload size={17} />
          Upload
        </NavLink>

        <NavLink
          to="/recent"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <Clock size={17} />
          Recent
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <a
          href="#"
          className="sidebar-link"
          onClick={(e) => e.preventDefault()}
        >
          <LifeBuoy size={16} />
          Support
        </a>
        <a
          href="#"
          className="sidebar-link"
          onClick={(e) => e.preventDefault()}
        >
          <BookOpen size={16} />
          Documentation
        </a>
      </div>
    </aside>
  );
}
