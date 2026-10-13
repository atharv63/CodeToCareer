import React, { useState } from 'react';
import API from '../services/api';

const MunicipalityManager = ({ municipalities, refresh }) => {
    const [name, setName] = useState('');
    const [city, setCity] = useState(''); // Or you can pass cityId if your backend expects an ID

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/municipalities', { name, city });
            setName('');
            setCity('');
            refresh();
        } catch (error) {
            console.error('Failed to add municipality', error);
            alert('Failed to add municipality');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                    type="text" 
                    placeholder="Municipality Name (e.g., Panaji Municipal)" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="search-input"
                    style={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent' }}
                    required 
                />
                <input 
                    type="text" 
                    placeholder="City (e.g., Goa)" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    className="search-input"
                    style={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent' }}
                    required 
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
                    Add Municipality
                </button>
            </form>

            {/* Optional: A tiny list to show what's already added */}
            <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currently Active: {municipalities.length}</span>
            </div>
        </div>
    );
};

export default MunicipalityManager;