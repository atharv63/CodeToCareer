import React, { useState, useContext } from 'react';
import { FaMapMarkerAlt, FaClock, FaArrowUp, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ComplaintCard = ({ complaint, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isUpvoting, setIsUpvoting] = useState(false);

    const hasUpvoted = complaint.upvotes?.includes(user?.id);
    const upvoteCount = complaint.upvotes?.length || 0;

    const handleUpvote = async () => {
        if (isUpvoting) return;
        setIsUpvoting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/complaints/${complaint._id}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the complaint object locally via parent callback
            if (onUpdate) onUpdate(complaint._id, { upvotes: res.data });
        } catch (error) {
            console.error('Error upvoting:', error);
        } finally {
            setIsUpvoting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved': return { color: '#059669', background: '#ecfdf5' };
            case 'In Progress': return { color: '#2563eb', background: '#eff6ff' };
            case 'Assigned': return { color: '#d97706', background: '#fffbeb' };
            default: return { color: '#dc2626', background: '#fef2f2' };
        }
    };

    return (
        <div className="card social-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Header */}
            <div className="card-header">
                <div className="avatar">
                    {complaint.userId?.name?.charAt(0) || 'U'}
                </div>
                <div className="meta">
                    <span className="name">{complaint.userId?.name || 'Anonymous User'}</span>
                    <span className="time">
                        <FaClock /> {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="status-badge" style={{ ...getStatusStyle(complaint.status), padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {complaint.status}
                </div>
            </div>

            {/* Content */}
            <p className="description" style={{ padding: '1rem', margin: '0' }}>{complaint.description}</p>
            
            <div className="card-media">
                <img src={complaint.userImageURL} alt="Issue" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
            </div>

            {/* Footer / Actions */}
            <div className="card-footer" style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Upvote Button (Me Too) */}
                        <button 
                            className={`upvote-btn ${hasUpvoted ? 'active' : ''}`}
                            onClick={handleUpvote}
                            disabled={isUpvoting}
                        >
                            <FaArrowUp /> 
                            <span>{upvoteCount} {upvoteCount === 1 ? 'Person' : 'People'} saw this</span>
                        </button>

                        <div className="location-info">
                            <FaMapMarkerAlt color="#ef4444" />
                            <span>Location Pinned</span>
                        </div>
                    </div>

                    {/* Official Link if Resolved */}
                    {complaint.status === 'Resolved' && complaint.relatedFixPost && (
                        <a href={`#fix-${complaint.relatedFixPost}`} className="fix-link" style={{ margin: '0', padding: '0.5rem 1rem' }}>
                            <FaExternalLinkAlt style={{ marginRight: '6px' }} /> View Fix Report
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;
