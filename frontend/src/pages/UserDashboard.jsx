import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ComplaintCard from '../components/ComplaintCard';
import FixReportCard from '../components/FixReportCard';
import MapToggle from '../components/MapToggle';
import { FaPlus, FaTimes, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';

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
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

const AutoCenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);
    return null;
};

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('feed');
    const [feedItems, setFeedItems] = useState([]); // Mixed Complaints & FixReports
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [position, setPosition] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            return alert("Geolocation is not supported by your browser.");
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);
            },
            (err) => {
                console.warn("Geolocation Warning:", err.message);
                // Fallback silently to a default city center if not already set
                if (!position) setPosition({ lat: 28.6139, lng: 77.2090 }); // Default to New Delhi
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Auto-locate when form opens
    useEffect(() => {
        if (showForm && !position) {
            handleLocateMe();
        }
    }, [showForm]);

    const fetchFeed = async () => {
        try {
            const token = localStorage.getItem('token');
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
            alert('Issue reported to the public feed!');
            setShowForm(false);
            setDescription('');
            setImage(null);
            fetchFeed();
        } catch (error) {
            alert('Failed to post report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPinIcon = (status) => {
        const color = status === 'Resolved' ? '#10b981' : '#ef4444';
        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: 'custom-pin',
            iconSize: [18, 18]
        });
    };

    return (
        <div className="feed-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>CivicCenter</h1>
                <button className="btn" onClick={() => setShowForm(true)} style={{ width: 'auto', borderRadius: '999px', padding: '0.6rem 1.4rem' }}>
                   <FaPlus /> Report Issue
                </button>
            </div>

            <MapToggle view={view} setView={setView} />

            {/* Modal for Reporting */}
            {showForm && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                   <div className="card" style={{ width: '100%', maxWidth: '550px', maxHeight: '95vh', overflowY: 'auto', position: 'relative' }}>
                        <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>
                            <FaTimes />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>Report a Problem</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="What's broken? e.g. Open manhole on Sector 4 road..." />
                            </div>
                             <div className="form-group">
                                <label>Photo Proof</label>
                                <div className="image-upload-wrapper" style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange} 
                                        required 
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer', width: '100%' }} 
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                    ) : (
                                        <div style={{ color: '#64748b' }}>
                                            <p style={{ margin: 0, fontWeight: '600' }}>Click to upload photo</p>
                                            <p style={{ fontSize: '0.8rem', margin: 0 }}>PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Pin Location</label>
                                <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                    <MapContainer center={position || [20.5937, 78.9629]} zoom={position ? 16 : 4} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationPicker position={position} setPosition={setPosition} />
                                        <AutoCenter position={position} />
                                    </MapContainer>
                                    <button 
                                        type="button"
                                        onClick={handleLocateMe}
                                        style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000, background: 'white', border: 'none', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Use my current location"
                                    >
                                        <FaLocationArrow />
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: '1rem' }}>
                                {isSubmitting ? 'Posting...' : 'Post to Community Feed'}
                            </button>
                        </form>
                   </div>
                </div>
            )}

            {view === 'feed' ? (
                <div className="main-feed">
                    {feedItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
                            <FaMapMarkerAlt size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No reports in your area yet.</p>
                        </div>
                    ) : (
                        feedItems.map(item => (
                            item.feedItemType === 'fix' ? (
                                <FixReportCard key={item._id} report={item} />
                            ) : (
                                <ComplaintCard 
                                    key={item._id} 
                                    complaint={item} 
                                    onUpdate={handleUpdateItem} 
                                />
                            )
                        ))
                    )}
                </div>
            ) : (
                <div id="map-view">
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {feedItems.filter(i => i.location || (i.relatedComplaintId && i.relatedComplaintId.location)).map(item => (
                            <Marker 
                                key={item._id} 
                                position={item.location ? [item.location.lat, item.location.lng] : [item.relatedComplaintId.location.lat, item.relatedComplaintId.location.lng]}
                                icon={getPinIcon(item.status || 'Resolved')}
                            >
                                <Popup className="custom-popup">
                                    <div style={{ width: '200px' }}>
                                        <img src={item.userImageURL || item.fixImageURL} alt="Issue" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                        <div style={{ padding: '0.5rem' }}>
                                            <p style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '0.9rem' }}>{item.description}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0' }}>Status: {item.status || 'Resolved'}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
