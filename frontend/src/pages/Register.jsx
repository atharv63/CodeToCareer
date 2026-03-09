import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Siren } from 'lucide-react';
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            navigate('/');
        } catch (error) {
            alert('Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <Siren size={48} color="var(--primary-accent)" style={{ margin: '0 auto 20px', display: 'block' }} />
                <h2>Create your account</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Full Name" className="auth-input" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <input type="email" placeholder="Email address" className="auth-input" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="auth-input" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    
                    <select className="auth-select" onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="User">Citizen / User</option>
                        <option value="Municipality Staff">Municipality Staff</option>
                        <option value="Admin">System Admin</option>
                    </select>

                    <button type="submit" className="btn-primary auth-btn">Sign up</button>
                </form>
                <p className="auth-link-text">Already have an account? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    );
};

export default Register;