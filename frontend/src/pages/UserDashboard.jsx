import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in React Leaflet
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

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [position, setPosition] = useState(null); // {lat, lng}
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComplaints();
        // Try getting current location on load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log(err)
            );
        }
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/complaints/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) return alert('Please select a location on the map');
        if (!image) return alert('Please upload a photo of the issue');

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
            alert('Complaint submitted successfully!');
            setShowForm(false);
            setDescription('');
            setImage(null);
            fetchComplaints(); // Refresh list
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit complaint');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusClass = (status) => {
        const s = status.toLowerCase().replace(' ', '');
        return `status-badge status-${s}`;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Your Civic Dashboard</h2>
                <button className="btn" style={{ width: 'auto' }} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Complaint'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <h3>Report an Issue</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                        
                        <div className="form-group">
                            <label>Description of Issue</label>
                            <textarea 
                                rows="3" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required 
                                placeholder="E.g., Pothole on main street causing traffic delays..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Upload Photo Proof</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setImage(e.target.files[0])} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label>Pin Location on Map</label>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Click on the map to drop a pin where the issue is located.
                            </p>
                            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                                <MapContainer 
                                    center={position || [20.5937, 78.9629]} // Default to India approx if none
                                    zoom={position ? 15 : 4} 
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                                    />
                                    <LocationPicker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                        </div>

                        <button type="submit" className="btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading...' : 'Submit Complaint'}
                        </button>
                    </form>
                </div>
            )}

            {/* Complaints Feed */}
            <div>
                <h3>My Previous Reports</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {complaints.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>You haven't reported any issues yet.</p>
                    ) : (
                        complaints.map(comp => (
                            <div key={comp._id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                {/* Thumbnail */}
                                <img 
                                    src={comp.userImageURL} 
                                    alt="Complaint" 
                                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} 
                                />
                                
                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <p style={{ fontWeight: 500, margin: 0 }}>{comp.description}</p>
                                        <span className={getStatusClass(comp.status)}>{comp.status}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Reported on: {new Date(comp.createdAt).toLocaleDateString()}
                                    </p>
                                    
                                    {comp.proofImages && comp.proofImages.length > 0 && (
                                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px' }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary)' }}>
                                                ✓ Issue Resolved
                                            </p>
                                            <p style={{ fontSize: '0.875rem' }}>Before/After views will be available in Details (Hackathon Slider feature coming soon!)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
