import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Award, X, Camera, Save, User as UserIcon, Image as ImageIcon } from 'lucide-react';
import NavBar from '../components/NavBar';
import ComplaintCard from '../components/ComplaintCard';
import '../styles/Dashboard.css';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext); 
    const [stats, setStats] = useState(null);
    const [myComplaints, setMyComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);

    // --- REPORT ISSUE STATES ---
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [reportImage, setReportImage] = useState(null);
    const [reportPreview, setReportPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- EDIT PROFILE STATES ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editBio, setEditBio] = useState(user?.bio || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || '');
    const [bannerPreview, setBannerPreview] = useState(user?.bannerImage || '');
    const [isSaving, setIsSaving] = useState(false);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            const statsRes = await axios.get('http://localhost:5000/api/auth/stats', {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { totalReports: 0, impactScore: 0, resolvedCount: 0, badges: [] } }));
            
            const complaintsRes = await axios.get('http://localhost:5000/api/complaints/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats(statsRes.data);
            setMyComplaints(complaintsRes.data);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleUpdateItem = (id, updates) => {
        setMyComplaints(prev => prev.map(item => item._id === id ? { ...item, ...updates } : item));
    };

    // --- LOGIC FOR NEW REPORT ---
    const handleReportImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReportImage(file);
            setReportPreview(URL.createObjectURL(file));
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('description', description);
        if (reportImage) formData.append('image', reportImage);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/complaints', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowForm(false);
            setDescription('');
            setReportImage(null);
            setReportPreview(null);
            fetchProfileData(); // Refresh timeline to show new report
        } catch (error) {
            alert('Failed to post report');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- LOGIC FOR EDIT PROFILE ---
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        if (type === 'avatar') {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData();
        formData.append('name', editName);
        formData.append('bio', editBio);
        if (avatarFile) formData.append('profileImage', avatarFile);
        if (bannerFile) formData.append('bannerImage', bannerFile);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/profile', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(res.data); 
            setShowEditModal(false);
        } catch (error) {
            alert("Failed to update profile. Check backend logs.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="app-layout">
            {/* 👇 LINKED: Now NavBar can trigger the report modal here too */}
            <NavBar onOpenReportModal={() => setShowForm(true)} />
            
            <main className="feed-column">
                <header className="feed-header">
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <h2 style={{margin: 0}}>{user?.name}</h2>
                        <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>{myComplaints.length} Reports</span>
                    </div>
                </header>

                {loading ? (
                    <div className="empty-state">Loading Profile...</div>
                ) : (
                    <div className="profile-scroll-area">
                        <div className="profile-header-container">
                            <div className="profile-banner" style={{ 
                                backgroundImage: `url(${user?.bannerImage || 'https://images.unsplash.com/photo-1512100356956-c1b47f4b8a21?q=80&w=2000&auto=format&fit=crop'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}></div>
                            <div className="avatar-wrapper">
                                <div className="profile-avatar-img">
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} alt="Avatar" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}}/>
                                    ) : (
                                        user?.name?.charAt(0) || <UserIcon size={48}/>
                                    )}
                                </div>
                            </div>
                            <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>Edit profile</button>
                        </div>

                        <div className="profile-info-block">
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>{user?.name}</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}>@{user?.name?.toLowerCase().replace(/\s/g, '')}</p>
                            <p className="profile-bio">{user?.bio || "Citizen of Goa | Reporting for a better city"}</p>
                            <div className="profile-meta-row">
                                <span style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={16} /> Goa, India</span>
                                <span style={{display:'flex', alignItems:'center', gap:'4px'}}><Calendar size={16} /> Joined March 2026</span>
                            </div>
                            <div className="profile-stats-row">
                                <div className="stat-item"><strong>{myComplaints.length}</strong><span>Reports</span></div>
                                <div className="stat-item"><strong>{stats?.resolvedCount || 0}</strong><span>Resolved</span></div>
                                <div className="stat-item"><strong>{stats?.impactScore || 0}</strong><span>Impact</span></div>
                            </div>
                        </div>

                        <div className="profile-timeline-header">My Reports</div>
                        <div className="my-reports-list">
                            {myComplaints.length > 0 ? (
                                myComplaints.map(item => (
                                    <div key={item._id} onClick={() => setSelectedIssue(item)}>
                                        <ComplaintCard complaint={item} onUpdate={handleUpdateItem} />
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <Award size={48} strokeWidth={1} style={{marginBottom: '12px', opacity: 0.5}}/>
                                    <p>You haven't reported any issues yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <aside className="right-sidebar">
                {selectedIssue ? (
                    <div className="selected-issue-container">
                        <div className="selected-header">
                            <h3>Focus View</h3>
                            <button onClick={() => setSelectedIssue(null)} className="close-issue-btn"><X size={18} /></button>
                        </div>
                        <ComplaintCard complaint={selectedIssue} onUpdate={handleUpdateItem} />
                    </div>
                ) : (
                    <div className="desktop-map-card" style={{height: '300px'}}>
                        <h3>City Badges</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
                            {stats?.badges?.length > 0 ? stats.badges.map((b, i) => (
                                <div key={i} style={{padding: '12px', background: 'var(--bg-color)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)'}}>
                                    <span style={{fontSize: '2rem'}}>{b.icon}</span>
                                    <p style={{fontSize: '0.7rem', fontWeight: '700', marginTop: '5px'}}>{b.title}</p>
                                </div>
                            )) : (
                                <p style={{color:'var(--text-muted)', fontSize:'0.8rem', gridColumn:'1/-1', textAlign:'center'}}>Earn badges by reporting!</p>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* --- REPORT ISSUE MODAL --- */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="compose-modal" style={{maxWidth: '600px', width: '100%'}}>
                        <div className="modal-header">
                            <button onClick={() => setShowForm(false)} className="close-btn"><X size={24} /></button>
                            <span className="modal-title">Draft Report</span>
                        </div>
                        <form onSubmit={handleReportSubmit} className="compose-form-wrapper">
                            <div className="compose-body">
                                <div className="compose-avatar">{user?.name?.charAt(0)}</div>
                                <div className="compose-input-area">
                                    <textarea 
                                        rows="4" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        placeholder="What's broken? Add details..." 
                                        required 
                                    />
                                    {reportPreview && (
                                        <div className="image-preview-container">
                                            <img src={reportPreview} alt="Preview" className="image-preview" />
                                            <button type="button" onClick={() => {setReportImage(null); setReportPreview(null)}} className="remove-image-btn"><X size={16}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="compose-footer">
                                <label className="action-icon" title="Add Photo">
                                    <ImageIcon size={20} color="var(--primary-accent)" />
                                    <input type="file" accept="image/*" onChange={handleReportImageChange} style={{ display: 'none' }} />
                                </label>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Posting...' : 'Report Issue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT PROFILE MODAL --- */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="compose-modal" style={{maxHeight: '85vh', width: '100%', maxWidth: '600px'}}>
                        <div className="modal-header">
                            <button onClick={() => setShowEditModal(false)} className="close-btn"><X size={24} /></button>
                            <span className="modal-title">Edit Profile</span>
                            <button onClick={handleSaveProfile} className="btn-primary" style={{marginLeft: 'auto', padding: '6px 20px'}} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        <div className="compose-body" style={{flexDirection: 'column', padding: 0, overflowY: 'auto'}}>
                            <div className="profile-banner" style={{ backgroundImage: `url(${bannerPreview})`, height: '180px', position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                <div style={{position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.3)'}}></div>
                                <label style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', cursor: 'pointer', padding:'10px', borderRadius:'50%', display:'flex'}}>
                                    <Camera color="white" size={24} />
                                    <input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => handleFileChange(e, 'banner')} />
                                </label>
                            </div>
                            <div style={{position: 'relative', marginTop: '-45px', marginLeft: '20px', width: '90px', height: '90px'}}>
                                <div className="profile-avatar-img" style={{width: '90px', height: '90px', fontSize: '1.5rem', border: '4px solid var(--bg-color)'}}>
                                    {avatarPreview ? <img src={avatarPreview} alt="Preview" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}} /> : editName.charAt(0)}
                                </div>
                                <label style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', cursor: 'pointer', width: '32px', height: '32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <Camera size={16} color="white" />
                                    <input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => handleFileChange(e, 'avatar')} />
                                </label>
                            </div>
                            <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                <div className="input-group">
                                    <label style={{color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight:'700'}}>NAME</label>
                                    <input className="search-input" style={{borderRadius: '8px', marginTop: '8px', border:'1px solid var(--border-color)', background:'transparent'}} value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label style={{color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight:'700'}}>BIO</label>
                                    <textarea className="search-input" style={{borderRadius: '8px', marginTop: '8px', height: '100px', resize: 'none', border:'1px solid var(--border-color)', background:'transparent', padding:'12px'}} value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;