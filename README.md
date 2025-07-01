# Project Title
# 📸 FaceRoll — Face Recognition Attendance System

A full-stack web application for teachers to **mark attendance** using facial recognition and manage student records by class. Built using **Node.js**, **React**, **PostgreSQL**, **Flask**, and **Cloudinary**.

---

## ✨ Features

- 🧑‍🏫 Teacher registration & login (JWT-secured)
- 📚 Class-wise student management
- 📷 Upload student images to store face encodings
- 🧠 Facial recognition via Flask + dlib
- ✅ Automatic attendance marking from class photo
- 📊 Attendance history displayed in table format
- ☁️ Image storage using Cloudinary
- 🔐 Protected routes and token-based authentication

---

## 🛠️ Tech Stack

| Layer      | Tech                                    |
|------------|-----------------------------------------|
| Frontend   | React, Tailwind CSS, Axios, React Router |
| Backend    | Node.js, Express, Multer, Bcrypt, JWT   |
| ML API     | Flask, face_recognition (dlib)          |
| Database   | PostgreSQL                              |
| Storage    | Cloudinary                              |

---

## 📁 Project Structure

FaceRoll/
├── backend/ # Node.js + Express backend
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ ├── config/
│ └── app.js
├── flask-api/ # Flask server for face encoding/decoding
│ └── app.py
├── frontend/ # React frontend
│ ├── pages/
│ ├── components/
│ └── App.jsx
└── README.md

Create .env file:

PORT=3000
PGHOST=localhost
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=face_roll
SECRET_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

frontend set up : npm create vite@latest frontend
cd frontend
npm install
npm run dev

backend set up : cd backend
npm init -y
npm install express pg bcrypt jsonwebtoken multer dotenv cors cloudinary nodemon
npm run dev  # make sure nodemon is installed

flask set up : cd flask-api
pip install face_recognition flask flask-cors
python app.py

📸 How It Works
Add Student → Upload student photo → Flask returns face encoding → Save in DB.
Mark Attendance → Upload class photo → Flask matches faces → Returns present student IDs → Attendance saved.
View Attendance → Class-wise table of all students and their status per day.

🗃️ PostgreSQL Schema

CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  class_name TEXT NOT NULL
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  class_name TEXT UNIQUE NOT NULL
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  class_id INTEGER REFERENCES classes(id),
  image_path TEXT,
  face_encoding BYTEA
);

CREATE TABLE attendance_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  class_id INTEGER REFERENCES classes(id),
  date DATE,
  status TEXT,
  UNIQUE(student_id, date)
);

