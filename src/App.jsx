import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthentificationForm from "./components/AuthentificationForm";
import ProfilePage from "./components/ProfilePage";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

    const handleLoginSuccess = (receivedToken, id) => {
        setToken(receivedToken);
        setCurrentUserId(id);
        setIsLoggedIn(true);
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
                                <ProfilePage profileId={currentUserId} currentUserId={currentUserId} token={token}/>
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
