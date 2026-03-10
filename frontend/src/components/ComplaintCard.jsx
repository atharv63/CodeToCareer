import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, MapPin, ExternalLink, ArrowUp, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import '../styles/ComplaintCard.css'; 

const ComplaintCard = ({ complaint, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [isUpvoting, setIsUpvoting] = useState(false);
    
    // Comment States
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState(complaint.comments || []);
    const [isCommenting, setIsCommenting] = useState(false);

    if (!complaint) return null;

    const hasUpvoted = complaint.upvotes?.includes(user?.id);
    const upvoteCount = complaint.upvotes?.length || 0;

    const handleFollowUp = async (e) => {
        e.stopPropagation(); 
        if (isUpvoting) return;
        setIsUpvoting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/complaints/${complaint._id}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onUpdate) onUpdate(complaint._id, { upvotes: res.data });
        } catch (error) {
            console.error('Error boosting issue:', error);
        } finally {
            setIsUpvoting(false);
        }
    };

    // The New Comment Function!
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isCommenting) return;
        
        setIsCommenting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/complaints/${complaint._id}/comments`, {
                text: commentText,
                userName: user?.name // Pass user name so backend can save it directly
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocalComments(res.data); // Update UI instantly
            setCommentText(''); // Clear input
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsCommenting(false);
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

    const timeAgo = complaint.createdAt 
        ? formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: false }).replace('about ', '') 
        : 'Just now';

    return (
        <article className="premium-card">
            <div className="card-header">
                <div className="card-user">
                    <div className="card-avatar">
                        {complaint.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="card-meta">
                        <span className="card-name">{complaint.userId?.name || 'Citizen'}</span>
                        <span className="card-time">{timeAgo} ago</span>
                    </div>
                </div>
                <div className={`status-badge ${getStatusStyle(complaint.status)}`}>
                    {complaint.status || 'Pending'}
                </div>
            </div>

            <div className="card-body">
                <p className="card-text">{complaint.description}</p>
            </div>

            {complaint.userImageURL && (
                <div className="card-media">
                    <img src={complaint.userImageURL} alt="Issue reported" loading="lazy" />
                </div>
            )}

            <div className="card-footer">
                <button 
                    className={`action-btn boost-btn ${hasUpvoted ? 'boosted' : ''}`} 
                    onClick={handleFollowUp}
                    disabled={isUpvoting}
                >
                    <ArrowUp size={20} strokeWidth={hasUpvoted ? 3 : 2} />
                    <span>{hasUpvoted ? 'Following Up' : 'Follow Up'}</span>
                    {upvoteCount > 0 && <span className="action-count">• {upvoteCount}</span>}
                </button>

                {/* Toggles the comment section visibility */}
                <button className="action-btn comment-btn" onClick={() => setShowComments(!showComments)}>
                    <MessageCircle size={20} />
                    <span>Discuss {localComments.length > 0 ? `(${localComments.length})` : ''}</span>
                </button>

                <div className="action-btn location-btn">
                    <MapPin size={20} />
                    <span>View Map</span>
                </div>
            </div>

            {/* THE NEW COMMENTS DROPDOWN SECTION */}
            {showComments && (
                <div className="comments-section">
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <div className="mini-avatar">{user?.name?.charAt(0) || 'U'}</div>
                        <input 
                            type="text" 
                            className="comment-input" 
                            placeholder="Add to the discussion..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" className="comment-submit" disabled={!commentText.trim() || isCommenting}>
                            <Send size={18} />
                        </button>
                    </form>
                    
                    <div className="comments-list">
                        {localComments.map((comment, index) => (
                            <div key={index} className="comment-bubble">
                                <span className="comment-author">{comment.name}</span>
                                <span className="comment-text">{comment.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

export default ComplaintCard;