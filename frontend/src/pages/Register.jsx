import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
        <div className="auth-container card">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="User">User</option>
                        <option value="Municipality Staff">Municipality Staff</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="btn">Sign Up</button>
            </form>
        </div>
    );
};

export default Register;
