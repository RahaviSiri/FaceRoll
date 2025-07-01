import express from 'express';
import {
  addStudent,
  getClassName,
  getStudentAttendance,
  loginTeacher,
  markAttendance,
  signUpTeacher
} from '../controllers/teacherController.js';

import upload from '../middleware/multer.js';
import authTeacher from '../middleware/authTeacher.js';

const teacherRouter = express.Router();

teacherRouter.post('/add-student', upload.single('image'), addStudent);
teacherRouter.post('/mark-attendance', upload.single('image'), markAttendance);
teacherRouter.get('/get-class-name', authTeacher, getClassName);
teacherRouter.post('/get-student-attendance', getStudentAttendance);
teacherRouter.post('/sign-up', signUpTeacher);
teacherRouter.post('/login', loginTeacher);

export default teacherRouter;
