import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("authToken") || null);

    // Keep localStorage in sync with token state
    useEffect(() => {
        if (token) {
            navigate('/');
            localStorage.setItem("authToken", token);
        } else {
            navigate('/login');
        }
    }, [token]);

    return (
        <AppContext.Provider value={{ token, setToken }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
