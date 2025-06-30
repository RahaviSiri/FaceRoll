import express from 'express';
import { addStudent, markAttendance } from '../controllers/teacherController.js';
import upload from '../middleware/multer.js';

const teacherRouter = express.Router();

teacherRouter.post('/add-student', upload.single('image'), addStudent);
teacherRouter.post('/mark-attendance', upload.single('image') , markAttendance);

export default teacherRouter;