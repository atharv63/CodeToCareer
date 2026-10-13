import React from 'react';
import { CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FixReportCard = ({ report }) => {
    if (!report) return null;

    const timeAgo = report.createdAt 
        ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: false }).replace('about ', '') 
        : 'Just now';

    // Safely get the municipality name if populated, otherwise fallback
    const muniName = report.municipalityId?.name || "Dept. of Public Works";

    return (
        // Add a sleek green border on the left to indicate it's a resolved update
        <article className="premium-card" style={{ borderLeft: '4px solid #00ba7c' }}>
            <div className="card-header">
                <div className="card-user">
                    {/* Official Checkmark Avatar */}
                    <div className="card-avatar" style={{ background: 'rgba(0, 186, 124, 0.1)', color: '#00ba7c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={22} />
                    </div>
                    <div className="card-meta">
                        <span className="card-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {muniName} 
                            <CheckCircle size={14} color="#00ba7c" title="Verified Official" />
                        </span>
                        <span className="card-time">{timeAgo} ago • Official Update</span>
                    </div>
                </div>
                
                <div className="status-badge status-resolved" style={{ background: 'rgba(0, 186, 124, 0.1)', color: '#00ba7c' }}>
                    FIXED
                </div>
            </div>

            <div className="card-body">
                <p className="card-text">{report.description}</p>
            </div>

            {/* This uses the exact same CSS as standard complaints to prevent overflow! */}
            {report.fixImageURL && (
                <div className="card-media">
                    <img src={report.fixImageURL} alt="Fix Proof" loading="lazy" />
                </div>
            )}
        </article>
    );
};

export default FixReportCard;