// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthentificationForm from "./components/AuthentificationForm";
import ProfilePage from "./components/ProfilePage";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState(null);

    const handleLoginSuccess = (receivedToken, id) => {
        setToken(receivedToken);
        setUserId(id);
        setIsLoggedIn(true);
    };

    return (
        <Router>
            <div className="flex w-full h-screen">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isLoggedIn ? (
                                <Navigate to="/profile"/>
                            ) : (
                                <AuthentificationForm onSuccess={handleLoginSuccess}/>
                            )
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            isLoggedIn ? (
                                <ProfilePage userId={userId} token={token}/>
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
                <div className="hidden relative lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
                    <div
                        className="w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-spin"></div>
                    <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg"></div>
                </div>
            </div>

        </Router>
    );
}

export default App;
