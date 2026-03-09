import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">Civic Reporter</Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <span style={{ marginRight: '1rem', fontWeight: 600 }}>Welcome, {user.name}</span>
                        <button onClick={handleLogout} className="btn-sm">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
                        <Link to="/register"><button>Register</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
