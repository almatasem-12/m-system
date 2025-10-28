// 📂 server.js
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// 📁 مجلد رفع الملفات
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// multer لتخزين الملفات
const upload = multer({ dest: uploadsDir });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📂 ملفات Excel
const usersFile = path.join(__dirname, 'users.xlsx');
const projectsFile = path.join(__dirname, 'projects.xlsx');
const sheetName = 'Admins';

/* ============= 📌 دوال مساعدة ============= */

// قراءة المستخدمين
function readUsers() {
    if (!fs.existsSync(usersFile)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(usersFile, wb);
    }
    const wb = XLSX.readFile(usersFile);
    const ws = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(ws);
}

// قراءة المشاريع
function readProjects() {
    if (!fs.existsSync(projectsFile)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        XLSX.writeFile(projectsFile, wb);
    }
    const wb = XLSX.readFile(projectsFile);
    const ws = wb.Sheets['Projects'];
    return XLSX.utils.sheet_to_json(ws).map(project => {
        try {
            return {
                ...project,
                stages: project.stages ? JSON.parse(project.stages) : [],
                projectFiles: project.projectFiles ? JSON.parse(project.projectFiles) : []
            };
        } catch {
            return { ...project, stages: [], projectFiles: [] };
        }
    });
}

// كتابة المشاريع
function writeProjects(projects) {
    const projectsToWrite = projects.map(p => ({
        ...p,
        stages: JSON.stringify(p.stages || []),
        projectFiles: JSON.stringify(p.projectFiles || [])
    }));
    const ws = XLSX.utils.json_to_sheet(projectsToWrite);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(projectsFile, wb);
}

/* ============= 📌 APIs ============= */

// إضافة مشروع جديد مع دعم الملفات لكل خطوة
app.post('/api/addProject', upload.any(), (req, res) => {
    try {
        const {
            name, description, responsible, startDate, endDate, status,
            directory, budget, progressReport, challenges, stages
        } = req.body;

        const projects = readProjects();

        // معالجة الملفات
        const projectFiles = [];
        const stepFilesMap = {}; // { stageIndex_stepIndex_docIndex: file }

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === 'projectFiles') {
                    projectFiles.push({
                        filename: file.filename,
                        originalname: file.originalname,
                        path: `/uploads/${file.filename}`
                    });
                } else if (file.fieldname.startsWith('stepDocuments')) {
                    // تنسيق الاسم: stepDocuments[stageIndex][stepIndex][docIndex]
                    const match = file.fieldname.match(/stepDocuments\[(\d+)\]\[(\d+)\]\[(\d+)\]/);
                    if (match) {
                        const key = `${match[1]}_${match[2]}_${match[3]}`;
                        stepFilesMap[key] = {
                            filename: file.filename,
                            originalname: file.originalname,
                            path: `/uploads/${file.filename}`
                        };
                    }
                }
            });
        }

        // إعادة بناء المراحل مع ربط الملفات لكل خطوة
        let parsedStages = [];
        try {
            parsedStages = stages ? JSON.parse(stages) : [];
            parsedStages = parsedStages.map((stage, stageIndex) => ({
                ...stage,
                steps: stage.steps.map((step, stepIndex) => ({
                    ...step,
                    documents: step.documents.map((doc, docIndex) => {
                        const key = `${stageIndex}_${stepIndex}_${docIndex}`;
                        return stepFilesMap[key] ? stepFilesMap[key] : doc;
                    })
                }))
            }));
        } catch (err) {
            console.error('❌ خطأ في تحليل stages:', err);
        }

        const newProject = {
            id: Date.now(),
            name,
            description,
            responsible,
            startDate,
            endDate,
            status,
            directory,
            budget,
            progressReport,
            challenges,
            stages: parsedStages,
            projectFiles
        };

        projects.push(newProject);
        writeProjects(projects);

        res.json({ message: '✅ تم إضافة المشروع بنجاح', project: newProject });
    } catch (error) {
        console.error('❌ خطأ أثناء إضافة المشروع:', error);
        res.status(500).json({ message: '❌ خطأ في السيرفر' });
    }
});

// إضافة مدير جديد
app.post('/api/users', (req, res) => {
    const { username, password, role } = req.body;
    let workbook, worksheet;

    if (fs.existsSync(usersFile)) {
        workbook = XLSX.readFile(usersFile);
        worksheet = workbook.Sheets[sheetName] || XLSX.utils.json_to_sheet([]);
        if (!workbook.SheetNames.includes(sheetName))
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    const data = XLSX.utils.sheet_to_json(worksheet);
    data.push({ username, password, role });

    workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
    XLSX.writeFile(usersFile, workbook);

    res.json({ message: '✅ تم إضافة المدير بنجاح' });
});

// تسجيل دخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user && user.role === 'admin') res.json({ user });
    else res.status(401).json({ message: '🚫 اسم المستخدم أو كلمة المرور غير صحيحة' });
});

// جلب المشاريع
app.get('/api/projects', (req, res) => res.json(readProjects()));

// جلب مشروع محدد
app.get('/api/projects/:id', (req, res) => {
    const projects = readProjects();
    const project = projects.find(p => String(p.id) === req.params.id);
    if (project) res.json(project);
    else res.status(404).json({ message: '❌ المشروع غير موجود' });
});

// توفير الملفات المرفوعة
app.use('/uploads', express.static(uploadsDir));

// تشغيل السيرفر
app.listen(4000, () => console.log('🚀 الخادم يعمل على http://localhost:4000'));
