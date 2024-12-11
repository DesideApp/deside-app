import React, { useState } from 'react';
import axios from 'axios';

const AddContactForm = () => {
    const [pubkey, setPubkey] = useState('');

    const addContact = () => {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/contacts/add`, { pubkey })
            .then(() => {
                alert('Contact request sent!');
                setPubkey('');
            })
            .catch((error) => console.error('Error sending contact request:', error));
    };

    return (
        <div>
            <h2>Add a Contact</h2>
            <input
                type="text"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                placeholder="Enter public key"
            />
            <button onClick={addContact}>Send Request</button>
        </div>
    );
};

export default AddContactForm;
