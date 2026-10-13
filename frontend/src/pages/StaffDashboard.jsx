import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import StaffComplaintCard from "../components/StaffComplaintCard";
import NavBar from "../components/NavBar";
import { X, Camera, Image as ImageIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Dashboard.css';

const StaffDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState(location.pathname === '/map' ? 'map' : 'feed'); 
  
  const [complaints, setComplaints] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null); 

  // Resolve Modal States
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [issueToResolve, setIssueToResolve] = useState(null);
  const [fixDescription, setFixDescription] = useState("");
  const [fixImage, setFixImage] = useState(null);
  const [fixPreview, setFixPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCenter = [15.4909, 73.8278];

  useEffect(() => {
    if (location.pathname === '/map') setView('map');
    else setView('feed');
  }, [location.pathname]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:5000/api/staff/complaints", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
      
      if (selectedIssue) {
        const updatedSelected = res.data.find(c => c._id === selectedIssue._id);
        setSelectedIssue(updatedSelected || null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle opening the resolve modal
  const handleOpenResolve = (complaint) => {
    setIssueToResolve(complaint);
    setShowResolveModal(true);
  };

  const handleFixImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFixImage(file);
        setFixPreview(URL.createObjectURL(file));
    }
  };

  // Submit the Fix Report to the backend
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!fixImage) return alert("You must upload a photo as proof of the fix.");
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("description", fixDescription);
    formData.append("image", fixImage);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/staff/complaints/${issueToResolve._id}/resolve`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      setShowResolveModal(false);
      setFixDescription("");
      setFixImage(null);
      setFixPreview(null);
      setIssueToResolve(null);
      fetchComplaints();
    } catch (error) {
      alert("Failed to submit fix report");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPinIcon = (status, isSelected = false) => {
      let color = '#f91880'; 
      if (status === 'Resolved') color = '#00ba7c'; 
      if (status === 'In Progress') color = '#1d9bf0'; 
      if (status === 'Assigned') color = '#f59e0b'; 

      const border = isSelected ? '3px solid #ffffff' : '2px solid #000';
      const size = isSelected ? 24 : 16;
      return L.divIcon({
          html: `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: ${border}; transition: all 0.2s;"></div>`,
          className: 'custom-pin',
          iconSize: [size, size]
      });
  };

  return (
    <div className="app-layout">
      <NavBar />

      <main className="feed-column">
        <header className="feed-header">
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <h2 style={{margin: 0}}>{view === 'map' ? 'City Operations Map' : 'Task Queue'}</h2>
            <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>
              {complaints.length} Assigned Tasks
            </span>
          </div>

          <div className="mobile-toggle">
              <button className={view === 'feed' ? 'active' : ''} onClick={() => navigate('/staff')}>Queue</button>
              <button className={view === 'map' ? 'active' : ''} onClick={() => navigate('/map')}>Map</button>
          </div>
        </header>

        <div className="feed-content">
          {view === 'map' ? (
              <div className="expanded-map-container" style={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                  <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                      {complaints.map(item => (
                          <Marker 
                              key={item._id} 
                              position={item.location ? [item.location.lat, item.location.lng] : defaultCenter}
                              icon={getPinIcon(item.status, selectedIssue?._id === item._id)}
                              eventHandlers={{ click: () => setSelectedIssue(item) }}
                          />
                      ))}
                  </MapContainer>
              </div>
          ) : (
              <>
                  {complaints.length === 0 ? (
                    <div className="empty-state">No assigned tasks right now. Great job!</div>
                  ) : (
                    complaints.map((complaint) => (
                      <div key={complaint._id} onClick={() => setSelectedIssue(complaint)} style={{ cursor: 'pointer' }}>
                        <StaffComplaintCard 
                          complaint={complaint} 
                          refresh={fetchComplaints} 
                          onResolveClick={handleOpenResolve} 
                        />
                      </div>
                    ))
                  )}
              </>
          )}
        </div>
      </main>

      <aside className="right-sidebar">
        {selectedIssue ? (
          <div className="selected-issue-container">
            <div className="selected-header">
              <h3>Focus View</h3>
              <button onClick={() => setSelectedIssue(null)} className="close-issue-btn"><X size={18} /></button>
            </div>
            <StaffComplaintCard 
              complaint={selectedIssue} 
              refresh={fetchComplaints} 
              onResolveClick={handleOpenResolve} 
            />
          </div>
        ) : (
          <div className="desktop-map-card">
              <h3>Operations Map</h3>
              <div className="map-wrapper" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', marginTop: '12px', border: '1px solid var(--border-color)' }}>
                  <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                      {complaints.map(item => (
                          <Marker 
                              key={item._id} 
                              position={item.location ? [item.location.lat, item.location.lng] : defaultCenter}
                              icon={getPinIcon(item.status, false)}
                              eventHandlers={{ click: () => setSelectedIssue(item) }}
                          />
                      ))}
                  </MapContainer>
              </div>
          </div>
        )}
      </aside>

      {/* MODAL: SUBMIT FIX REPORT */}
      {showResolveModal && (
        <div className="modal-overlay">
            <div className="compose-modal" style={{maxWidth: '600px', width: '100%'}}>
                <div className="modal-header">
                    <button onClick={() => setShowResolveModal(false)} className="close-btn"><X size={24} /></button>
                    <span className="modal-title" style={{color: '#00ba7c'}}>Resolve Work Order</span>
                </div>
                <form onSubmit={handleResolveSubmit} className="compose-form-wrapper">
                    <div className="compose-body">
                        <div className="compose-input-area" style={{marginLeft: 0}}>
                            <textarea 
                                rows="3" 
                                value={fixDescription} 
                                onChange={(e) => setFixDescription(e.target.value)} 
                                placeholder="Describe the actions taken to fix this issue..." 
                                required 
                            />
                            {fixPreview && (
                                <div className="image-preview-container">
                                    <img src={fixPreview} alt="Proof of fix" className="image-preview" />
                                    <button type="button" onClick={() => {setFixImage(null); setFixPreview(null)}} className="remove-image-btn"><X size={16}/></button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="compose-footer">
                        <div className="compose-actions">
                            <label className="action-icon" title="Upload Proof Photo">
                                <ImageIcon size={20} color="#00ba7c" />
                                <input type="file" accept="image/*" onChange={handleFixImageChange} required={!fixPreview} style={{ display: 'none' }} />
                            </label>
                            <label className="action-icon" title="Take Proof Photo">
                                <Camera size={20} color="#00ba7c" />
                                <input type="file" accept="image/*" capture="environment" onChange={handleFixImageChange} required={!fixPreview} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <button type="submit" className="btn-primary" style={{background: '#00ba7c', color: '#16181c'}} disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading...' : 'Submit Proof'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;