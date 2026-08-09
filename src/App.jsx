import React, { useState, useEffect, useMemo } from 'react';
import { 
    LayoutDashboard, 
    ClipboardCheck, 
    BookOpenCheck, 
    LogOut, 
    Menu, 
    X,
    User,
    Lock,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    BarChart3,
    Settings,
    Key,
    Mail,
    Shield,
    MessageSquare,
    Send,
    Printer,
    FileText,
    Download,
    Trash2,
    Edit
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    createUserWithEmailAndPassword,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCHzSW20czXFivNwjU0-0yIQUOENB3K1CY",
  authDomain: "hdh-atoll-school-supervision.firebaseapp.com",
  projectId: "hdh-atoll-school-supervision",
  storageBucket: "hdh-atoll-school-supervision.firebasestorage.app",
  messagingSenderId: "899033326436",
  appId: "1:899033326436:web:476c6c15dfa38461969071",
  measurementId: "G-5GTEF6RYYV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzQ1V7NnL1iNf16J0wX7mH29J0wX7mH29J0wX7mH29J0wX7mH29J0wX7mH29J0wX7mH29/exec";

const STAFF_LIST = [
    { name: 'Abdul Ganee Ali', email: 'abdulganee@hdhatollschool.edu.mv', designation: 'Principal' },
    { name: 'Ibrahim Ashraf', email: 'iashraf@hdhatollschool.edu.mv', designation: 'Leading Teacher' },
    { name: 'Adam Nazim', email: 'nazim@hdhatollschool.edu.mv', designation: 'Leading Teacher' },
    { name: 'Raju Chellappan', email: 'raju@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Daison Raj Kanagaraj Mary', email: 'daison@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Sheeja Anand Kumar', email: 'sheeja@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Shereena Thattaplackal Ebrahim', email: 'shereena@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Patturajan Joseph', email: 'patturajan@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Joseph Rajan Xavier Sahaya Rajan', email: 'joseph@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Moosa Faheem', email: 'moosafaheem@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Mohamed Raamiz', email: 'ramiz@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Ali Fazil', email: 'fazil@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Hassan Zabeer', email: 'zabeer@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Aishath Sizulee', email: 'sizulee@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Fathimath Siyama', email: 'siyama@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Mohamed Vishah', email: 'vishah@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Fathmath Liva', email: 'liva@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Aminath Samilaa', email: 'saamila@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Nashwa Zareer', email: 'nashwa@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Ahmed Naseem', email: 'naseem@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Aishath Suma', email: 'suma@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Aminath Hanaau', email: 'hanaau@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Divya Thomas', email: 'divya@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Ahmed Arusham', email: 'arusham@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Lucia Jude Peeris', email: 'lucia@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Fathimath Muzuna', email: 'muzuna@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Hidhaya Ahmed', email: 'hidhaya@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Aminath Shiuna', email: 'shiuna@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Hamdhaa Ahmed', email: 'hamdha@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Amalkrishnan Radhakrishna Pillai', email: 'amal@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Madasamy Arumugam', email: 'madasamy@hdhatollschool.edu.mv', designation: 'Teacher' },
    { name: 'Fathimath Zuha', email: 'zuha@hdhatollschool.edu.mv', designation: 'Contract teacher' },
    { name: 'Fathmath Shazuna', email: 'shazna@hdhatollschool.edu.mv', designation: 'Contract teacher' }
];

const OBSERVER_EMAILS = [
    'abdulganee@hdhatollschool.edu.mv',
    'iashraf@hdhatollschool.edu.mv',
    'nazim@hdhatollschool.edu.mv',
    'arusham@hdhatollschool.edu.mv',
    'fazil@hdhatollschool.edu.mv'
];

let LOCAL_MEMORY_DB = {
    lesson_observations: [],
    book_checkings: []
};

const LESSON_SECTIONS = [
    {
        title: "Teaching and Learning",
        qs: [
            "2.2.1 Set induction is effective and interesting.",
            "2.2.14 Lessons are delivered clearly and precisely.",
            "2.2.26 Varieties of examples are used in teaching according to students' age, ability and condition.",
            "2.2.3 Students are motivated and their interest is maintained during the lesson.",
            "2.2.4 Teachers encourage students to express their opinions.",
            "2.2.5 Students are reinforced with different strategies.",
            "2.2.6 Time allocated for individual activities is managed effectively.",
            "2.2.11 Encourage students to recall and relate their existing knowledge, skills and experiences with the new knowledge.",
            "2.2.12 Lessons are integrated to daily life.",
            "2.2.15 Opportunities are provided to develop the skills related to content knowledge.",
            "2.2.16 Lessons are contextualized to make learning meaningful.",
            "2.2.17 Teaching and learning activities are conducted with respect to the learning pace of the students.",
            "2.2.23 Opportunities are provided for students to think on what they have learnt.",
            "2.2.24 Opportunities are provided for students to think about what they have discussed in groups.",
            "2.2.25 Students are given opportunities to reflect on what they have learnt.",
            "2.2.27 Knowledge, skills and values are incorporated in the lessons to cater different ability level.",
            "2.2.28 Teaching and learning activities are designed to cater different ability level of students.",
            "2.5.1 Teacher emphasises to inculcate etiquettes and values in students.",
            "2.5.2 Teacher encourages students to initiate and learn independently.",
            "2.5.3 Students are taught how to use the key competencies.",
            "2.5.4 Teacher encourages further strengthen of the key competencies.",
            "2.5.5 Students' communication skills are enhanced.",
            "2.2.45 Lesson plan is followed in teaching.",
            "2.2.13 Different strategies are used to connect lesson to prior knowledge.",
            "2.2.7 Classroom arrangements promote positive learning.",
            "2.2.8 Classroom furniture are arranged to facilitate smooth running of activities."
        ]
    },
    {
        title: "Teacher Attributes and Skills",
        qs: [
            "2.2.41 Teacher has language competency in the medium of instruction.",
            "2.2.42 Teacher is updated with latest knowledge of the themes/topics.",
            "2.2.43 Teacher is competent and confident in teaching.",
            "2.2.44 Students' misconceptions are identified and responded with clarity and precisely.",
            "2.2.2 Classroom rules and good practices are implemented."
        ]
    },
    {
        title: "Teaching and Learning Resources",
        qs: [
            "2.2.18 Appropriate ICT resources are utilized in the lessons.",
            "2.2.19 Effective teaching and learning aids are used in the lessons.",
            "2.2.20 Teaching and learning resources used in the lessons enrich students' knowledge."
        ]
    },
    {
        title: "Evaluation",
        qs: [
            "2.2.29 Learning intention and success criteria are clearly shared with students.",
            "2.2.30 Clear instructions are given to achieve learning intention.",
            "2.2.31 Teaching and learning activities are carried out in line with learning intentions.",
            "2.2.32 Teachers revisit learning intentions during the lessons, to assess the progress.",
            "2.2.33 Different levels of questions are asked to promote high-order thinking in students.",
            "2.2.34 Appropriate time is given for the students to respond the questions asked.",
            "2.2.35 Teacher checks students' level of understanding before, during and after instructions.",
            "2.2.36 Constructive feedback is given timely to improve students' performance.",
            "2.2.37 Students are assessed based on what is taught, using different assessment strategies.",
            "2.2.38 Teacher encourages students to assess learning intention.",
            "2.2.39 Closure of the lesson assesses the achievement of learning intention.",
            "2.2.40 Closure summarizes the key points of lessons."
        ]
    },
    {
        title: "Key Competency",
        qs: [
            "2.5.6 Practicing Islam",
            "2.5.7 Making learning meaningful",
            "2.5.8 Thinking critically and creatively",
            "2.5.9 Understanding and managing self",
            "2.5.10 Living a healthy life",
            "2.5.11 Relating to people",
            "2.5.12 Using technology and the media",
            "2.5.13 Using sustainable practices"
        ]
    },
    {
        title: "Shared Values",
        qs: [
            "2.5.14 Values relating to self",
            "2.5.15 Values relating to family and others",
            "2.5.16 Values relating to local and global community",
            "2.5.17 Values relating to the environment"
        ]
    }
];

export default function App() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [teacherName, setTeacherName] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [offlineMode, setOfflineMode] = useState(true); 
    
    const [currentView, setCurrentView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [dashboardData, setDashboardData] = useState({ lessons: [], books: [] });
    const [notification, setNotification] = useState(null);

    const [selectedDashboardTeacher, setSelectedDashboardTeacher] = useState('All');
    const [selectedRecord, setSelectedRecord] = useState(null); 
    const [editingRecord, setEditingRecord] = useState(null);
    
    const [aiFeedback, setAiFeedback] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [lessonPlanFile, setLessonPlanFile] = useState(null);
    const [lessonPlanEval, setLessonPlanEval] = useState('');
    const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);

    const [pwdCurrent, setPwdCurrent] = useState('');
    const [pwdNew, setPwdNew] = useState('');
    const [pwdConfirm, setPwdConfirm] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    const [adminRolesMap, setAdminRolesMap] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
    
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setOfflineMode(false);
                await assignRoles(currentUser.email);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (currentView === 'settings' && user?.email === 'abdulganee@hdhatollschool.edu.mv') {
            loadAdminRoles();
        }
    }, [currentView, user]);

    const loadAdminRoles = async () => {
        if (offlineMode) return;
        try {
            const snap = await getDocs(collection(db, "user_roles"));
            let rolesMap = {};
            snap.forEach(document => {
                rolesMap[document.id] = document.data().role;
            });
            setAdminRolesMap(rolesMap);
        } catch (e) { console.error("Error loading roles", e); }
    };

    const assignRoles = async (emailToAssign) => {
        const lowerEmail = emailToAssign.toLowerCase();
        let userRole = OBSERVER_EMAILS.includes(lowerEmail) ? 'observer' : 'teacher';
        
        if (lowerEmail === 'abdulganee@hdhatollschool.edu.mv') {
            userRole = 'observer';
        } else if (!offlineMode) {
            try {
                const roleDoc = await getDoc(doc(db, "user_roles", lowerEmail));
                if (roleDoc.exists()) {
                    userRole = roleDoc.data().role;
                }
            } catch (e) { console.warn("Failed to fetch custom role, using default."); }
        }
        
        const staffMember = STAFF_LIST.find(s => s.email.toLowerCase() === lowerEmail);
        
        setRole(userRole);
        setTeacherName(staffMember ? staffMember.name : emailToAssign);
        setUser({ email: lowerEmail });
        
        if (currentView === 'dashboard') {
            fetchDashboardData(true);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        
        const email = e.target.email.value.trim().toLowerCase();
        let password = e.target.password.value;
        
        if (!email.endsWith('@hdhatollschool.edu.mv')) {
            setAuthError('Access denied. You must use an official @hdhatollschool.edu.mv email address.');
            setLoading(false);
            return;
        }

        const staffMember = STAFF_LIST.find(s => s.email.toLowerCase() === email);
        if (!staffMember && email !== 'abdulganee@hdhatollschool.edu.mv') {
            setAuthError('Your email was not found in the official HDH Atoll School staff directory.');
            setLoading(false);
            return;
        }

        if (password === '123') password = '123123'; 

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setOfflineMode(false);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    setOfflineMode(false);
                } catch (regError) {
                    await assignRoles(email);
                }
            } else {
                await assignRoles(email);
            }
        }
        setLoading(false);
    };

    const handleLogout = () => {
        signOut(auth).catch(() => {});
        setUser(null);
        setRole(null);
        setTeacherName("");
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwdNew !== pwdConfirm) {
            showNotification("New passwords do not match.", "error");
            return;
        }
        if (pwdNew.length < 6) {
            showNotification("Password must be at least 6 characters long.", "error");
            return;
        }

        setPwdLoading(true);
        try {
            let authPwd = pwdCurrent === '123' ? '123123' : pwdCurrent;
            const credential = EmailAuthProvider.credential(user.email, authPwd);
            await reauthenticateWithCredential(auth.currentUser, credential);
            
            let safeNewPwd = pwdNew === '123' ? '123123' : pwdNew;
            await updatePassword(auth.currentUser, safeNewPwd);
            
            showNotification("Password updated successfully!");
            setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
        } catch (error) {
            console.error(error);
            showNotification("Failed to change password. Ensure your current password is correct.", "error");
        }
        setPwdLoading(false);
    };

    const handleAdminReset = async (email) => {
        setConfirmDialog({
            isOpen: true,
            message: `Are you sure you want to send a password reset email to ${email}?`,
            onConfirm: async () => {
                try {
                    await sendPasswordResetEmail(auth, email);
                    showNotification(`Password reset email sent to ${email}`);
                } catch (error) {
                    showNotification(`Failed to send reset email: ${error.message}`, "error");
                }
                setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
            }
        });
    };

    const handleRoleToggle = async (staffEmail, currentResolvedRole) => {
        const newRole = currentResolvedRole === 'observer' ? 'teacher' : 'observer';
        
        setConfirmDialog({
            isOpen: true,
            message: `Are you sure you want to change ${staffEmail}'s role to ${newRole.toUpperCase()}?`,
            onConfirm: async () => {
                try {
                    if (offlineMode) {
                         showNotification("Cannot change roles in Offline Preview mode.", "error");
                         setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
                         return;
                    }
                    await setDoc(doc(db, "user_roles", staffEmail), { role: newRole });
                    setAdminRolesMap(prev => ({ ...prev, [staffEmail]: newRole }));
                    showNotification(`Successfully updated ${staffEmail} to ${newRole}`);
                } catch(e) {
                    showNotification("Failed to update user role. Check database permissions.", "error");
                }
                setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
            }
        });
    };

    const fetchDashboardData = async (forceFirebase = false) => {
        if (offlineMode && !forceFirebase) {
            setDashboardData({
                lessons: [...LOCAL_MEMORY_DB.lesson_observations].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
                books: [...LOCAL_MEMORY_DB.book_checkings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            });
            return;
        }

        try {
            const lessonsSnap = await getDocs(collection(db, "lesson_observations"));
            const booksSnap = await getDocs(collection(db, "book_checkings"));
            
            let fetchedLessons = lessonsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
            let fetchedBooks = booksSnap.docs.map(d => ({ ...d.data(), id: d.id }));

            fetchedLessons.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            fetchedBooks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setDashboardData({
                lessons: fetchedLessons,
                books: fetchedBooks
            });
            setOfflineMode(false);
        } catch (error) {
            console.error("Firebase fetch error:", error);
            setOfflineMode(true);
            setDashboardData({
                lessons: [...LOCAL_MEMORY_DB.lesson_observations].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
                books: [...LOCAL_MEMORY_DB.book_checkings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            });
            if (error.code === 'permission-denied') {
                showNotification("Database access denied. Check Firebase Security Rules.", "error");
            }
        }
    };

    const handleDeleteRecord = (record) => {
        setConfirmDialog({
            isOpen: true,
            message: `Are you sure you want to permanently delete this ${record.Type || record.type} for ${record.Teacher || record.teacherName}? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    if (offlineMode) {
                        const collection = (record.Type === 'Lesson Observation' || record.type === 'Lesson') ? 'lesson_observations' : 'book_checkings';
                        LOCAL_MEMORY_DB[collection] = LOCAL_MEMORY_DB[collection].filter(r => r.timestamp !== record.timestamp);
                    } else {
                        if (!record.id) throw new Error("Record ID missing. Cannot delete.");
                        const collectionName = (record.Type === 'Lesson Observation' || record.type === 'Lesson') ? 'lesson_observations' : 'book_checkings';
                        await deleteDoc(doc(db, collectionName, record.id));
                    }
                    showNotification("Record deleted successfully.");
                    setSelectedRecord(null);
                    fetchDashboardData(true);
                } catch (error) {
                    console.error("Delete error:", error);
                    showNotification("Failed to delete record.", "error");
                }
                setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
            }
        });
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setSelectedRecord(null);
        setCurrentView(record.Type === 'Lesson Observation' || record.type === 'Lesson' ? 'lessonObs' : 'bookCheck');
        setLessonPlanEval(record.lessonPlanEvaluation || record.Lesson_Plan_Eval || "");
        setLessonPlanFile(null);
        window.scrollTo(0, 0);
    };

    const logToGoogleSheets = async (payload) => {
        if (!GOOGLE_SHEETS_WEBHOOK_URL) return;
        if (GOOGLE_SHEETS_WEBHOOK_URL.includes("library/d")) return;

        try {
            fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            }).catch(err => console.error("Sheets sync error:", err));
        } catch (e) {
            console.error("Failed to prepare Sheets payload", e);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLessonPlanFile(e.target.files[0]);
        }
    };

    const handleAnalyzePdf = async () => {
        if (!lessonPlanFile) return;
        setIsAnalyzingPdf(true);
        setLessonPlanEval('');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(lessonPlanFile);
            reader.onload = async () => {
                const base64Data = reader.result.split(',')[1];
                
                const prompt = "Act as an expert school principal. Analyze this attached lesson plan PDF. Evaluate key attributes such as: 1. Clarity of learning intentions. 2. Appropriateness and sequencing of activities. 3. Differentiation for varied learner needs. 4. Alignment with assessment strategies. Provide a concise, professional evaluation highlighting strengths and areas for improvement.";
                
                const payload = {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: "application/pdf",
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ]
                };

                const apiKey = "AQ.Ab8RN6LudEMUpBl0xo1XdNfs0hWDcTJj3ISNAa3DRmWeYazA6g"; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

                try {
                    const response = await fetch(apiUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(payload) 
                    });
                    const result = await response.json();
                    
                    if (result.candidates && result.candidates.length > 0) {
                        setLessonPlanEval(result.candidates[0].content.parts[0].text);
                        showNotification("Lesson plan analyzed successfully!");
                    } else {
                        setLessonPlanEval("Could not evaluate the lesson plan. Please ensure it's a readable text-based PDF.");
                        showNotification("Analysis failed.", "error");
                    }
                } catch (fetchErr) {
                    console.error("Fetch Error:", fetchErr);
                    setLessonPlanEval("Error communicating with AI mentor.");
                }
                setIsAnalyzingPdf(false);
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                setLessonPlanEval("Error reading file.");
                setIsAnalyzingPdf(false);
            }
        } catch (err) {
            console.error("Reader Error:", err);
            setLessonPlanEval("Error processing the file.");
            setIsAnalyzingPdf(false);
        }
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const fd = new FormData(e.target);
        
        let totalScore = 0;
        let totalMax = 0;
        const ratings = ['5', '4', '3', '2', '1'];
        const sectionsData = {};
        let allQuestions = [];
        
        let sheetsPayload = {
            Type: 'Lesson Observation',
            Timestamp: editingRecord ? (editingRecord.Timestamp || editingRecord.timestamp) : new Date().toISOString(),
            Date: fd.get('assessmentDate'),
            Teacher: fd.get('teacherName'),
            Class: fd.get('class'),
            Subject: fd.get('subject'),
            Topic: fd.get('topic'),
            Students: fd.get('students'),
            Observer: user.email,
            Comments: fd.get('generalComments'),
            Lesson_Plan_Eval: fd.get('lessonPlanEval') || ""
        };

        const staff = STAFF_LIST.find(s => s.name === fd.get('teacherName'));
        sheetsPayload.TeacherEmail = staff ? staff.email : "";
        
        LESSON_SECTIONS.forEach((section, sIdx) => {
            let secScore = 0;
            let secMax = 0;
            section.qs.forEach((q, qIdx) => {
                const val = fd.get(`q_${sIdx}_${qIdx}`);
                if (val && ratings.includes(val)) {
                    const numVal = parseInt(val);
                    secScore += numVal;
                    secMax += 5;
                    allQuestions.push({ q, val: numVal, section: section.title });
                    sheetsPayload[q] = numVal;
                }
            });
            const secPercent = secMax > 0 ? parseFloat(((secScore / secMax) * 100).toFixed(1)) : 0;
            sectionsData[section.title] = { score: secScore, max: secMax, percentage: secPercent };
            sheetsPayload[`Section: ${section.title}`] = secPercent;
            
            totalScore += secScore;
            totalMax += secMax;
        });
        
        const percentage = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : 0;
        sheetsPayload.Total_Percentage = percentage;
        
        const bottom3 = [...allQuestions].sort((a, b) => a.val - b.val).slice(0, 3);
        let aiSuggestions = editingRecord ? (editingRecord.AI_Suggestions || editingRecord.aiSuggestions || "") : "";
        
        if (!editingRecord || !aiSuggestions) {
            try {
                const prompt = `Act as an expert school principal mentoring a teacher. Based on the following lowest-scoring criteria and observer comments from their recent lesson observations, provide 3 highly specific, actionable, and encouraging pedagogical strategies they can implement. Provide a simple numbered list without markdown asterisks.\n\nLowest Scoring Areas: ${bottom3.map(w => w.q).join(', ')}\n\nObserver Comments: ${fd.get('generalComments')}`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const apiKey = "AQ.Ab8RN6LudEMUpBl0xo1XdNfs0hWDcTJj3ISNAa3DRmWeYazA6g"; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const result = await response.json();
                if (result.candidates && result.candidates.length > 0) {
                    aiSuggestions = result.candidates[0].content.parts[0].text;
                }
            } catch (err) {
                console.warn("AI Generation failed on submit.", err);
            }
        }
        sheetsPayload.AI_Suggestions = aiSuggestions;

        const dbData = { 
            ...sheetsPayload, 
            percentage: parseFloat(percentage), 
            sectionsData, 
            questionsData: allQuestions, 
            generalComments: fd.get('generalComments'), 
            aiSuggestions, 
            lessonPlanEvaluation: fd.get('lessonPlanEval') || "", 
            timestamp: sheetsPayload.Timestamp 
        };

        try {
            if (offlineMode) {
                if (editingRecord) {
                    LOCAL_MEMORY_DB.lesson_observations = LOCAL_MEMORY_DB.lesson_observations.map(r => r.timestamp === editingRecord.timestamp ? dbData : r);
                } else {
                    LOCAL_MEMORY_DB.lesson_observations.push(dbData);
                }
            } else {
                if (editingRecord && editingRecord.id) {
                    await setDoc(doc(db, "lesson_observations", editingRecord.id), dbData);
                } else {
                    await addDoc(collection(db, "lesson_observations"), dbData);
                }
            }
            
            logToGoogleSheets(sheetsPayload);
            
            e.target.reset();
            setIsSubmitting(false);
            setLessonPlanFile(null);
            setLessonPlanEval('');
            setEditingRecord(null);
            
            showNotification(editingRecord ? "Observation updated successfully!" : "Observation submitted & AI Strategies generated!");
            fetchDashboardData(true);
            setCurrentView('dashboard');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Save error:", error);
            showNotification("Failed to save observation.", "error");
            setIsSubmitting(false);
        }
    };

    const handleBookCheckSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const fd = new FormData(e.target);
        
        const numStudents = parseInt(fd.get('numStudents')) || 1;
        const numCompleted = parseInt(fd.get('numCompleted')) || 0;
        
        const dim1 = parseInt(fd.get('dim1')) || 0;
        const dim2 = parseInt(fd.get('dim2')) || 0;
        const dim3 = parseInt(fd.get('dim3')) || 0;
        const dim4 = parseInt(fd.get('dim4')) || 0;
        const dim5 = parseInt(fd.get('dim5')) || 0;
        const dim6 = parseInt(fd.get('dim6')) || 0;

        const completionScore = Math.min((numCompleted / numStudents) * 10, 10);
        const percentageScore = ((dim1 / 4) * 35) + ((dim2 / 4) * 25) + ((dim3 / 4) * 5) + ((dim4 / 4) * 15) + ((dim5 / 4) * 5) + ((dim6 / 4) * 5) + completionScore;
        
        const staff = STAFF_LIST.find(s => s.name === fd.get('teacherName'));

        const sheetsPayload = {
            Type: 'Book Checking',
            Timestamp: editingRecord ? (editingRecord.Timestamp || editingRecord.timestamp) : new Date().toISOString(),
            Date: fd.get('assessmentDate'),
            Teacher: fd.get('teacherName'),
            TeacherEmail: staff ? staff.email : "",
            Class: fd.get('class'),
            Subject: fd.get('subject'),
            Observer: user.email,
            Students_Total: numStudents,
            Students_Submitted: fd.get('numSubmitted'),
            Students_Completed: numCompleted,
            Dim1_Regularity: dim1,
            Dim2_Accuracy: dim2,
            Dim3_NeedsImp: dim3,
            Dim4_Adequate: dim4,
            Dim5_Neatness: dim5,
            Dim6_DateSig: dim6,
            Work_Date_Comment: fd.get('workDateComment'),
            Work_Margin_Comment: fd.get('workMarginComment'),
            Work_Neatness_Comment: fd.get('workNeatnessComment'),
            Work_Completion_Comment: fd.get('workCompletionComment'),
            Total_Percentage: parseFloat(percentageScore.toFixed(1)),
            Comments: fd.get('feedback')
        };

        let aiSuggestions = editingRecord ? (editingRecord.AI_Suggestions || editingRecord.aiSuggestions || "") : "";
        if (!editingRecord || !aiSuggestions) {
            const dims = [
                { q: 'Regularity in marking', val: dim1 },
                { q: 'Accuracy comments given', val: dim2 },
                { q: 'Needs Improvement in marking', val: dim3 },
                { q: 'Adequate work given / Constructive', val: dim4 },
                { q: 'Neatness in marking', val: dim5 },
                { q: 'Date and signature given', val: dim6 }
            ];
            const bottom3 = dims.sort((a, b) => a.val - b.val).slice(0, 3);
            
            try {
                const prompt = `Act as an expert school principal mentoring a teacher. Based on the following lowest-scoring book checking criteria and observer comments, provide 3 highly specific, actionable, and encouraging pedagogical strategies they can implement. Provide a simple numbered list without markdown asterisks.\n\nLowest Scoring Areas: ${bottom3.map(w => w.q).join(', ')}\n\nObserver Comments: ${fd.get('feedback')}`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const apiKey = "AQ.Ab8RN6LudEMUpBl0xo1XdNfs0hWDcTJj3ISNAa3DRmWeYazA6g"; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const result = await response.json();
                if (result.candidates && result.candidates.length > 0) {
                    aiSuggestions = result.candidates[0].content.parts[0].text;
                }
            } catch (err) {
                console.warn("AI Generation failed on submit.", err);
            }
        }
        sheetsPayload.AI_Suggestions = aiSuggestions;

        const dbData = { 
            ...sheetsPayload, 
            percentageScore: sheetsPayload.Total_Percentage, 
            timestamp: sheetsPayload.Timestamp, 
            teacherFeedback: fd.get('feedback'),
            aiSuggestions
        };

        try {
            if (offlineMode) {
                if (editingRecord) {
                    LOCAL_MEMORY_DB.book_checkings = LOCAL_MEMORY_DB.book_checkings.map(r => r.timestamp === editingRecord.timestamp ? dbData : r);
                } else {
                    LOCAL_MEMORY_DB.book_checkings.push(dbData);
                }
            } else {
                if (editingRecord && editingRecord.id) {
                    await setDoc(doc(db, "book_checkings", editingRecord.id), dbData);
                } else {
                    await addDoc(collection(db, "book_checkings"), dbData);
                }
            }
            
            logToGoogleSheets(sheetsPayload);
            
            e.target.reset();
            setIsSubmitting(false);
            setEditingRecord(null);
            
            showNotification(editingRecord ? "Book checking updated successfully!" : "Book checking submitted & AI Strategies generated!");
            fetchDashboardData(true);
            setCurrentView('dashboard');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Save error:", error);
            showNotification("Failed to save book check.", "error");
            setIsSubmitting(false);
        }
    };

    const generateAI = async (weakAreas, comments) => {
        setAiLoading(true);
        setAiFeedback('');
        
        const prompt = `Act as an expert school principal mentoring a teacher. Based on the following lowest-scoring criteria and observer comments from their recent lesson observations, provide 3 highly specific, actionable, and encouraging pedagogical strategies they can implement. Do not use bold markdown. Provide a simple numbered list.\n\nLowest Scoring Areas: ${weakAreas.map(w => w.q).join(', ')}\n\nObserver Comments: ${comments.join(' | ')}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const apiKey = "AQ.Ab8RN6LudEMUpBl0xo1XdNfs0hWDcTJj3ISNAa3DRmWeYazA6g"; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                setAiFeedback(result.candidates[0].content.parts[0].text);
            }
        } catch (e) {
            setAiFeedback("Failed to generate AI suggestions. Please try again.");
        }
        setAiLoading(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMessage = { role: "user", parts: [{ text: chatInput }] };
        const updatedHistory = [...chatHistory, newUserMessage];
        setChatHistory(updatedHistory);
        setChatInput('');
        setIsChatLoading(true);

        const contextData = role === 'teacher'
            ? `Context: I am a teacher named ${teacherName} at HDH Atoll School.`
            : `Context: I am an observer/admin at HDH Atoll School looking at school-wide data.`;

        const systemPrompt = `Act as an expert pedagogical mentor and principal. You are encouraging, specific, and highly knowledgeable about modern teaching strategies. ${contextData} Keep responses concise, supportive, and formatted cleanly.`;

        try {
            const payload = {
                contents: updatedHistory,
                systemInstruction: { parts: [{ text: systemPrompt }] },
                tools: [{ "google_search": {} }]
            };
            const apiKey = "AQ.Ab8RN6LudEMUpBl0xo1XdNfs0hWDcTJj3ISNAa3DRmWeYazA6g"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text }] }]);
            } else {
                showNotification("Failed to generate response.", "error");
            }
        } catch (err) {
            showNotification("Connection to AI Mentor failed.", "error");
        }
        setIsChatLoading(false);
    };

    const renderAIMentor = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px] max-h-[80vh]">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex items-center gap-3 shrink-0">
                <MessageSquare size={28} className="text-indigo-100" />
                <div>
                    <h2 className="text-xl font-bold">AI Pedagogical Mentor</h2>
                    <p className="text-sm text-indigo-100">Ask for teaching strategies, advice, or feedback analysis.</p>
                </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-500 my-auto p-4 flex flex-col items-center">
                        <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-4">
                            <MessageSquare size={32} />
                        </div>
                        <p className="font-bold text-gray-700 text-lg mb-2">Welcome to your AI Mentor!</p>
                        <p className="text-sm max-w-md mx-auto mb-4">I am powered by the Gemini API with active web search capabilities. I can help you discover modern teaching methods, analyze assessment criteria, or suggest classroom activities.</p>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm italic text-left w-full max-w-sm">
                            <span className="font-semibold text-gray-600 not-italic block mb-1">Try asking:</span>
                            "How can I improve student engagement during set induction for a science class?"
                        </div>
                    </div>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm whitespace-pre-wrap shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-500 flex items-center gap-2 shadow-sm">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3 shrink-0">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your question here..." 
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button 
                    type="submit" 
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 rounded-xl shadow transition flex items-center justify-center"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );

    const renderDashboard = () => {
        let viewTeacher = role === 'teacher' ? teacherName : selectedDashboardTeacher;
        
        let filteredLessons = dashboardData.lessons;
        let filteredBooks = dashboardData.books;

        if (viewTeacher !== 'All') {
            filteredLessons = filteredLessons.filter(l => l.Teacher === viewTeacher);
            filteredBooks = filteredBooks.filter(b => b.Teacher === viewTeacher);
        }

        const totalLessons = filteredLessons.length;
        const avgLessonScore = totalLessons > 0 ? 
            (filteredLessons.reduce((acc, curr) => acc + (parseFloat(curr.Total_Percentage) || parseFloat(curr.percentage) || 0), 0) / totalLessons).toFixed(1) : 0;

        const totalBooks = filteredBooks.length;
        const avgBookScore = totalBooks > 0 ? 
            (filteredBooks.reduce((acc, curr) => acc + (parseFloat(curr.Total_Percentage) || parseFloat(curr.percentageScore) || 0), 0) / totalBooks).toFixed(1) : 0;

        let sectionAvgs = {};
        let top3 = [];
        let bottom3 = [];
        let allComments = [];

        if (viewTeacher !== 'All' && totalLessons > 0) {
            let sectionTotals = {};
            let sectionCounts = {};
            let qStats = {};

            filteredLessons.forEach(l => {
                if (l.Comments || l.generalComments) allComments.push(l.Comments || l.generalComments);
                
                if (l.sectionsData) {
                    Object.keys(l.sectionsData).forEach(sec => {
                        if (!sectionTotals[sec]) { sectionTotals[sec] = 0; sectionCounts[sec] = 0; }
                        sectionTotals[sec] += parseFloat(l.sectionsData[sec].percentage) || 0;
                        sectionCounts[sec] += 1;
                    });
                }
                if (l.questionsData) {
                    l.questionsData.forEach(q => {
                        if (!qStats[q.q]) qStats[q.q] = { total: 0, count: 0, section: q.section };
                        qStats[q.q].total += (parseFloat(q.val) / 5) * 100;
                        qStats[q.q].count += 1;
                    });
                }
            });

            Object.keys(sectionTotals).forEach(sec => {
                sectionAvgs[sec] = (sectionTotals[sec] / sectionCounts[sec]).toFixed(1);
            });

            let sortedQs = Object.keys(qStats).map(k => ({
                q: k,
                section: qStats[k].section,
                avg: qStats[k].total / qStats[k].count
            })).sort((a, b) => b.avg - a.avg);

            top3 = sortedQs.slice(0, 3);
            bottom3 = sortedQs.slice(-3).reverse();
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Performance Dashboard</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-gray-500 text-sm">
                                {role === 'teacher' ? `Personal metrics & PDF archive for ${teacherName}` : 'School-wide metrics & PDF archives'}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${role === 'observer' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                {role === 'observer' ? 'Admin Access' : 'Teacher Access'}
                            </span>
                        </div>
                    </div>
                    
                    {role === 'observer' && (
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600">View Teacher:</label>
                            <select 
                                value={selectedDashboardTeacher}
                                onChange={(e) => {
                                    setSelectedDashboardTeacher(e.target.value);
                                    setAiFeedback('');
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 outline-none bg-white text-sm"
                            >
                                <option value="All">All School Aggregate</option>
                                {STAFF_LIST.map((staff, idx) => (
                                    <option key={idx} value={staff.name}>{staff.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Avg Lesson Score</h3>
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><LayoutDashboard size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{avgLessonScore}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Avg Book Check</h3>
                            <div className="bg-green-50 p-2 rounded-lg text-green-600"><BookOpenCheck size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{avgBookScore}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Lessons Observed</h3>
                            <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><ClipboardCheck size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalLessons}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Books Checked</h3>
                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><CheckCircle2 size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalBooks}</p>
                    </div>
                </div>

                {viewTeacher !== 'All' && totalLessons > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={20}/> Section Breakdown</h3>
                            <div className="space-y-4">
                                {Object.keys(sectionAvgs).length > 0 ? Object.entries(sectionAvgs).map(([sec, avg], idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                            <span className="truncate pr-2">{sec}</span>
                                            <span>{avg}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${avg}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic">No detailed section data available for older records.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Strengths & Focus Areas</h3>
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-green-700 mb-2 uppercase tracking-wider">Top 3 Strengths</h4>
                                <ul className="space-y-2">
                                    {top3.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 bg-green-50/50 p-2 rounded border border-green-100">
                                            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>{item.q.replace(/^[0-9.]+\s/, '')} <b className="text-green-800 ml-1">({item.avg.toFixed(0)}%)</b></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-700 mb-2 uppercase tracking-wider">Lowest 3 Areas</h4>
                                <ul className="space-y-2">
                                    {bottom3.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 bg-red-50/50 p-2 rounded border border-red-100">
                                            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                                            <span>{item.q.replace(/^[0-9.]+\s/, '')} <b className="text-red-800 ml-1">({item.avg.toFixed(0)}%)</b></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 lg:col-span-1 flex flex-col">
                            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2"><Sparkles size={20} className="text-blue-600"/> AI Mentoring</h3>
                            <p className="text-xs text-indigo-700 mb-4">Generate targeted, actionable strategies based on this teacher's weakest areas and observer feedback.</p>
                            
                            {aiFeedback ? (
                                <div className="bg-white rounded-lg p-4 shadow-inner text-sm text-gray-700 flex-1 overflow-y-auto border border-blue-100 whitespace-pre-wrap">
                                    {aiFeedback}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-white/50 rounded-lg border border-dashed border-blue-200">
                                    <button 
                                        onClick={() => generateAI(bottom3, allComments)}
                                        disabled={aiLoading || bottom3.length === 0}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-lg shadow transition flex items-center gap-2"
                                    >
                                        {aiLoading ? 'Analyzing Data...' : 'Generate Strategies'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Official Assessment Archives</h3>
                    <p className="text-sm text-gray-500 mb-4">Click any record below to view and download the official PDF report.</p>
                    {filteredLessons.length === 0 && filteredBooks.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">No data available yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm">
                                        <th className="p-3 font-semibold rounded-tl-lg">Date</th>
                                        <th className="p-3 font-semibold">Type</th>
                                        <th className="p-3 font-semibold">Teacher</th>
                                        <th className="p-3 font-semibold">Class</th>
                                        <th className="p-3 font-semibold">Score</th>
                                        <th className="p-3 font-semibold rounded-tr-lg text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...filteredLessons.map(l => ({...l, type: 'Lesson'})), ...filteredBooks.map(b => ({...b, type: 'Book'}))]
                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                        .map((item, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => setSelectedRecord(item)}
                                            className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="p-3 text-sm text-gray-700">{item.Date || item.date}</td>
                                            <td className="p-3 text-sm"><span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'Lesson' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.type}</span></td>
                                            <td className="p-3 text-sm text-gray-800 font-medium">{item.Teacher || item.teacherName}</td>
                                            <td className="p-3 text-sm text-gray-600">{item.Class || item.class}</td>
                                            <td className="p-3 text-sm font-bold text-gray-700">{item.Total_Percentage || item.percentage || item.percentageScore}%</td>
                                            <td className="p-3 text-right">
                                                <button className="text-xs bg-white border border-gray-200 text-blue-600 px-3 py-1.5 rounded shadow-sm group-hover:bg-blue-600 group-hover:text-white transition flex items-center gap-1 ml-auto">
                                                    <FileText size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSettings = () => (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-800 p-6 text-white flex items-center gap-3">
                    <Key size={24} className="text-gray-300" />
                    <div>
                        <h2 className="text-xl font-bold">Change Your Password</h2>
                        <p className="text-sm text-gray-300">Secure your HDH Atoll School account</p>
                    </div>
                </div>
                
                <form onSubmit={handlePasswordChange} className="p-6 md:p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input 
                            type="password" 
                            value={pwdCurrent}
                            onChange={(e) => setPwdCurrent(e.target.value)}
                            required 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                            placeholder="Enter current password (e.g. 123)"
                        />
                    </div>
                    <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                            type="password" 
                            value={pwdNew}
                            onChange={(e) => setPwdNew(e.target.value)}
                            required 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                            placeholder="Must be at least 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={pwdConfirm}
                            onChange={(e) => setPwdConfirm(e.target.value)}
                            required 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                            placeholder="Re-type new password"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={pwdLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-3 rounded-lg shadow transition"
                    >
                        {pwdLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {user?.email === 'abdulganee@hdhatollschool.edu.mv' && (
                <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                    <div className="bg-red-800 p-6 text-white flex items-center gap-3">
                        <Settings size={24} className="text-red-300" />
                        <div>
                            <h2 className="text-xl font-bold">Administrator Controls</h2>
                            <p className="text-sm text-red-200">Manage staff roles and force password resets</p>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <p className="text-sm text-gray-600 mb-6">
                            Update user permissions or send a password reset email. Role changes take effect upon the user's next login. Reset links are sent directly to the teacher's school email address.
                        </p>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {STAFF_LIST.map((staff, idx) => {
                                const currentRole = adminRolesMap[staff.email] || (OBSERVER_EMAILS.includes(staff.email) ? 'observer' : 'teacher');
                                const isAdmin = staff.email === 'abdulganee@hdhatollschool.edu.mv';
                                
                                return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                            {staff.name}
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${currentRole === 'observer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {currentRole}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500">{staff.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleRoleToggle(staff.email, currentRole)}
                                            disabled={isAdmin}
                                            title={isAdmin ? "Cannot change Principal role" : "Toggle Role"}
                                            className={`text-xs border py-1.5 px-3 rounded shadow-sm transition flex items-center gap-2 ${isAdmin ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'}`}
                                        >
                                            <Shield size={14}/> {currentRole === 'observer' ? 'Make Teacher' : 'Make Observer'}
                                        </button>
                                        <button 
                                            onClick={() => handleAdminReset(staff.email)}
                                            className="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 py-1.5 px-3 rounded shadow-sm transition flex items-center gap-2"
                                            title="Send Password Reset"
                                        >
                                            <Mail size={14}/> Reset
                                        </button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderLessonObs = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-8 text-white text-center">
                <h1 className="text-4xl font-extrabold tracking-widest mb-2 font-serif">HDH ATOLL SCHOOL</h1>
                <h3 className="text-lg opacity-90 font-medium">{editingRecord ? 'Editing Lesson Observation' : 'Key Stage - Lesson Observation Form'}</h3>
            </div>
            
            <form onSubmit={handleLessonSubmit} className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" name="assessmentDate" required defaultValue={editingRecord ? (editingRecord.Date || editingRecord.date) : new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher's Name</label>
                        <select name="teacherName" required defaultValue={editingRecord?.Teacher || editingRecord?.teacherName || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                            <option value="">Select Teacher...</option>
                            {STAFF_LIST.map((staff, idx) => (
                                <option key={idx} value={staff.name}>{staff.name} ({staff.designation})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input type="text" name="subject" required defaultValue={editingRecord?.Subject || editingRecord?.subject || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g., English" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <input type="text" name="class" required defaultValue={editingRecord?.Class || editingRecord?.class || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g., 10S1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                        <input type="text" name="topic" required defaultValue={editingRecord?.Topic || editingRecord?.topic || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. of students</label>
                        <input type="number" name="students" required min="1" defaultValue={editingRecord?.Students || editingRecord?.students || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between text-sm overflow-x-auto whitespace-nowrap">
                    <span className="font-semibold text-blue-800 mr-4">Rating Scale:</span>
                    <div className="flex gap-4 min-w-max">
                        <span><b className="text-blue-900">5:</b> Very Good</span>
                        <span><b className="text-blue-900">4:</b> Good</span>
                        <span><b className="text-blue-900">3:</b> Satisfactory</span>
                        <span><b className="text-blue-900">2:</b> Needs Imp.</span>
                        <span><b className="text-blue-900">1:</b> Not carried out</span>
                        <span><b className="text-gray-500">NN:</b> Not Necessary</span>
                    </div>
                </div>

                {LESSON_SECTIONS.map((section, sIdx) => (
                    <div key={sIdx} className="mb-8">
                        <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">{section.title}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600">
                                        <th className="p-3 rounded-tl border-b">Criteria</th>
                                        <th className="p-3 text-center w-12 border-b">5</th>
                                        <th className="p-3 text-center w-12 border-b">4</th>
                                        <th className="p-3 text-center w-12 border-b">3</th>
                                        <th className="p-3 text-center w-12 border-b">2</th>
                                        <th className="p-3 text-center w-12 border-b">1</th>
                                        <th className="p-3 text-center w-12 border-b rounded-tr">NN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section.qs.map((q, qIdx) => (
                                        <tr key={qIdx} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3 py-4 text-gray-700 max-w-md">{q}</td>
                                            {['5', '4', '3', '2', '1', 'NN'].map((val) => {
                                                let isChecked = false;
                                                if (editingRecord && editingRecord.questionsData) {
                                                    const match = editingRecord.questionsData.find(qd => qd.q === q);
                                                    if (match && match.val.toString() === val) isChecked = true;
                                                    if (match === undefined && val === 'NN') isChecked = true; 
                                                }
                                                return (
                                                    <td key={val} className="p-3 text-center">
                                                        <input type="radio" name={`q_${sIdx}_${qIdx}`} value={val} defaultChecked={isChecked} required className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <FileText size={20} className="text-indigo-600" />
                        Upload Lesson Plan (PDF) for AI Evaluation
                    </h3>
                    <div className="bg-indigo-50/50 p-5 rounded-lg border border-indigo-100 space-y-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 focus:outline-none"
                            />
                            <button 
                                type="button"
                                onClick={handleAnalyzePdf}
                                disabled={!lessonPlanFile || isAnalyzingPdf}
                                className="w-full md:w-auto whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 px-5 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
                            >
                                {isAnalyzingPdf ? (
                                    <>Analyzing PDF...</>
                                ) : (
                                    <><Sparkles size={16} /> Analyze Plan</>
                                )}
                            </button>
                        </div>
                        
                        {lessonPlanEval && (
                            <div className="mt-4 bg-white border border-indigo-200 p-4 rounded-lg shadow-sm">
                                <h4 className="text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wider">AI Evaluation Result</h4>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {lessonPlanEval}
                                </div>
                            </div>
                        )}
                        <input type="hidden" name="lessonPlanEval" value={lessonPlanEval} />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Comments / Feedback provided to the Teacher</label>
                    <textarea name="generalComments" rows={4} defaultValue={editingRecord?.generalComments || editingRecord?.Comments || ""} className="w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 outline-none border" placeholder="Enter constructive feedback..."></textarea>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Signature</label>
                        <input type="text" readOnly value="Signed Electronically" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm outline-none border bg-gray-100 text-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leading Teacher</label>
                        <input type="text" name="leadingTeacher" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 outline-none border bg-gray-50" placeholder="Name / Signature" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Principal</label>
                        <input type="text" name="principal" defaultValue="Abdul Ganee Ali" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 outline-none border bg-gray-50" placeholder="Name / Signature" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    {editingRecord && (
                        <button type="button" onClick={() => { setEditingRecord(null); setCurrentView('dashboard'); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition">Cancel</button>
                    )}
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition flex items-center gap-2">
                        {isSubmitting ? 'Processing...' : <><CheckCircle2 size={20} /> {editingRecord ? 'Update Observation' : 'Submit Observation'}</>}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderBookCheck = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-700 p-8 text-white text-center">
                <h1 className="text-4xl font-extrabold tracking-widest mb-2 font-serif">HDH ATOLL SCHOOL</h1>
                <h3 className="text-lg opacity-90 font-medium">{editingRecord ? 'Editing Book Check' : 'School Supervision - Checking of Student Work'}</h3>
            </div>
            
            <form onSubmit={handleBookCheckSubmit} className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" name="assessmentDate" required defaultValue={editingRecord ? (editingRecord.Date || editingRecord.date) : new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 outline-none border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher's Name</label>
                        <select name="teacherName" required defaultValue={editingRecord?.Teacher || editingRecord?.teacherName || ""} className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 outline-none border bg-white">
                            <option value="">Select Teacher...</option>
                            {STAFF_LIST.map((staff, idx) => (
                                <option key={idx} value={staff.name}>{staff.name} ({staff.designation})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input type="text" name="subject" required defaultValue={editingRecord?.Subject || editingRecord?.subject || ""} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <input type="text" name="class" required defaultValue={editingRecord?.Class || editingRecord?.class || ""} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
                        <input type="number" name="numStudents" required min="1" defaultValue={editingRecord?.Students_Total || editingRecord?.numStudents || ""} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Submitted</label>
                            <input type="number" name="numSubmitted" required min="0" defaultValue={editingRecord?.Students_Submitted || editingRecord?.numSubmitted || ""} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Completed</label>
                            <input type="number" name="numCompleted" required min="0" defaultValue={editingRecord?.Students_Completed || editingRecord?.numCompleted || ""} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">Grading Dimensions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600">
                                    <th className="p-3 rounded-tl border-b w-1/3">Dimension</th>
                                    <th className="p-3 border-b w-16 text-center">Weight</th>
                                    <th className="p-3 border-b">Rating (1 - 4)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'dim1', label: 'Regularity in marking', w: '35%', dbKey: 'Dim1_Regularity' },
                                    { id: 'dim2', label: 'Accuracy comments given', w: '25%', dbKey: 'Dim2_Accuracy' },
                                    { id: 'dim3', label: 'Needs Improvement in marking', w: '5%', dbKey: 'Dim3_NeedsImp' },
                                    { id: 'dim4', label: 'Adequate work given / Constructive', w: '15%', dbKey: 'Dim4_Adequate' },
                                    { id: 'dim5', label: 'Neatness in marking', w: '5%', dbKey: 'Dim5_Neatness' },
                                    { id: 'dim6', label: 'Date and signature given', w: '5%', dbKey: 'Dim6_DateSig' }
                                ].map((dim, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-700">{dim.label}</td>
                                        <td className="p-3 text-center text-gray-500">{dim.w}</td>
                                        <td className="p-3">
                                            <div className="flex gap-4">
                                                {[1,2,3,4].map(val => (
                                                    <label key={val} className="flex items-center gap-1 cursor-pointer">
                                                        <input type="radio" name={dim.id} value={val} defaultChecked={editingRecord && editingRecord[dim.dbKey] === val} required className="text-green-600 focus:ring-green-500" />
                                                        <span className="text-gray-600">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 border-b">
                                    <td className="p-3 font-medium text-gray-700">Student work completion</td>
                                    <td className="p-3 text-center text-gray-500">10%</td>
                                    <td className="p-3 text-gray-400 italic text-xs">Generated automatically based on student submission vs completion ratio.</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500 mt-2 text-right">Rating Scale: 1 (Poor) to 4 (Excellent)</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Details of Student Work</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Writing of date in student work</label>
                            <textarea name="workDateComment" rows={2} defaultValue={editingRecord?.Work_Date_Comment || ""} className="w-full px-3 py-2 rounded-lg border-gray-300 shadow-sm border outline-none text-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Drawing of Margins</label>
                            <textarea name="workMarginComment" rows={2} defaultValue={editingRecord?.Work_Margin_Comment || ""} className="w-full px-3 py-2 rounded-lg border-gray-300 shadow-sm border outline-none text-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Neatness of the work</label>
                            <textarea name="workNeatnessComment" rows={2} defaultValue={editingRecord?.Work_Neatness_Comment || ""} className="w-full px-3 py-2 rounded-lg border-gray-300 shadow-sm border outline-none text-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Completion of the work</label>
                            <textarea name="workCompletionComment" rows={2} defaultValue={editingRecord?.Work_Completion_Comment || ""} className="w-full px-3 py-2 rounded-lg border-gray-300 shadow-sm border outline-none text-sm"></textarea>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">Feedback given to the Teacher</h3>
                    <textarea name="feedback" required rows={5} defaultValue={editingRecord?.Comments || editingRecord?.teacherFeedback || ""} className="w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm border outline-none text-sm" placeholder="Detail the observations, errors, and corrective actions..."></textarea>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Signature</label>
                        <input type="text" readOnly value="Signed Electronically" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm outline-none border bg-gray-100 text-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leading Teacher</label>
                        <input type="text" name="leadingTeacher" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border bg-gray-50" placeholder="Name / Signature" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Principal</label>
                        <input type="text" name="principal" defaultValue="Abdul Ganee Ali" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-green-500 outline-none border bg-gray-50" placeholder="Name / Signature" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    {editingRecord && (
                        <button type="button" onClick={() => { setEditingRecord(null); setCurrentView('dashboard'); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition">Cancel</button>
                    )}
                    <button type="submit" disabled={isSubmitting} className="bg-green-700 hover:bg-green-800 disabled:opacity-70 text-white font-medium py-3 px-8 rounded-lg shadow flex items-center gap-2">
                        {isSubmitting ? 'Processing...' : <><CheckCircle2 size={20} /> {editingRecord ? 'Update Book Check' : 'Submit Book Check'}</>}
                    </button>
                </div>
            </form>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-blue-900 tracking-widest font-serif">HDH ATOLL SCHOOL</h1>
                        <p className="text-gray-500 text-sm mt-2">Assessment & Supervision Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {authError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{authError}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                required 
                                placeholder="name@hdhatollschool.edu.mv"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                required 
                                placeholder="Enter password (default: 123)"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 shadow"
                        >
                            {loading ? 'Authenticating...' : <><Lock size={18} /> Sign In</>}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-xs text-gray-400">
                        <p>Authorized personnel only. Access restricted to HDH Atoll School staff.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            <div className="md:hidden bg-blue-800 text-white p-4 flex justify-between items-center shadow-md">
                <span className="font-bold text-lg tracking-wide font-serif">HDH ATOLL SCHOOL</span>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-blue-700 rounded-lg">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <nav className={`w-full md:w-72 bg-blue-900 text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out absolute md:relative z-20 min-h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 pb-2 border-b border-blue-800 flex items-center justify-center">
                    <h2 className="text-xl font-bold tracking-widest text-center font-serif">HDH ATOLL SCHOOL</h2>
                </div>
                
                <div className="p-6">
                    <div className="bg-blue-800 rounded-lg p-4 flex items-center gap-3 shadow-inner border border-blue-700">
                        <div className="bg-blue-600 p-2 rounded-full"><User size={20} /></div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-blue-300 uppercase tracking-wider">{role}</p>
                            <p className="font-semibold text-sm truncate">{teacherName}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-4 space-y-2 mt-2">
                    <button onClick={() => {setCurrentView('dashboard'); setSidebarOpen(false); setEditingRecord(null); setLessonPlanEval(''); setLessonPlanFile(null); fetchDashboardData(true);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'dashboard' ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50'}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    
                    <button onClick={() => {setCurrentView('aiMentor'); setSidebarOpen(false); setEditingRecord(null); setLessonPlanEval(''); setLessonPlanFile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'aiMentor' ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50'}`}>
                        <MessageSquare size={20} /> AI Mentor
                    </button>

                    {role === 'observer' && (
                        <>
                            <button onClick={() => {setCurrentView('lessonObs'); setSidebarOpen(false); setEditingRecord(null); setLessonPlanEval(''); setLessonPlanFile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'lessonObs' ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50'}`}>
                                <ClipboardCheck size={20} /> Lesson Observation
                            </button>
                            <button onClick={() => {setCurrentView('bookCheck'); setSidebarOpen(false); setEditingRecord(null); setLessonPlanEval(''); setLessonPlanFile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'bookCheck' ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50'}`}>
                                <BookOpenCheck size={20} /> Book Checking
                            </button>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-blue-800 space-y-2">
                    <button onClick={() => {setCurrentView('settings'); setSidebarOpen(false); setEditingRecord(null); setLessonPlanEval(''); setLessonPlanFile(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentView === 'settings' ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800/30'}`}>
                        <Settings size={20} /> Settings
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/30 transition">
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-h-screen">
                <div className="max-w-6xl mx-auto relative pb-20">
                    {notification && (
                        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transform transition-all duration-300 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                            {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <p className="font-medium text-sm md:text-base">{notification.message}</p>
                        </div>
                    )}

                    {currentView === 'dashboard' && renderDashboard()}
                    {currentView === 'lessonObs' && role === 'observer' && renderLessonObs()}
                    {currentView === 'bookCheck' && role === 'observer' && renderBookCheck()}
                    {currentView === 'aiMentor' && renderAIMentor()}
                    {currentView === 'settings' && renderSettings()}
                </div>
            </main>

            {}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 no-print">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden">
                        
                        <div className="p-4 bg-gray-800 text-white flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <FileText size={20} className="text-gray-300" /> Official Assessment Record
                            </h3>
                            <div className="flex items-center gap-3">
                                {role === 'observer' && (
                                    <>
                                        <button 
                                            onClick={() => handleEdit(selectedRecord)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm"
                                        >
                                            <Edit size={16} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteRecord(selectedRecord)} 
                                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={() => window.print()} 
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm"
                                >
                                    <Download size={16} /> Save as PDF
                                </button>
                                <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-white/20 rounded-lg transition"><X size={24} /></button>
                            </div>
                        </div>
                        
                        <div className="p-8 overflow-y-auto bg-white text-black flex-1" id="print-section">
                            <div className="max-w-3xl mx-auto">
                                
                                <div className="text-center mb-8 border-b-4 border-gray-900 pb-6">
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest mb-2 font-serif text-gray-900">HDH ATOLL SCHOOL</h1>
                                    <h2 className="text-xl font-bold text-gray-600 uppercase tracking-wider">{selectedRecord.Type || selectedRecord.type} Report</h2>
                                    <p className="text-sm text-gray-500 mt-2">Generated by School Supervision & Assessment Portal</p>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 text-sm">
                                    <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                        <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Assessment Date</span> 
                                        <span className="font-medium text-gray-900">{selectedRecord.Date || selectedRecord.date}</span>
                                    </div>
                                    <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                        <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Teacher</span> 
                                        <span className="font-medium text-gray-900">{selectedRecord.Teacher || selectedRecord.teacherName}</span>
                                    </div>
                                    <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                        <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Class & Subject</span> 
                                        <span className="font-medium text-gray-900">{selectedRecord.Class || selectedRecord.class} <br/> {selectedRecord.Subject || selectedRecord.subject}</span>
                                    </div>
                                    
                                    {(selectedRecord.Type === 'Lesson Observation' || selectedRecord.type === 'Lesson') ? (
                                        <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                            <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Topic & Students</span> 
                                            <span className="font-medium text-gray-900 block truncate" title={selectedRecord.Topic}>{selectedRecord.Topic || 'N/A'}</span>
                                            <span className="font-medium text-gray-900">{selectedRecord.Students || 'N/A'} Students</span>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 p-3 rounded-lg bg-gray-50/50">
                                            <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Books Checked</span> 
                                            <span className="font-medium text-gray-900">{selectedRecord.Students_Completed || 0} / {selectedRecord.Students_Total || 1} Completed</span>
                                            <span className="text-xs text-gray-500 block">({selectedRecord.Students_Submitted || 0} Submitted)</span>
                                        </div>
                                    )}

                                    <div className="border border-blue-200 p-3 rounded-lg bg-blue-50/30 md:col-span-1 col-span-2">
                                        <span className="text-blue-700 block text-xs uppercase font-bold tracking-wider mb-1">Total Score</span> 
                                        <span className="font-bold text-2xl text-blue-900">{selectedRecord.Total_Percentage || selectedRecord.percentage || selectedRecord.percentageScore}%</span>
                                    </div>
                                </div>

                                {(selectedRecord.Type === 'Lesson Observation' || selectedRecord.type === 'Lesson') && (
                                    <>
                                        {selectedRecord.sectionsData && (
                                            <div className="mb-6 print-break-inside-avoid">
                                                <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3 text-lg">Section Breakdown</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(selectedRecord.sectionsData).map(([sec, data]: any, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                                                            <span className="text-gray-800 font-medium">{sec}</span>
                                                            <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">{data.percentage}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {selectedRecord.questionsData && (
                                            <div className="mb-8 print-break-inside-avoid">
                                                <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3 text-lg">Detailed Criteria Scores</h4>
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-50 border-b border-gray-200">
                                                            <tr>
                                                                <th className="p-2.5 font-semibold text-gray-700">Observation Criteria</th>
                                                                <th className="p-2.5 font-semibold text-gray-700 text-center w-24">Rating</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {selectedRecord.questionsData.map((q: any, idx: number) => (
                                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                                    <td className="p-2.5 text-gray-800">{q.q}</td>
                                                                    <td className="p-2.5 text-center font-bold text-blue-700">{q.val} / 5</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {(selectedRecord.Type === 'Book Checking' || selectedRecord.type === 'Book') && (
                                    <>
                                        <div className="mb-6 print-break-inside-avoid">
                                            <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3 text-lg">Grading Dimensions</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { label: 'Regularity in marking', val: selectedRecord.Dim1_Regularity },
                                                    { label: 'Accuracy comments given', val: selectedRecord.Dim2_Accuracy },
                                                    { label: 'Needs Improvement in marking', val: selectedRecord.Dim3_NeedsImp },
                                                    { label: 'Adequate work given / Constructive', val: selectedRecord.Dim4_Adequate },
                                                    { label: 'Neatness in marking', val: selectedRecord.Dim5_Neatness },
                                                    { label: 'Date and signature given', val: selectedRecord.Dim6_DateSig }
                                                ].map((dim, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                                                        <span className="text-gray-800 font-medium">{dim.label}</span>
                                                        <span className="font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded">{dim.val !== undefined ? dim.val : '-'} / 4</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-8 print-break-inside-avoid">
                                            <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3 text-lg">Details of Student Work</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm">
                                                    <span className="font-bold text-gray-700 block mb-1">Writing of date</span>
                                                    <p className="text-gray-600">{selectedRecord.Work_Date_Comment || 'No comments provided.'}</p>
                                                </div>
                                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm">
                                                    <span className="font-bold text-gray-700 block mb-1">Drawing of Margins</span>
                                                    <p className="text-gray-600">{selectedRecord.Work_Margin_Comment || 'No comments provided.'}</p>
                                                </div>
                                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm">
                                                    <span className="font-bold text-gray-700 block mb-1">Neatness of the work</span>
                                                    <p className="text-gray-600">{selectedRecord.Work_Neatness_Comment || 'No comments provided.'}</p>
                                                </div>
                                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm">
                                                    <span className="font-bold text-gray-700 block mb-1">Completion of the work</span>
                                                    <p className="text-gray-600">{selectedRecord.Work_Completion_Comment || 'No comments provided.'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedRecord.lessonPlanEvaluation && (
                                    <div className="mb-8 print-break-inside-avoid">
                                        <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 text-lg flex items-center gap-2">
                                            <Sparkles size={18} className="text-indigo-600" /> Lesson Plan AI Evaluation
                                        </h4>
                                        <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
                                            {selectedRecord.lessonPlanEvaluation}
                                        </div>
                                    </div>
                                )}

                                {selectedRecord.AI_Suggestions && (
                                    <div className="mb-8 print-break-inside-avoid">
                                        <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 text-lg flex items-center gap-2">
                                            <Sparkles size={18} className="text-indigo-600" /> AI Mentoring Strategies
                                        </h4>
                                        <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
                                            {selectedRecord.AI_Suggestions}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-10 print-break-inside-avoid">
                                    <h4 className="font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 text-lg">Observer Comments & Feedback</h4>
                                    <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                        {selectedRecord.Comments || selectedRecord.generalComments || selectedRecord.teacherFeedback || <span className="italic text-gray-400">No written comments provided for this assessment.</span>}
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t-2 border-gray-200 grid grid-cols-3 gap-8 print-break-inside-avoid">
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 font-bold mb-8 tracking-wider">Teacher Signature</p>
                                        <div className="border-b border-gray-400 w-full mb-2"></div>
                                        <p className="text-sm font-medium text-gray-800">{selectedRecord.Teacher || selectedRecord.teacherName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 font-bold mb-8 tracking-wider">Observer Signature</p>
                                        <div className="border-b border-gray-400 w-full mb-2"></div>
                                        <p className="text-sm font-medium text-gray-800">{selectedRecord.Observer || selectedRecord.observerEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 font-bold mb-8 tracking-wider">Management Signature</p>
                                        <div className="border-b border-gray-400 w-full mb-2"></div>
                                        <p className="text-sm font-medium text-gray-800">Leading Teacher / Principal</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-[60] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <AlertCircle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{confirmDialog.message}</p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })} 
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition flex-1"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDialog.onConfirm} 
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm flex-1"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
