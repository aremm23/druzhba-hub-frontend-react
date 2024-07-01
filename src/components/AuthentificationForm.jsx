// AuthentificationForm.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import SummaryForm from "./SummaryForm";

export default function AuthentificationForm({ onSuccess }) {
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
        onSuccess(receivedToken, id);
    };

    return (
        <div className="w-full flex items-center justify-center lg:w-1/2">
            <div>
                {!isLoggedIn ? (
                    showLogin ? (
                        <LoginForm toggleForm={() => setShowLogin(false)} onSuccess={handleLoginSuccess}/>
                    ) : (
                        <SignUpForm toggleForm={() => setShowLogin(true)} onSuccess={() => setShowLogin(true)}/>
                    )
                ) : (
                    isSelfSummaryEmpty ? (
                        <SummaryForm token={token} userId={userId}/>
                    ) : (
                        <div>Welcome! You are logged in.</div>
                    )
                )}
            </div>

        </div>
    );
}
