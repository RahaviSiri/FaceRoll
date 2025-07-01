import { v2 as cloudinary } from "cloudinary";
import fetch from "node-fetch";
import FormData from "form-data";
import pool from "../config/db.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function saveStudent(name, className, imageUrl, encoding) {
    // Convert encoding array (floats) to Buffer for BYTEA column in Postgres
    const encodingBuffer = Buffer.from(new Float64Array(encoding).buffer);

    // Assuming you have a classes table, get class_id by className or create if needed (simplified here)
    const classResult = await pool.query(
        "SELECT id FROM classes WHERE class_name = $1 LIMIT 1",
        [className]
    );
    let classId;
    if (classResult.rows.length === 0) {
        // Checks if the class exists in the classes table.
        const insertClass = await pool.query(
            "INSERT INTO classes (class_name) VALUES ($1) RETURNING id",
            [className]
        ); // If not, it inserts the class and gets the new class_id.
        classId = insertClass.rows[0].id;
    } else {
        classId = classResult.rows[0].id;
    }

    const result = await pool.query(
        `INSERT INTO students (name, class_id, image_path, face_encoding)
     VALUES ($1, $2, $3, $4) RETURNING id`,
        [name, classId, imageUrl, encodingBuffer]
    );
    return result.rows[0].id;
}

const addStudent = async (req, res) => {
    try {
        const { name, className } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        // Prepare form-data to send to Flask API for encoding
        const formData = new FormData();
        formData.append("image", image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
        });

        // Send to Flask face recognition service
        const flaskResponse = await fetch("http://localhost:6001/encode", {
            method: "POST",
            body: formData,
            headers: formData.getHeaders(),
        });

        const text = await flaskResponse.text(); // get raw response text
        console.log("Flask response text:", text);

        const data = JSON.parse(text);

        if (!flaskResponse.ok) {
            return res
                .status(flaskResponse.status)
                .json({ message: data.error || "Failed to get encoding" });
        }

        const encoding = data.encoding;

        // Upload image to Cloudinary using upload_stream (buffer upload)
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ message: "Cloudinary upload failed" });
                }

                try {
                    // Save student to DB
                    const studentId = await saveStudent(
                        name,
                        className,
                        result.secure_url,
                        encoding
                    );
                    return res.json({ message: "Student added successfully", studentId });
                } catch (dbError) {
                    console.error("Database error:", dbError);
                    return res
                        .status(500)
                        .json({ message: "Failed to save student in database" });
                }
            }
        );

        uploadStream.end(image.buffer);
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { className } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ message: "No class image uploaded" });
        }

        // Prepare form-data for Flask
        const formData = new FormData();
        formData.append("image", image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
        });
        formData.append("className", className);

        const flaskResponse = await fetch("http://localhost:6001/decode", {
            method: "POST",
            body: formData,
            headers: formData.getHeaders(),
        });

        // Log the raw text to debug
        const rawText = await flaskResponse.text();
        console.log("Flask response text:", rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (err) {
            console.error("Flask did not return JSON:", err.message);
            return res
                .status(500)
                .json({ message: "Flask returned invalid response", raw: rawText });
        }

        if (!flaskResponse.ok) {
            return res
                .status(flaskResponse.status)
                .json({ message: data.error || "Failed to decode image" });
        }

        const presentIds = data.present_ids;
        const today = new Date().toISOString().split("T")[0];
        // Extracts date like "2025-06-30".

        // Get all student IDs for the class
        const classResult = await pool.query(
            "SELECT id FROM classes WHERE class_name = $1",
            [className]
        );
        if (classResult.rows.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }
        const classId = classResult.rows[0].id;

        const studentsResult = await pool.query(
            "SELECT id FROM students WHERE class_id = $1",
            [classId]
        );
        const allStudentIds = studentsResult.rows.map((s) => s.id);

        // Insert attendance
        for (const studentId of allStudentIds) {
            const status = presentIds.includes(studentId) ? "Present" : "Absent";

            await pool.query(
                `
                INSERT INTO attendance_records (student_id, class_id , date, status)
                VALUES ($1, $2 , $3, $4)
                ON CONFLICT (student_id, date) DO NOTHING
            `,
                [studentId, classId, today, status]
            );
        }
        // ON CONFLICT (student_id, date) DO NOTHING: prevents duplicate entries for the same day.

        return res.json({ message: "Attendance marked", present: presentIds });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getClassName = async (req, res) => {
    try {
        const { userName } = req.user;

        const result = await pool.query(
            "SELECT class_name FROM teachers WHERE username = $1",
            [userName]
        );

        const className = result.rows[0]?.class_name;
        if (!className) {
            return res.status(404).json({ message: "No class assigned" });
        }

        return res.json({ className });
    } catch (error) {
        console.error("Error fetching class name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getStudentAttendance = async (req, res) => {
    try {
        const { className } = req.body;

        if (!className) {
            return res.status(400).json({ message: "Class name is required" });
        }

        const classResult = await pool.query(
            "SELECT id FROM classes WHERE class_name = $1",
            [className]
        );

        if (classResult.rows.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }

        const classId = classResult.rows[0].id;

        const result = await pool.query(
            `
            SELECT 
                s.name AS student_name,
                ar.date,
                ar.status
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.id
            WHERE ar.class_id = $1
            ORDER BY ar.date ASC, s.name ASC
            `,
            [classId]
        );

        const records = result.rows;
        const grouped = {};
        for (const row of records) {
            const { date, student_name, status } = row;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push({ student_name, status });
        }

        return res.json({ className, attendance: grouped });

    } catch (error) {
        console.error("Error fetching student attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Signup (Register a new teacher)
const signUpTeacher = async (req, res) => {
    const { userName, password, className } = req.body;

    try {
        // Check if username already exists
        const existingUser = await pool.query(
            "SELECT * FROM teachers WHERE username = $1",
            [userName]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new teacher
        await pool.query(
            "INSERT INTO teachers (username, password, class_name) VALUES ($1, $2, $3)",
            [userName, hashedPassword, className]
        );

        // Generate JWT
        const token = jwt.sign({ userName }, process.env.SECRET_KEY, { expiresIn: '1h' });

        return res.status(201).json({ message: "Teacher registered successfully", token });
    } catch (error) {
        console.error("Error signing up teacher:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Login
const loginTeacher = async (req, res) => {
    const { userName, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM teachers WHERE username = $1",
            [userName]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const teacher = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign({ userName }, process.env.SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error logging in teacher:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { addStudent, markAttendance, getStudentAttendance, loginTeacher, signUpTeacher, getClassName };
