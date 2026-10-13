import React, { useState } from "react";
import API from "../services/api";
import { MapPin, ShieldAlert, CheckCircle, Trash2 } from "lucide-react";
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

const AdminComplaintCard = ({ complaint, municipalities, refresh }) => {
  const [municipalityId, setMunicipalityId] = useState("");
  const [showMap, setShowMap] = useState(false);
  const complaintId = complaint.id || complaint._id;

  const assignComplaint = async (e) => {
    e.stopPropagation();
    if (!municipalityId) return alert("Select municipality first");
    try {
      await API.put("/admin/complaints/assign", { complaintId, municipalityId });
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const markSpam = async (e) => {
    e.stopPropagation();
    try {
      await API.put(`/admin/complaints/spam/${complaintId}`);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComplaint = async (e) => {
    e.stopPropagation();
    try {
      await API.delete(`/admin/complaints/${complaintId}`);
      refresh();
    } catch (error) {
      console.error(error);
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
          <div className="card-avatar">
            {complaint.user?.name?.charAt(0) || "U"}
          </div>
          <div className="card-meta">
            <span className="card-name">{complaint.user?.name || "Unknown Citizen"}</span>
            <span className="card-time">{complaint.user?.email}</span>
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
          <img src={complaint.userImageURL} alt="Issue" loading="lazy" />
        </div>
      )}

      {/* Map Toggle Button */}
      <div className="card-footer" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
        <button 
          className="action-btn location-btn" 
          onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
        >
          <MapPin size={20} />
          <span>{showMap ? "Hide Map" : "View Map"}</span>
        </button>
      </div>

      {showMap && complaint.location && (
        <div style={{ height: '200px', width: 'calc(100% - 32px)', margin: '0 16px 16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <MapContainer center={[complaint.location.lat, complaint.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            <Marker position={[complaint.location.lat, complaint.location.lng]} />
          </MapContainer>
        </div>
      )}

      {/* Admin Action Bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '0 16px 16px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
        
        {/* 👇 FIX: Hide Assign and Spam if it's already Resolved 👇 */}
        {complaint.status !== 'Resolved' ? (
          <>
            <select 
              value={municipalityId} 
              onChange={(e) => setMunicipalityId(e.target.value)}
              className="search-input"
              style={{ padding: '8px 16px', borderRadius: '20px', flex: 1, minWidth: '150px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">Select Municipality...</option>
              {municipalities.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>

            <button onClick={assignComplaint} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              <CheckCircle size={16} /> Assign
            </button>

            <button onClick={markSpam} style={{ padding: '8px 16px', background: 'rgba(249, 24, 128, 0.1)', color: '#f91880', border: '1px solid rgba(249, 24, 128, 0.3)', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              <ShieldAlert size={16} /> Spam
            </button>
          </>
        ) : (
          <div style={{ flex: 1, color: '#00ba7c', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <CheckCircle size={18} /> Fixed & Verified
          </div>
        )}

        {/* Delete button stays visible for Admins to clean up the DB */}
        <button onClick={deleteComplaint} style={{ padding: '8px 16px', background: 'rgba(113, 118, 123, 0.1)', color: '#71767b', border: '1px solid rgba(113, 118, 123, 0.3)', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>

    </article>
  );
};

export default AdminComplaintCard;