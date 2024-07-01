import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProfilePage({ token, userId }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/profiles/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };

        fetchProfile();
    }, [token, userId]);

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Welcome, {profile.username}!</h1>
            <p>Email: {profile.email}</p>
            <p>Self Summary: {profile.selfSummary}</p>
        </div>
    );
}
