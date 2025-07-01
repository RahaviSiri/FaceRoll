import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [className, setClassName] = useState(""); // used only in sign up
    const [isLogin, setIsLogin] = useState(true); // toggle login/signup
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = isLogin
                ? { userName, password }
                : { userName, password, className };

            const url = isLogin
                ? "http://localhost:3000/api/teacher/login"
                : "http://localhost:3000/api/teacher/sign-up";

            const { data } = await axios.post(url, payload);
            localStorage.setItem("authToken", data.token);
            setToken(data.token);
            navigate('/');
            setMessage(data.message || "Success!");
            setMessageType("success");
            setUserName("");
            setPassword("");
            setClassName("");
            // Clear message after 3 seconds
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Error:", err);
            setMessage(err.response?.data?.message || "Something went wrong.");
            setMessageType("error");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6"
            >
                <h2 className="text-2xl font-bold text-center">
                    {isLogin ? "Login as Teacher" : "Register as Teacher"}
                </h2>

                {message && (
                    <div
                        className={`text-center py-2 px-4 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        {message}
                    </div>
                )}

                <div>
                    <label className="block text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2"
                        required
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-gray-700 mb-1">Class Name</label>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            required={!isLogin}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-black/80 transition"
                >
                    {isLogin ? "Login" : "Sign Up"}
                </button>

                <div className="text-sm text-center">
                    {isLogin ? (
                        <p>
                            Don't have an account?{" "}
                            <button
                                type="button"
                                className="text-blue-600 hover:underline"
                                onClick={() => setIsLogin(false)}
                            >
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="text-blue-600 hover:underline"
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;
