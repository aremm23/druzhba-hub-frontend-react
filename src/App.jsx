import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import ProfileForm from './components/ProfileForm';

function App() {
    const [showLogin, setShowLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState(null);
    const [isSelfSummaryEmpty, setIsSelfSummaryEmpty] = useState(false);

    useEffect(() => {
        if (isLoggedIn && userId) {
            checkSelfSummary();
        }
    }, [isLoggedIn, userId]);

    const checkSelfSummary = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8080/api/profiles/${userId}/summary`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsSelfSummaryEmpty(response.data.selfSummary === "");
        } catch (error) {
            console.error("Failed to fetch self-summary", error);
        }
    };

    const handleLoginSuccess = (receivedToken, id) => {
        setToken(receivedToken);
        setUserId(id);
        setIsLoggedIn(true);
    };

    return (
        <div className="flex w-full h-screen">
            <div className="w-full flex items-center justify-center lg:w-1/2">
                <div>
                    {!isLoggedIn ? (
                        showLogin ? (
                            <LoginForm toggleForm={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
                        ) : (
                            <SignUpForm toggleForm={() => setShowLogin(true)} onSuccess={() => setShowLogin(true)} />
                        )
                    ) : (
                        isSelfSummaryEmpty ? (
                            <ProfileForm token={token} userId={userId} />
                        ) : (
                            <div>Welcome! You are logged in.</div>
                        )
                    )}
                </div>
            </div>
            <div className="hidden relative lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
                <div className="w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-spin"></div>
                <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg"></div>
            </div>
        </div>
    );
}

export default App;
