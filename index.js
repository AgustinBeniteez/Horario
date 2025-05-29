const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Almacenamiento en memoria (en una aplicación real se usaría una base de datos)
let calendars = [];
let schedules = [];
let tasks = [];
let exams = [];
let classes = [];

// API para calendarios
app.get('/api/calendars', (req, res) => {
    res.json(calendars);
});

app.post('/api/calendars', (req, res) => {
    const newCalendar = {
        id: Date.now(),
        name: req.body.name,
        type: req.body.type,
        events: []
    };
    calendars.push(newCalendar);
    res.status(201).json(newCalendar);
});

// API para horarios
app.get('/api/schedules', (req, res) => {
    res.json(schedules);
});

app.post('/api/schedules', (req, res) => {
    const newSchedule = {
        id: Date.now(),
        name: req.body.name,
        hoursCount: req.body.hoursCount,
        startTime: req.body.startTime,
        timeSlots: []
    };
    schedules.push(newSchedule);
    res.status(201).json(newSchedule);
});

// API para tareas
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const newTask = {
        id: Date.now(),
        name: req.body.name,
        subject: req.body.subject,
        dueDate: req.body.dueDate,
        priority: req.body.priority,
        completed: false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).json({ error: 'Tarea no encontrada' });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    tasks = tasks.filter(task => task.id !== taskId);
    res.status(204).send();
});

// API para exámenes
app.get('/api/exams', (req, res) => {
    res.json(exams);
});

app.post('/api/exams', (req, res) => {
    const newExam = {
        id: Date.now(),
        name: req.body.name,
        subject: req.body.subject,
        date: req.body.date,
        time: req.body.time
    };
    exams.push(newExam);
    res.status(201).json(newExam);
});

app.delete('/api/exams/:id', (req, res) => {
    const examId = parseInt(req.params.id);
    exams = exams.filter(exam => exam.id !== examId);
    res.status(204).send();
});

// API para clases
app.get('/api/classes', (req, res) => {
    res.json(classes);
});

app.post('/api/classes', (req, res) => {
    const newClass = {
        id: Date.now(),
        name: req.body.name,
        teacher: req.body.teacher,
        color: req.body.color
    };
    classes.push(newClass);
    res.status(201).json(newClass);
});

app.delete('/api/classes/:id', (req, res) => {
    const classId = parseInt(req.params.id);
    classes = classes.filter(cls => cls.id !== classId);
    res.status(204).send();
});

// Ruta principal - Servir el archivo HTML estático
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor del organizador académico iniciado en http://localhost:${port}`);
});