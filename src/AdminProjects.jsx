import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminProjects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (isAdmin !== 'true') {
            navigate('/admin-login');
        } else {
            fetchProjects();
        }
    }, [navigate]);

    const fetchProjects = () => {
        fetch('http://localhost:4000/api/projects')
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(() => alert('❌ فشل جلب المشاريع'));
    };

    const deleteProject = (id) => {
        if (window.confirm('❗ هل أنت متأكد من حذف المشروع؟')) {
            fetch(`http://localhost:4000/api/deleteProject/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || '✅ تم حذف المشروع');
                    fetchProjects();  // إعادة التحديث بعد الحذف
                })
                .catch(() => alert('❌ فشل حذف المشروع'));
        }
    };

    const addNewAdmin = () => {
        const newAdmin = prompt('🚀 أدخل اسم مستخدم المدير الجديد:');
        const newPassword = prompt('🔒 أدخل كلمة مرور المدير الجديد:');
        if (newAdmin && newPassword) {
            localStorage.setItem(`admin_${newAdmin}`, newPassword);
            alert('✅ تم إضافة مدير جديد بنجاح!');
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <h1 style={{ color: '#2f5d62' }}>🛠️ إدارة المشاريع</h1>

            <button
                onClick={() => navigate('/add')}
                style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}
            >
                ➕ إضافة مشروع جديد
            </button>

            <button
                onClick={addNewAdmin}
                style={{
                    backgroundColor: '#388e3c',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    marginLeft: '10px'
                }}
            >
                👤 إضافة مدير جديد
            </button>

            {projects.length === 0 && <p>🚧 لا توجد مشاريع حالياً.</p>}

            {projects.map(project => (
                <div key={project.id} style={{
                    border: '1px solid #ccc',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    backgroundColor: 'white'
                }}>
                    <h3>{project.name}</h3>
                    <p><strong>الوصف:</strong> {project.description}</p>
                    <p><strong>المسؤول:</strong> {project.responsible}</p>

                    <button
                        onClick={() => navigate(`/edit/${project.id}`)}
                        style={{
                            marginRight: '10px',
                            backgroundColor: '#ffa000',
                            color: 'white',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        ✏️ تعديل
                    </button>

                    <button
                        onClick={() => deleteProject(project.id)}
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                            padding: '5px 10px',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        🗑️ حذف
                    </button>
                </div>
            ))}
        </div>
    );
}

export default AdminProjects;
