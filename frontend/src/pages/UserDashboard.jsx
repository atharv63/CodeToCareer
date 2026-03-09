import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ComplaintCard from '../components/ComplaintCard';
import FixReportCard from '../components/FixReportCard';
import NavBar from '../components/NavBar';
import { X, MapPin, Image as ImageIcon, Send } from 'lucide-react';
import '../styles/Dashboard.css';

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

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) { setPosition(e.latlng); },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

const AutoCenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 16);
    }, [position, map]);
    return null;
};

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('feed'); // For mobile toggle
    const [feedItems, setFeedItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [position, setPosition] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pune Coordinates Default
    const defaultCenter = [18.5204, 73.8567];

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleLocateMe = (e) => {
        e.preventDefault();
        if (!navigator.geolocation) return alert("Geolocation not supported.");
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => {
                console.warn(err.message);
                if (!position) setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
    };

    useEffect(() => {
        if (showForm && !position) handleLocateMe(new Event('click'));
    }, [showForm]);

    const fetchFeed = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using a dummy res for now if your backend isn't up, otherwise keep your axios call
            const res = await axios.get('http://localhost:5000/api/feed', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedItems(res.data);
        } catch (error) {
            console.error('Error fetching feed:', error);
        }
    };

    const handleUpdateItem = (id, updates) => {
        setFeedItems(prev => prev.map(item => item._id === id ? { ...item, ...updates } : item));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) return alert('Please pin the location on the map');
        
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('description', description);
        formData.append('image', image);
        formData.append('lat', position.lat);
        formData.append('lng', position.lng);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/complaints', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowForm(false);
            setDescription('');
            setImage(null);
            setPreview(null);
            fetchFeed();
        } catch (error) {
            alert('Failed to post report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPinIcon = (status) => {
        const color = status === 'Resolved' ? '#00ba7c' : '#f4212e';
        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #000;"></div>`,
            className: 'custom-pin',
            iconSize: [16, 16]
        });
    };

    return (
        <div className="app-layout">
            {/* Column 1: Left Sidebar */}
            <NavBar onOpenReportModal={() => setShowForm(true)} />

            {/* Column 2: Center Feed */}
            <main className="feed-column">
                <header className="feed-header">
                    <h2>For You</h2>
                    {/* Mobile Only View Toggle */}
                    <div className="mobile-toggle">
                        <button className={view === 'feed' ? 'active' : ''} onClick={() => setView('feed')}>Feed</button>
                        <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>Map</button>
                    </div>
                </header>

                <div className="feed-content">
                    {/* Render Map on Mobile if toggled, otherwise Feed */}
                    {view === 'map' ? (
                        <div className="mobile-map-container">
                            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                {feedItems.map(item => (
                                    <Marker 
                                        key={item._id} 
                                        position={item.location ? [item.location.lat, item.location.lng] : defaultCenter}
                                        icon={getPinIcon(item.status)}
                                    />
                                ))}
                            </MapContainer>
                        </div>
                    ) : (
                        <>
                            {feedItems.length === 0 ? (
                                <div className="empty-state">
                                    <MapPin size={48} strokeWidth={1} />
                                    <p>No civic reports in your area yet.</p>
                                </div>
                            ) : (
                                feedItems.map(item => (
                                    item.feedItemType === 'fix' ? 
                                    <FixReportCard key={item._id} report={item} /> : 
                                    <ComplaintCard key={item._id} complaint={item} onUpdate={handleUpdateItem} />
                                ))
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Column 3: Right Sidebar (Desktop Only Map) */}
            <aside className="right-sidebar">
                <div className="search-bar-container">
                    <input type="text" placeholder="Search areas, issues..." className="search-input" />
                </div>
                <div className="desktop-map-card">
                    <h3>Live City Map</h3>
                    <div className="map-wrapper">
                        {/* Notice we use a dark theme map tile layer here for the UI */}
                        <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            {feedItems.map(item => (
                                <Marker 
                                    key={item._id} 
                                    position={item.location ? [item.location.lat, item.location.lng] : defaultCenter}
                                    icon={getPinIcon(item.status)}
                                />
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </aside>

            {/* Report Issue Modal (X Compose Style) */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="compose-modal">
                        <div className="modal-header">
                            <button onClick={() => setShowForm(false)} className="close-btn"><X size={24} /></button>
                            <span className="modal-title">Draft Report</span>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="compose-form">
                            <div className="compose-body">
                                <div className="compose-avatar">{user?.name?.charAt(0) || 'U'}</div>
                                <div className="compose-input-area">
                                    <textarea 
                                        rows="4" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        placeholder="What's broken? Add details..." 
                                        required 
                                    />
                                    
                                    {preview && (
                                        <div className="image-preview-container">
                                            <img src={preview} alt="Proof" className="image-preview" />
                                            <button type="button" onClick={() => {setImage(null); setPreview(null)}} className="remove-image-btn"><X size={16}/></button>
                                        </div>
                                    )}

                                    {/* Mini Map for pinning location */}
                                    <div className="mini-map-picker">
                                        <div className="map-picker-header">
                                            <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Pin exact location</span>
                                            <button type="button" onClick={handleLocateMe} className="locate-me-btn">Use GPS</button>
                                        </div>
                                        <div className="mini-map-wrapper">
                                            <MapContainer center={position || defaultCenter} zoom={position ? 16 : 12} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                                <LocationPicker position={position} setPosition={setPosition} />
                                                <AutoCenter position={position} />
                                            </MapContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="compose-footer">
                                <div className="compose-actions">
                                    <label className="action-icon" title="Add Photo">
                                        <ImageIcon size={20} color="var(--primary-accent)" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} required={!preview} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Posting...' : 'Post Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;