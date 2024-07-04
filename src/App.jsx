import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthentificationForm from "./components/AuthentificationForm";
import ProfilePage from "./components/ProfilePage";
import {EditProfilePage} from "./components/EditProfilePage.jsx";
import {SearchPage} from "./components/SearchPage.jsx";
import {HomePage} from "./components/FeedPage.jsx";
import {MyLikes} from "./components/MyLikes.jsx";


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('userId');
        if (savedToken && savedUserId) {
            setToken(savedToken);
            setCurrentUserId(savedUserId);
            setIsLoggedIn(true);
        }
    }, []);

    const handleLoginSuccess = (receivedToken, id) => {
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('userId', id);
        setToken(receivedToken);
        setCurrentUserId(id);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken('');
        setCurrentUserId(null);
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <div className="flex w-full h-full items-center content-center justify-center">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isLoggedIn ? (
                                <Navigate to={`/profile/${currentUserId}`}/>
                            ) : (
                                <AuthentificationForm onSuccess={handleLoginSuccess}/>
                            )
                        }
                    />
                    <Route
                        path="/profile/:profileId"
                        element={
                            isLoggedIn ? (
                                <ProfilePage
                                    profileId={currentUserId}
                                    currentUserId={currentUserId}
                                    token={token}
                                    onLogout={handleLogout}
                                />
                            ) : (
                                <Navigate to="/login"/>
                            )
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            isLoggedIn ? (
                                <HomePage />
                            ) : (
                                <Navigate to="/login"/>
                            )
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            isLoggedIn ? (
                                <SearchPage />
                            ) : (
                                <Navigate to="/login"/>
                            )
                        }
                    />
                    <Route
                        path="/edit-profile"
                        element={
                            isLoggedIn ? (
                                <EditProfilePage />
                            ) : (
                                <Navigate to="/login"/>
                            )
                        }
                    />
                    <Route
                        path="/my-profile"
                        element={
                            isLoggedIn ? (
                                <ProfilePage
                                    profileId={currentUserId}
                                    currentUserId={currentUserId}
                                    token={token}
                                    onLogout={handleLogout}
                                />
                            ) : (
                                <Navigate to="/login"/>
                            )
                        }
                    />
                    <Route
                        path="/my-likes"
                        element={
                            isLoggedIn ? (
                                <MyLikes/>
                            ) : (
                                <Navigate to="/login"/>
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to="/login"/>}
                    />
                    <Route
                        path="*"
                        element={<h1>404 Not Found</h1>}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
