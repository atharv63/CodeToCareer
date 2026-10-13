import React, { useState } from "react";
import axios from "axios";
import { MapPin, Wrench, CheckCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

const StaffComplaintCard = ({ complaint, refresh, onResolveClick }) => {
  const [showMap, setShowMap] = useState(false);
  const complaintId = complaint._id;

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/staff/complaints/${complaintId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
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

  return (
    <article className="premium-card">
      <div className="card-header">
        <div className="card-user">
          <div className="card-avatar" style={{ border: '2px solid var(--primary-accent)' }}>
            {complaint.user?.name?.charAt(0) || "U"}
          </div>
          <div className="card-meta">
            <span className="card-name">Work Order #{complaint._id.slice(-6).toUpperCase()}</span>
            <span className="card-time">{complaint.municipalityId?.name || "City limits"}</span>
          </div>
        </div>
        <div className={`status-badge ${getStatusStyle(complaint.status)}`}>
          {complaint.status}
        </div>
      </div>

      <div className="card-body">
        <p className="card-text">{complaint.description}</p>
      </div>

      {complaint.userImageURL && (
        <div className="card-media">
          <img src={complaint.userImageURL} alt="Issue" loading="lazy" />
        </div>
      )}

      {/* Map Toggle */}
      <div className="card-footer" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
        <button className="action-btn location-btn" onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}>
          <MapPin size={20} />
          <span>{showMap ? "Hide Location" : "View Exact Location"}</span>
        </button>
      </div>

      {showMap && complaint.location && (
        <div style={{ height: '200px', width: 'calc(100% - 32px)', margin: '0 16px 16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <MapContainer center={[complaint.location.lat, complaint.location.lng]} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            <Marker position={[complaint.location.lat, complaint.location.lng]} />
          </MapContainer>
        </div>
      )}

      {/* Staff Action Bar */}
      {complaint.status !== 'Resolved' && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '0 16px 16px' }} onClick={(e) => e.stopPropagation()}>
          <select 
            value={complaint.status} 
            onChange={handleStatusChange}
            className="search-input"
            style={{ padding: '8px 16px', borderRadius: '20px', flex: 1, minWidth: '130px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
          </select>

          <button 
            onClick={(e) => { e.stopPropagation(); onResolveClick(complaint); }} 
            style={{ padding: '8px 16px', background: 'rgba(0, 186, 124, 0.15)', color: '#00ba7c', border: '1px solid rgba(0, 186, 124, 0.3)', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '0.9rem', flex: 2, justifyContent: 'center' }}
          >
            <Wrench size={16} /> Mark as Resolved
          </button>
        </div>
      )}
      
      {complaint.status === 'Resolved' && (
          <div style={{ padding: '0 16px 16px', color: '#00ba7c', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              <CheckCircle size={18} /> Issue Fixed and Verified
          </div>
      )}
    </article>
  );
};

export default StaffComplaintCard;