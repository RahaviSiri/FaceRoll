import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentAttendance = () => {
    const [attendanceData, setAttendanceData] = useState({});
    const [students, setStudents] = useState([]);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const token = localStorage.getItem("authToken");
                console.log(token);
                const { data } = await axios.get('http://localhost:3000/api/teacher/get-class-name', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const attendanceResponse = await axios.post('http://localhost:3000/api/teacher/get-student-attendance', {
                    className: data.className
                });
                const attendanceData = attendanceResponse.data;

                const groupedByStudent = {};
                const uniqueDates = new Set();

                // Transform from date ➝ student ➝ status
                for (const date in attendanceData.attendance) {
                    attendanceData.attendance[date].forEach(record => {
                        uniqueDates.add(date);
                        const name = record.student_name;
                        if (!groupedByStudent[name]) groupedByStudent[name] = {};
                        groupedByStudent[name][date] = record.status;
                    });
                }

                setAttendanceData(groupedByStudent);
                setStudents(Object.keys(groupedByStudent));
                setDates(Array.from(uniqueDates).sort());
                setLoading(false);

            } catch (err) {
                console.error("Failed to fetch attendance:", err);
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    if (loading) return <div className="text-center mt-8 text-gray-500">Loading attendance...</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Student Attendance Table</h2>

            <div className="overflow-auto">
                <table className="min-w-full border border-gray-300 bg-white shadow rounded-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Student</th>
                            {dates.map(date => {
                                const formattedDate = new Date(date).toLocaleDateString("en-IN", {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                });
                                return (
                                    <th key={date} className="border p-2 text-center">{formattedDate}</th>
                                );
                            })}

                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student}>
                                <td className="border p-2 font-medium">{student}</td>
                                {dates.map(date => (
                                    <td key={date} className="border p-2 text-center">
                                        {attendanceData[student][date] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentAttendance;
