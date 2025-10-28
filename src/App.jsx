 import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import ProjectsList from './ProjectsList';
import AddProject from './AddProject';
import ProjectDetails from './ProjectDetails';
import ProjectEdit from './ProjectEdit';
import AdminProjects from './AdminProjects';
import AdminLogin from './AdminLogin';
import AddAdmin from './AddAdmin';

function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [projects, setProjects] = useState([]);

    // جلب المشاريع
    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/projects');
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('❌ فشل جلب المشاريع', error);
        }
    };

    useEffect(() => {
        const adminFlag = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminFlag);
        fetchProjects();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        setIsAdmin(false);
        alert('👋 تم تسجيل الخروج');
    };

    return (
        <Router>
            <div>
                {/* شريط التنقل */}
                <nav style={{
                    backgroundColor: '#2f5d62',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    position: 'relative'
                }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                        📊 عرض المشاريع
                    </Link>

                    {isAdmin && (
                        <div
                            onMouseEnter={() => setShowDropdown(true)}
                            onMouseLeave={() => setShowDropdown(false)}
                            style={{ position: 'relative' }}
                        >
                            <span style={{ color: 'white', cursor: 'pointer' }}>
                                ⚙️ إدارة المشاريع ▾
                            </span>

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '30px',
                                    backgroundColor: 'white',
                                    color: '#2f5d62',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
                                    minWidth: '160px',
                                    zIndex: 1000
                                }}>
                                    

                                    <Link to="/add" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#2f5d62' }}>
                                        ➕ إضافة مشروع
                                    </Link>
                                    <Link
                                        to="/add-admin"
                                        style={{
                                            display: 'block',
                                            padding: '10px',
                                            textDecoration: 'none',
                                            color: '#2f5d62'
                                        }}
                                    >
                                        ➕ إضافة مدير
                                    </Link>

                                </div>
                            )}
                        </div>
                    )}

                    {!isAdmin ? (
                        <Link to="/admin-login" style={{ color: 'white', textDecoration: 'none' }}>
                            🔑 دخول
                        </Link>
                    ) : (
                        <span onClick={handleLogout} style={{ color: 'white', cursor: 'pointer' }}>
                            🚪 تسجيل الخروج
                        </span>
                    )}
                </nav>

                {/* المسارات */}
                <Routes>
                    {/* صفحة عامة لجميع المستخدمين */}
                    <Route path="/" element={<Navigate to="/projects" />} />
                    <Route path="/projects" element={<ProjectsList isAdmin={isAdmin} projects={projects} />} />

                    <Route path="/details/:id" element={<ProjectDetails />} />
                    <Route path="/edit/:id" element={isAdmin ? <ProjectEdit /> : <Navigate to="/" />} />
                    <Route path="/admin" element={isAdmin ? <AdminProjects fetchProjects={fetchProjects} /> : <Navigate to="/" />} />
                    <Route path="/add" element={isAdmin ? <AddProject /> : <Navigate to="/" />} />
                    <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
                    <Route path="/add-admin" element={isAdmin ? <AddAdmin /> : <Navigate to="/" />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;
