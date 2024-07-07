import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthentificationForm from './components/AuthentificationForm.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import EditProfilePage from './components/EditProfilePage.jsx';
import SearchPage from './components/SearchPage.jsx';
import HomePage from './components/FeedPage.jsx';
import MyLikes from './components/MyLikes.jsx';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('currentUserId') || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (currentUserId) {
            localStorage.setItem('currentUserId', currentUserId);
        } else {
            localStorage.removeItem('currentUserId');
        }
    }, [currentUserId]);

    const handleLoginSuccess = (receivedToken, id) => {
        setToken(receivedToken);
        setCurrentUserId(id);
    };

    const handleLogout = () => {
        setToken('');
        setCurrentUserId(null);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<AuthentificationForm onSuccess={handleLoginSuccess} />}
                />
                <Route
                    path="/profile/:profileId"
                    element={token ? (
                        <ProfilePage
                            currentUserId={currentUserId}
                            token={token}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <Navigate to="/" replace />
                    )}
                />
                <Route
                    path="/edit-profile"
                    element={token ? (
                        <EditProfilePage token={token} currentUserId={currentUserId} />
                    ) : (
                        <Navigate to="/" replace />
                    )}
                />
                <Route
                    path="/search"
                    element={token ? (
                        <SearchPage token={token} currentUserId={currentUserId} />
                    ) : (
                        <Navigate to="/" replace />
                    )}
                />
                <Route
                    path="/home"
                    element={token ? (
                        <HomePage token={token} currentUserId={currentUserId} />
                    ) : (
                        <Navigate to="/" replace />
                    )}
                />
                <Route
                    path="/my-likes"
                    element={token ? (
                        <MyLikes token={token} currentUserId={currentUserId} />
                    ) : (
                        <Navigate to="/" replace />
                    )}
                />
            </Routes>
        </Router>
    );
}

export default App;
