import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, User, LogOut, Plus, MapPin, Siren } from 'lucide-react';
import '../styles/Sidebar.css';

const NavBar = ({ onOpenReportModal }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Reusable component for Nav Links with Active State
    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                    <Icon size={28} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className="nav-label">{label}</span>
            </Link>
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                {/* Logo */}
                <Link to="/" className="logo-container">
                    <Siren size={34} color="var(--primary-accent)" strokeWidth={2} />
                </Link>

                {/* Desktop Nav Links */}
                <nav className="nav-links">
                    <NavItem to="/" icon={Home} label="Feed" />
                    {/* Assuming you might want a separate map route later, or just toggle it in feed */}
                    <NavItem to="/map" icon={MapPin} label="City Map" />
                    {user && <NavItem to="/profile" icon={User} label="Profile" />}
                </nav>

                {/* Massive "Post" Button (Desktop) */}
                {user && (
                    <button className="btn-primary report-btn-desktop" onClick={onOpenReportModal}>
                        <span className="btn-text">Report Issue</span>
                        <Plus className="btn-icon-mobile" size={24} />
                    </button>
                )}
            </div>

            {/* User Profile Pill (Desktop Bottom) */}
            {user ? (
                <div className="sidebar-bottom">
                    <div className="user-pill">
                        <div className="avatar-small">{user.name?.charAt(0) || 'U'}</div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-handle">@{user.name.toLowerCase().replace(/\s/g, '')}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="sidebar-bottom">
                     <Link to="/login" className="btn-primary login-btn" style={{textAlign: 'center', textDecoration: 'none'}}>Login</Link>
                </div>
            )}

            {/* Mobile Bottom Tab Bar (Only shows on phones) */}
            <nav className="mobile-bottom-nav">
                <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}><Home size={26} /></Link>
                <Link to="/map" className={`mobile-nav-item ${location.pathname === '/map' ? 'active' : ''}`}><MapPin size={26} /></Link>
                
                {/* Floating Action Button (FAB) for Mobile */}
                {user && (
                    <div className="mobile-fab-container">
                        <button className="mobile-fab" onClick={onOpenReportModal}>
                            <Plus size={28} color="white" strokeWidth={3} />
                        </button>
                    </div>
                )}
                
                {user && <Link to="/profile" className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}><User size={26} /></Link>}
            </nav>
        </aside>
    );
};

export default NavBar;