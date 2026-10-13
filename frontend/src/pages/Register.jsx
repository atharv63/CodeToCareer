import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Siren } from 'lucide-react';
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User', municipalityId: '' });
    const [municipalities, setMunicipalities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/public/municipalities')
            .then(res => setMunicipalities(res.data))
            .catch(err => console.error('Could not load municipalities:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate: Staff must select a municipality
        if (formData.role === 'Municipality Staff' && !formData.municipalityId) {
            setError('Please select your municipality.');
            return;
        }

        setLoading(true);
        try {
            const municipalityData = formData.municipalityId || undefined;
            await register(formData.name, formData.email, formData.password, formData.role, municipalityData);
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Registration failed. Is your backend running?';
            setError(errorMsg);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <Siren size={48} color="var(--primary-accent)" style={{ margin: '0 auto 20px', display: 'block' }} />
                <h2>Create your account</h2>
                {error && (
                    <p style={{ color: '#f4212e', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'left', padding: '10px 12px', background: 'rgba(244,33,46,0.1)', borderRadius: '8px', border: '1px solid rgba(244,33,46,0.3)' }}>
                        {error}
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="auth-input"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email address"
                        className="auth-input"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        className="auth-input"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        minLength={6}
                    />

                    <select
                        className="auth-select"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value, municipalityId: ''})}
                    >
                        <option value="User">Citizen / User</option>
                        <option value="Municipality Staff">Municipality Staff</option>
                        <option value="Admin">System Admin</option>
                    </select>

                    {formData.role === 'Municipality Staff' && (
                        <select
                            className="auth-select"
                            value={formData.municipalityId}
                            onChange={(e) => setFormData({...formData, municipalityId: e.target.value})}
                            required
                        >
                            <option value="">-- Select your Municipality --</option>
                            {municipalities.map(m => (
                                <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>
                            ))}
                        </select>
                    )}

                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>
                <p className="auth-link-text">Already have an account? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    );
};

export default Register;