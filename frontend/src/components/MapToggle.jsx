import React from 'react';
import { FaList, FaMapMarkedAlt } from 'react-icons/fa';

const MapToggle = ({ view, setView }) => {
    return (
        <div className="view-toggle">
            <button 
                className={`toggle-btn ${view === 'feed' ? 'active' : ''}`}
                onClick={() => setView('feed')}
            >
                <FaList style={{ marginRight: '8px' }} /> Feed
            </button>
            <button 
                className={`toggle-btn ${view === 'map' ? 'active' : ''}`}
                onClick={() => setView('map')}
            >
                <FaMapMarkedAlt style={{ marginRight: '8px' }} /> Map View
            </button>
        </div>
    );
};

export default MapToggle;
