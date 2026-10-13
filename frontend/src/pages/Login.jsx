import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Siren } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Check your credentials.';
            setError(errorMsg);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <Siren size={48} color="var(--primary-accent)" style={{ margin: '0 auto 20px', display: 'block' }} />
                <h2>Sign in to CivicCenter</h2>
                {error && (
                    <p style={{ color: '#f4212e', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'left', padding: '10px 12px', background: 'rgba(244,33,46,0.1)', borderRadius: '8px', border: '1px solid rgba(244,33,46,0.3)' }}>
                        {error}
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email address" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Log in'}
                    </button>
                </form>
                <p className="auth-link-text">Don't have an account? <Link to="/register">Sign up</Link></p>
            </div>
        </div>
    );
};

export default Login;