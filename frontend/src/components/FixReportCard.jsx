import React from 'react';
import { BadgeCheck, MapPin, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FixReportCard = ({ report }) => {
    // Format the date Twitter-style
    const timeAgo = report.timeOfFix || report.createdAt
        ? formatDistanceToNow(new Date(report.timeOfFix || report.createdAt), { addSuffix: false }).replace('about ', '')
        : 'Just now';

    return (
        <article className="tweet-card official-fix-card" style={{ borderLeft: '3px solid #00ba7c' }}>
            <div className="tweet-left">
                <div className="tweet-avatar" style={{ backgroundColor: '#00ba7c' }}>
                    <BadgeCheck size={24} color="white" />
                </div>
            </div>
            
            <div className="tweet-right">
                <div className="tweet-header">
                    <div className="tweet-user-info">
                        <span className="tweet-name">{report.departmentId?.name || 'Dept. of Public Works'}</span>
                        <BadgeCheck size={16} color="#00ba7c" style={{ marginLeft: '4px', marginRight: '4px' }} />
                        <span className="tweet-handle">@official_update</span>
                        <span className="tweet-dot">·</span>
                        <span className="tweet-time">{timeAgo}</span>
                    </div>
                    <div className="tweet-status status-resolved">FIXED</div>
                </div>

                <p className="tweet-text" style={{ color: '#e7e9ea', borderLeft: '2px solid #00ba7c', paddingLeft: '12px', margin: '8px 0 12px' }}>
                    {report.description || "The reported infrastructure issue has been successfully resolved at this location."}
                </p>

                {report.fixImageURL && (
                    <div className="tweet-media">
                        <img src={report.fixImageURL} alt="Resolution Proof" loading="lazy" />
                    </div>
                )}

                <div className="tweet-actions" style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', gap: '20px' }}>
                    <div className="action-group location-group">
                        <div className="action-icon-bg"><MapPin size={16} /></div>
                        <span className="action-count">View Map</span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default FixReportCard;