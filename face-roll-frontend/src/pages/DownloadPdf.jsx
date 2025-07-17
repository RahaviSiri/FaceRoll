import React, { useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/appContext.jsx";

const DownloadAttendance = () => {
    const [date, setDate] = useState("");
    const navigate = useNavigate();
    const { token } = useContext(AppContext);

    const handleDownload = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/teacher/get-class-name`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                const className = data.className;

                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/teacher/download-attendance?className=${className}&date=${date}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        responseType: 'blob', 
                        // Ensures Axios interprets response as a binary file (not JSON or text)
                    }
                );

                // Create a blob link to download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                // response.data is the binary content of the .csv file.
                // new Blob([response.data]) creates a Blob object representing that file.
                // URL.createObjectURL() creates a temporary URL pointing to this Blob in the browser’s memory.
                const link = document.createElement("a");
                // Creates a temporary <a> (<a href="...">) element pointing to the generated blob URL.
                // download="..." tells the browser that this link should trigger a file download, not navigation.
                // Appends it to the document, clicks it programmatically, and then removes it.
                link.href = url;
                link.setAttribute("download", `attendance_${className}_${date}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error) {
            console.error("Download failed:", error);
            alert("Download failed.");
        }
    };


    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl p-6 z-50"
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Download Attendance
                </h2>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />
                <div className="flex justify-between">
                    <button
                        onClick={handleDownload}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        Download
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-red-500 hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>

            {/* Optional dim background */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => navigate(-1)}
            />
        </AnimatePresence>
    );
};

export default DownloadAttendance;
