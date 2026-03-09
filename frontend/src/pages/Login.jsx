import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Siren } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/'); 
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <Siren size={48} color="var(--primary-accent)" style={{ margin: '0 auto 20px', display: 'block' }} />
                <h2>Sign in to CivicCenter</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email address" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-primary auth-btn">Log in</button>
                </form>
                <p className="auth-link-text">Don't have an account? <Link to="/register">Sign up</Link></p>
            </div>
        </div>
    );
};

export default Login;