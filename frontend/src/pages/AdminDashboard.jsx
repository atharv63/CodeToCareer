import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // 👇 ADDED THIS
import API from "../services/api";
import AdminComplaintCard from "../components/AdminComplaintCard";
import MunicipalityManager from "../components/MunicipalityManager";
import NavBar from "../components/NavBar";
import { X } from "lucide-react";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Dashboard.css'; 

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

const AdminDashboard = () => {
  const location = useLocation(); // 👇 ADDED THIS
  const navigate = useNavigate(); // 👇 ADDED THIS
  
  // 👇 FIX: Default view checks the URL
  const [view, setView] = useState(location.pathname === '/map' ? 'map' : 'feed'); 
  
  const [complaints, setComplaints] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null); 

  const defaultCenter = [15.4909, 73.8278]; // Goa Center

  // 👇 FIX: Watch the URL and update the view when NavBar is clicked
  useEffect(() => {
    if (location.pathname === '/map') {
      setView('map');
    } else {
      setView('feed');
    }
  }, [location.pathname]);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/admin/complaints");
      setComplaints(res.data);
      if (selectedIssue) {
        const updatedSelected = res.data.find(c => c._id === selectedIssue._id);
        if (!updatedSelected) setSelectedIssue(null); 
        else setSelectedIssue(updatedSelected);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const res = await API.get("/admin/municipalities");
      setMunicipalities(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchMunicipalities();
  }, []);

  const activeComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending" || complaint.status === "Assigned" || complaint.status === "In Progress" || complaint.status === "Resolved"
  );

  const getPinIcon = (status, isSelected = false) => {
      let color = '#f91880'; 
      if (status === 'Resolved') color = '#00ba7c'; 
      if (status === 'In Progress') color = '#1d9bf0'; 
      if (status === 'Assigned') color = '#f59e0b'; 

      const border = isSelected ? '3px solid #ffffff' : '2px solid #000';
      const size = isSelected ? 24 : 16;
      const shadow = isSelected ? `0 0 15px ${color}` : 'none';
      
      return L.divIcon({
          html: `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: ${border}; box-shadow: ${shadow}; transition: all 0.2s;"></div>`,
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
            <h2 style={{margin: 0}}>{view === 'map' ? 'City-Wide Analysis' : 'Admin Control Center'}</h2>
            <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>
              {activeComplaints.length} Active Reports
            </span>
          </div>

          {/* Desktop/Mobile Toggle links */}
          <div className="mobile-toggle">
              <button className={view === 'feed' ? 'active' : ''} onClick={() => navigate('/admin')}>Feed</button>
              <button className={view === 'map' ? 'active' : ''} onClick={() => navigate('/map')}>Map</button>
          </div>
        </header>

        <div className="feed-content">
          {view === 'map' ? (
              <div className="expanded-map-container" style={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                  <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                      {activeComplaints.map(item => (
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
                  {activeComplaints.length === 0 ? (
                    <div className="empty-state">No active complaints found in the city.</div>
                  ) : (
                    activeComplaints.map((complaint) => (
                      <div key={complaint._id} onClick={() => setSelectedIssue(complaint)} style={{ cursor: 'pointer' }}>
                        <AdminComplaintCard complaint={complaint} municipalities={municipalities} refresh={fetchComplaints} />
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
            <AdminComplaintCard complaint={selectedIssue} municipalities={municipalities} refresh={fetchComplaints} />
          </div>
        ) : (
          <>
            <div className="desktop-map-card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Municipality Setup</h3>
              <MunicipalityManager municipalities={municipalities} refresh={fetchMunicipalities} />
            </div>

            {view !== 'map' && (
                <div className="desktop-map-card">
                    <h3>Live City Map</h3>
                    <div className="map-wrapper" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', marginTop: '12px', border: '1px solid var(--border-color)' }}>
                        <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                            {activeComplaints.map(item => (
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
          </>
        )}
      </aside>
    </div>
  );
};

export default AdminDashboard;