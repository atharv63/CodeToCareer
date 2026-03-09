import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Heart, MessageCircle, MapPin, ExternalLink, ArrowUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import '../styles/ComplaintCard.css'; // We will create this next!

const ComplaintCard = ({ complaint, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isUpvoting, setIsUpvoting] = useState(false);

    // Safeguard for missing data
    if (!complaint) return null;

    const hasUpvoted = complaint.upvotes?.includes(user?.id);
    const upvoteCount = complaint.upvotes?.length || 0;

    const handleUpvote = async (e) => {
        e.stopPropagation(); // Prevents clicking the card from triggering other events
        if (isUpvoting) return;
        setIsUpvoting(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming your backend toggles the upvote (adds if missing, removes if present)
            const res = await axios.post(`http://localhost:5000/api/complaints/${complaint._id}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onUpdate) onUpdate(complaint._id, { upvotes: res.data });
        } catch (error) {
            console.error('Error upvoting:', error);
        } finally {
            setIsUpvoting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved': return 'status-resolved';
            case 'In Progress': return 'status-progress';
            case 'Assigned': return 'status-assigned';
            default: return 'status-pending';
        }
    };

    // Format the date to look like Twitter (e.g., "2h", "5d")
    const timeAgo = complaint.createdAt 
        ? formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: false }).replace('about ', '') 
        : 'Just now';

    return (
        <article className="tweet-card">
            {/* Left Side: Avatar */}
            <div className="tweet-left">
                <div className="tweet-avatar">
                    {complaint.userId?.name?.charAt(0) || 'U'}
                </div>
            </div>

            {/* Right Side: Content */}
            <div className="tweet-right">
                {/* Header */}
                <div className="tweet-header">
                    <div className="tweet-user-info">
                        <span className="tweet-name">{complaint.userId?.name || 'Anonymous'}</span>
                        <span className="tweet-handle">@{complaint.userId?.name?.toLowerCase().replace(/\s/g, '') || 'user'}</span>
                        <span className="tweet-dot">·</span>
                        <span className="tweet-time">{timeAgo}</span>
                    </div>
                    <div className={`tweet-status ${getStatusStyle(complaint.status)}`}>
                        {complaint.status || 'Pending'}
                    </div>
                </div>

                {/* Body Text */}
                <p className="tweet-text">{complaint.description}</p>

                {/* Media Image */}
                {complaint.userImageURL && (
                    <div className="tweet-media">
                        <img src={complaint.userImageURL} alt="Issue reported" loading="lazy" />
                    </div>
                )}

                {/* Footer Actions */}
                <div className="tweet-actions">
                    {/* Upvote/Heart Button */}
                    <button 
                        className={`action-group upvote-group ${hasUpvoted ? 'upvoted' : ''}`} 
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                    >
                        <div className="action-icon-bg">
                            <Heart size={18} fill={hasUpvoted ? "#f91880" : "none"} color={hasUpvoted ? "#f91880" : "currentColor"} />
                        </div>
                        <span className="action-count">{upvoteCount > 0 ? upvoteCount : ''}</span>
                    </button>

                    {/* Location Tag */}
                    <div className="action-group location-group">
                        <div className="action-icon-bg">
                            <MapPin size={18} />
                        </div>
                        <span className="action-count">Pinned</span>
                    </div>

                    {/* Official Fix Link (If Resolved) */}
                    {complaint.status === 'Resolved' && complaint.relatedFixPost && (
                        <a href={`#fix-${complaint.relatedFixPost}`} className="action-group fix-group">
                            <div className="action-icon-bg">
                                <ExternalLink size={18} color="#00ba7c" />
                            </div>
                            <span className="action-count" style={{color: '#00ba7c'}}>View Fix</span>
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ComplaintCard;