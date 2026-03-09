import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaTrophy, FaHandshake, FaBullhorn, FaCheckDouble } from 'react-icons/fa';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="container">Loading Profile...</div>;

    return (
        <div className="feed-container">
            <div className="card shadow-lg" style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                <div className="avatar" style={{ width: '80px', height: '80px', margin: '0 auto 1rem', fontSize: '2rem' }}>
                    {user?.name?.charAt(0)}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{user?.name}</h2>
                <p style={{ color: '#64748b' }}>{user?.email}</p>
                <div className="verified-badge" style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
                    Civic Hero
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats?.totalReports || 0}</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700' }}>Reports</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#eab308' }}>{stats?.impactScore || 0}</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700' }}>Impact</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>{stats?.resolvedCount || 0}</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700' }}>Resolved</div>
                    </div>
                </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Achievements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                {stats?.badges && stats.badges.length > 0 ? stats.badges.map((badge, idx) => (
                    <div key={idx} className="card shadow-sm" style={{ padding: '1rem', textAlign: 'center', border: '2px solid #eff6ff' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800' }}>{badge.title}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{badge.type}</div>
                    </div>
                )) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No achievements yet. Start reporting to earn badges!</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
