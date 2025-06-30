import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectCloudinary from './config/cloudinary.js';
import teacherRouter from './routes/teacherRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;
connectCloudinary();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.json({ message: 'Welcome to the Face Roll Backend API!' });
})
app.use('/api/teacher', teacherRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});