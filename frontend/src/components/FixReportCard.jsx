import React from 'react';
import { FaCheckCircle, FaCalendarAlt, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

const FixReportCard = ({ report }) => {
    return (
        <div className="card social-card official-card shadow-lg">
            {/* Official Header */}
            <div className="card-header">
                <div className="avatar official-avatar">
                   <FaCheckCircle color="white" />
                </div>
                <div className="meta">
                    <span className="name">{report.departmentId?.name || 'Department of Public Works'} Update</span>
                    <div className="verified-badge">
                        <FaCheckCircle size={10} /> Official Verified
                    </div>
                </div>
                <div className="post-time">
                    <FaCalendarAlt style={{ marginRight: '4px' }} />
                    {new Date(report.timeOfFix || report.createdAt).toLocaleDateString()}
                </div>
            </div>

            {/* Fix Description */}
            <p className="description" style={{ borderLeft: '3px solid #0ea5e9', paddingLeft: '1rem', margin: '1rem' }}>
                {report.description || "The reported infrastructure issue has been successfully resolved at this location."}
            </p>

            {/* The Evidence Image */}
            <div className="card-media">
                <img src={report.fixImageURL} alt="Resolution Proof" style={{ height: '350px', objectFit: 'cover' }} />
            </div>

            {/* Footer */}
            <div className="card-footer" style={{ borderTop: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="location-info">
                   <FaMapMarkerAlt color="#0ea5e9" />
                   <span>View on City Map</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                    <FaBuilding /> NDMC - Infrastructure Division
                </div>
            </div>
        </div>
    );
};

export default FixReportCard;
