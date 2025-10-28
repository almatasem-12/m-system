import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaPlus, FaTrashAlt } from 'react-icons/fa';

function ProjectsList({ isAdmin }) {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // لمعرفة إذا تم العودة من صفحة إضافة مشروع

    // --- دالة لجلب المشاريع من السيرفر ---
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/api/projects');
            if (!res.ok) throw new Error('فشل جلب المشاريع');
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError('❌ حدث خطأ أثناء تحميل المشاريع');
        } finally {
            setLoading(false);
        }
    };

    // --- جلب المشاريع عند التحميل ---
    useEffect(() => {
        fetchProjects();
    }, []);

    // --- إعادة الجلب إذا عدنا من صفحة إضافة مشروع ---
    useEffect(() => {
        if (location.state?.refresh) {
            fetchProjects();
            // إزالة العلم حتى لا يعيد الجلب عند أي تحديث لاحق
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    // --- البحث ---
    const filteredProjects = projects.filter(project => {
        const query = (searchQuery || '').toLowerCase();
        return (project.name || '').toLowerCase().includes(query) ||
            (project.responsible || '').toLowerCase().includes(query) ||
            (project.directory || '').toLowerCase().includes(query);
    });

    // --- ألوان الحالة ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'مكتمل': return '#28a745';
            case 'متأخر': return '#dc3545';
            case 'قيد التنفيذ': return '#ffc107';
            default: return '#6c757d';
        }
    };

    // --- حذف المشروع ---
    const handleDelete = async (projectId) => {
        if (!window.confirm('هل أنت متأكد من حذف المشروع؟')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/deleteProject/${projectId}`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.message);
            fetchProjects(); // تحديث القائمة بعد الحذف
        } catch (err) {
            console.error(err);
            alert('❌ فشل الحذف');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <p style={{ padding: '30px' }}>⏳ جاري تحميل المشاريع...</p>;
    if (error) return <p style={{ padding: '30px', color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '30px', direction: 'rtl', textAlign: 'right' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>📋 قائمة المشاريع</h1>
                {isAdmin && (
                    <button onClick={() => navigate('/add', { state: { fromList: true } })} style={addBtnStyle}>
                        <FaPlus /> مشروع جديد
                    </button>
                )}
            </header>

            <div style={{ position: 'relative', width: '300px', marginTop: '20px' }}>
                <input
                    type="text"
                    placeholder="ابحث باسم المشروع أو المسؤول أو المديرية"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={searchInputStyle}
                />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '30px' }}>
                {filteredProjects.length === 0 ? (
                    <p>لا توجد مشاريع مطابقة للبحث.</p>
                ) : (
                    filteredProjects.map(project => {
                        const totalSteps = project.stages?.reduce((acc, stage) => acc + (stage.steps?.length || 0), 0) || 0;
                        const totalProgressValue = project.stages?.reduce((sum, stage) => {
                            return sum + (stage.steps?.reduce((stepSum, step) => stepSum + (step.actualPercentage || 0), 0) || 0);
                        }, 0) || 0;
                        const progressPercent = totalSteps ? Math.round(totalProgressValue / totalSteps) : 0;

                        return (
                            <div key={project.id} style={{ position: 'relative', width: '320px' }}>
                                <div
                                    onClick={() => navigate(`/details/${project.id}`)}
                                    style={cardStyle}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.03)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    {isAdmin && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} style={deleteBtnStyle}>×</button>
                                    )}
                                    <h3 style={{ color: '#0d47a1', margin: '0 0 10px 0' }}>📌 {project.name || 'بدون اسم'}</h3>
                                    <p><strong>👤 المسؤول :</strong> {project.responsible || 'غير محدد'}</p>
                                    <p><strong>🏢 المديرية :</strong> {project.directory || 'غير محدد'}</p>
                                    <p><strong>📆 من:</strong> {formatDate(project.startDate)} <strong>إلى:</strong> {formatDate(project.endDate)}</p>
                                    <p><strong>💰 الميزانية:</strong> {project.budget || 0} OMR</p>
                                    <div style={{ margin: '10px 0' }}>
                                        <strong>📊 نسبة التقدم:</strong>
                                        <div style={{ backgroundColor: '#e9ecef', borderRadius: '5px', overflow: 'hidden', height: '12px', marginTop: '5px' }}>
                                            <div style={{ width: `${progressPercent}%`, backgroundColor: getStatusColor(project.status), height: '100%', transition: 'width 0.5s ease' }} />
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>{progressPercent}%</p>
                                    </div>
                                    <p style={{ color: getStatusColor(project.status), fontWeight: 'bold', fontSize: '16px' }}>📍 الحالة: {project.status || 'غير محدد'}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

const addBtnStyle = { padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const searchInputStyle = { width: '100%', padding: '10px 40px 10px 15px', borderRadius: '20px', border: '1px solid #ddd', textAlign: 'right', outline: 'none' };
const cardStyle = { backgroundColor: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', borderTop: '6px solid #6c757d', transition: 'transform 0.2s ease, box-shadow 0.2s ease' };
const deleteBtnStyle = { position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' };

export default ProjectsList;
