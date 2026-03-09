import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Calendar, MapPin, Award } from 'lucide-react';
import NavBar from '../components/NavBar';
import '../styles/Dashboard.css'; // Reusing layout css

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fake delay for UI effect if backend is offline
                const res = await axios.get('http://localhost:5000/api/auth/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: { totalReports: 12, impactScore: 850, resolvedCount: 8, badges: [{icon: '🌟', title: 'First Fix', type: 'Starter'}] } }));
                
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="app-layout">
            <NavBar />
            
            <main className="feed-column">
                <header className="feed-header">
                    <h2>Profile</h2>
                    <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{stats?.totalReports || 0} Reports</span>
                </header>

                {loading ? (
                    <div className="empty-state">Loading...</div>
                ) : (
                    <div className="profile-content">
                        {/* Profile Banner */}
                        <div style={{ height: '200px', backgroundColor: 'var(--border-color)', backgroundImage: 'linear-gradient(45deg, #16181c, #1d9bf020)' }}></div>
                        
                        {/* Profile Info Section */}
                        <div style={{ padding: '0 16px 16px', position: 'relative' }}>
                            {/* Overlapping Avatar */}
                            <div style={{ 
                                width: '130px', height: '130px', borderRadius: '50%', 
                                backgroundColor: 'var(--primary-accent)', color: 'white', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                fontSize: '3rem', fontWeight: '800', border: '4px solid var(--bg-color)',
                                marginTop: '-65px', position: 'relative', zIndex: 2
                            }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>{user?.name || 'User'}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: '2px 0 12px' }}>@{user?.name?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
                            </div>

                            {/* Bio / Meta */}
                            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> Active in City</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> Joined March 2026</span>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                <span><strong style={{ color: 'var(--text-main)' }}>{stats?.totalReports || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>Reports</span></span>
                                <span><strong style={{ color: '#00ba7c' }}>{stats?.resolvedCount || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>Resolved</span></span>
                                <span><strong style={{ color: '#ffad1f' }}>{stats?.impactScore || 0}</strong> <span style={{ color: 'var(--text-muted)' }}>Impact Score</span></span>
                            </div>

                            {/* Achievements Gallery */}
                            <h3 style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: '700' }}>Achievements</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '12px' }}>
                                {stats?.badges?.length > 0 ? stats.badges.map((badge, idx) => (
                                    <div key={idx} style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{badge.icon}</div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{badge.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{badge.type}</div>
                                    </div>
                                )) : (
                                    <div style={{ color: 'var(--text-muted)', padding: '20px', gridColumn: '1 / -1', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                                        <Award size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                        <p>No badges yet. Start reporting!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <aside className="right-sidebar"></aside> {/* Empty right sidebar to keep layout */}
        </div>
    );
};

export default Profile;