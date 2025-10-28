import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './ProjectDetails.css';

// تسجيل مكونات Chart.js التي ستستخدمها
ChartJS.register(ArcElement, Tooltip, Legend);

function ProjectDetails() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isProjectManager = localStorage.getItem('isProjectManager') === 'true';
    const currentUserId = localStorage.getItem('userId');

    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);

    useEffect(() => {
        // تم تصحيح بناء جملة القالب الحرفي في دالة fetch
        fetch(`http://localhost:4000/api/projects/${id}?userId=${currentUserId}`)
            .then(res => res.json())
            .then(data => {
                if (!isAdmin && isProjectManager && data.responsibleId !== currentUserId) {
                    alert('ليس لديك الصلاحية لعرض تفاصيل هذا المشروع.');
                    navigate('/');
                    return;
                }
                setProject(data);
            })
            .catch(() => alert('❌ فشل تحميل بيانات المشروع'));
    }, [id, isAdmin, isProjectManager, currentUserId, navigate]);

    if (!project) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>جاري تحميل التفاصيل...</p>;
    }

    const getStageColor = (status) => {
        switch (status) {
            case 'مكتمل': return '#d4edda'; // Light green
            case 'قيد التنفيذ': return '#fff3cd'; // Light yellow/orange
            case 'لم يبدأ': return '#cce5ff'; // Light blue
            case 'متأخر': return '#f8d7da'; // Light red
            default: return '#e0e0e0';
        }
    };
    const getStageBorderColor = (status) => {
        switch (status) {
            case 'مكتمل': return '#28a745'; // Darker green
            case 'قيد التنفيذ': return '#ffc107'; // Darker yellow/orange
            case 'لم يبدأ': return '#007bff'; // Darker blue
            case 'متأخر': return '#dc3545'; // Darker red
            default: return '#bdbdbd';
        }
    };
    const getContrastTextColor = (backgroundColor) => {
        const hex = backgroundColor.startsWith('#') ? backgroundColor.slice(1) : backgroundColor;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    };
    const getMainCardBackgroundColor = () => {
        return '#EDD8C5'; // تم تغيير اللون إلى ثابت
    };

    let projectFilesArray = Array.isArray(project.projectFiles) ? project.projectFiles : [];

    projectFilesArray = projectFilesArray.map(file => ({
        originalName: file.originalName,
        savedPath: file.savedPath?.startsWith('/') ? file.savedPath.substring(1) : file.savedPath
    }));

    let stagesArray = [];
    try {
        stagesArray = Array.isArray(project.stages) ? project.stages : JSON.parse(project.stages || '[]');
        stagesArray.sort((a, b) => (a.stageNumber || 0) - (b.stageNumber || 0));
    } catch (e) {
        console.error("Error parsing project.stages:", e);
        stagesArray = [];
    }

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const totalProjectProgress = (project.stages || []).reduce((sum, stage) => {
        const stageProgress = (stage.steps || []).reduce((stepSum, step) => {
            return stepSum + (step.actualPercentage || 0);
        }, 0);
        return sum + stageProgress;
    }, 0);

    const progressValue = totalProjectProgress;
    const remainingValue = 100 - progressValue;

    const chartData = {
        labels: ['التقدم المحقق', 'التقدم المتبقي'],
        datasets: [
            {
                data: [progressValue, remainingValue],
                backgroundColor: ['#28a745', '#e0e0e0'],
                borderColor: ['#28a745', '#e0e0e0'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed + '%';
                        }
                        return label;
                    }
                }
            }
        },
    };

    const toggleStageDetails = (stage) => {
        if (selectedStage && selectedStage._id === stage._id) {
            setSelectedStage(null);
        } else {
            setSelectedStage(stage);
        }
    };

    const canEdit = isAdmin || (isProjectManager && project.responsibleId === currentUserId);

    const tableHeaderStyle = {
        padding: '12px',
        border: '1px solid #ddd',
        backgroundColor: '#f0f2f5',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333'
    };
    const tableCellStyle = {
        padding: '12px',
        border: '1px solid #ddd',
        verticalAlign: 'top',
        fontSize: '15px'
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f0f2f5',
            minHeight: '100vh',
            direction: 'rtl',
            paddingBottom: '50px'
        }}>
            <header style={{
                backgroundColor: '#fff',
                padding: '20px 30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ color: '#0056b3', margin: 0, fontSize: '28px' }}>
                        {project.name}
                    </h1>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: '15px',
                }}>
                    <button onClick={() => navigate(-1)} style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        transition: 'background-color 0.3s ease'
                    }}>
                        ← رجوع إلى قائمة المشاريع
                    </button>
                    {canEdit && (
                        <>
                            {/* تم تصحيح بناء جملة القالب الحرفي في onClick */}
                            <button onClick={() => navigate(`/edit/${id}`)}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    transition: 'background-color 0.3s ease'
                                }}>
                                ✏️ تعديل المشروع
                            </button>
                            <button onClick={() => {
                                if (window.confirm('هل أنت متأكد من حذف المشروع؟')) {
                                    // تم تصحيح بناء جملة القالب الحرفي في دالة fetch
                                    fetch(`http://localhost:4000/api/deleteProject/${id}`, { method: 'DELETE' })
                                        .then(() => {
                                            alert('✅ تم حذف المشروع');
                                            navigate('/');
                                        })
                                        .catch(() => alert('❌ فشل حذف المشروع'));
                                }
                            }}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    transition: 'background-color 0.3s ease'
                                }}>
                                🗑️ حذف المشروع
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div style={{ padding: '30px', maxWidth: '1400px', margin: '20px auto' }}>
                <div style={{
                    backgroundColor: getMainCardBackgroundColor(project.status),
                    borderRadius: '12px',
                    padding: '30px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '15px'
                    }}>
                        <h2 style={{ color: '#0056b3', fontSize: '24px', margin: 0 }}>
                            <span style={{ marginLeft: '10px' }}>🗓️</span> الخط الزمني لمشروع {project.name}
                        </h2>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '15px', fontWeight: 'bold' }}>
                            <span style={{ color: getStageBorderColor('مكتمل') }}>● مكتمل</span>
                            <span style={{ color: getStageBorderColor('قيد التنفيذ') }}>● قيد التنفيذ</span>
                            <span style={{ color: getStageBorderColor('لم يبدأ') }}>● لم يبدأ</span>
                            <span style={{ color: getStageBorderColor('متأخر') }}>● متأخر</span>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        // تم تصحيح بناء جملة القالب الحرفي في gridTemplateColumns
                        gridTemplateColumns: `repeat(${stagesArray.length}, 1fr)`,
                        gap: '20px',
                        overflowX: 'auto',
                        padding: '10px 0',
                        marginBottom: '30px',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        {stagesArray.map((stage, index) => {
                            const totalProgress = (stage.steps || []).reduce((sum, step) => sum + (step.actualPercentage || 0), 0);

                            return (
                                <div
                                    key={stage._id || index}
                                    onClick={() => toggleStageDetails(stage)}
                                    style={{
                                        minWidth: '180px',
                                        padding: '20px 15px',
                                        backgroundColor: getStageColor(stage.status),
                                        borderRadius: '10px',
                                        // تم تصحيح بناء جملة القالب الحرفي في border
                                        border: `1px solid ${getStageBorderColor(stage.status)}`,
                                        boxShadow: selectedStage && selectedStage._id === stage._id ? '0 4px 15px rgba(0, 123, 255, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: 'auto',
                                        color: getContrastTextColor(getStageColor(stage.status)),
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        transform: selectedStage && selectedStage._id === stage._id ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <h4 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '18px',
                                        color: getStageBorderColor(stage.status),
                                        fontWeight: 'bold'
                                    }}>
                                        {stage.name}
                                        {selectedStage && selectedStage._id === stage._id ? ' ▲' : ' ▼'}
                                    </h4>
                                    <p style={{ margin: '0', fontSize: '14px' }}>
                                        {stage.description || 'وصف المرحلة'}
                                    </p>
                                    <p style={{
                                        margin: '10px 0',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: getContrastTextColor(getStageColor(stage.status))
                                    }}>
                                        نسبةالإنجاز: {totalProgress}%
                                    </p>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '13px',
                                        fontWeight: '600'
                                    }}>
                                        {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {selectedStage && (
                        <div style={{
                            backgroundColor: '#fdfdfd',
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            marginBottom: '30px',
                            // تم تصحيح بناء جملة القالب الحرفي في border
                            border: `1px solid ${getStageBorderColor(selectedStage.status)}`
                        }}>
                            <h3 style={{ color: '#0056b3', marginTop: '0', fontSize: '22px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginLeft: '10px' }}>📝</span> خطوات مرحلة: {selectedStage.name}
                                <button
                                    onClick={() => setSelectedStage(null)}
                                    style={{
                                        marginLeft: 'auto',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    إغلاق ✕
                                </button>
                            </h3>
                            {selectedStage.steps && selectedStage.steps.length > 0 ? (
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    marginTop: '20px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                                            <th style={tableHeaderStyle}>الاسم</th>
                                            <th style={tableHeaderStyle}>الوصف</th>
                                            <th style={tableHeaderStyle}>المسؤول</th>
                                            <th style={tableHeaderStyle}>النسبة المستهدفة</th>
                                            <th style={tableHeaderStyle}>المحقق</th>
                                            <th style={tableHeaderStyle}>التواريخ</th>
                                            <th style={tableHeaderStyle}>المستندات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedStage.steps.map((step, stepIndex) => (
                                            <tr key={step._id || stepIndex} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tableCellStyle}>{step.name}</td>
                                                <td style={tableCellStyle}>{step.description || 'لا يوجد وصف.'}</td>
                                                <td style={tableCellStyle}>{step.responsible || 'غير محدد'}</td>
                                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>{step.targetPercentage || 0}%</td>
                                                <td style={{ ...tableCellStyle, textAlign: 'center', fontWeight: 'bold', color: step.actualPercentage >= step.targetPercentage ? '#28a745' : '#ffc107' }}>
                                                    {step.actualPercentage || 0}%
                                                </td>
                                                <td style={tableCellStyle}>
                                                    {formatDate(step.startDate)} - {formatDate(step.endDate)}
                                                </td>
                                                <td style={tableCellStyle}>
                                                    {step.documents && step.documents.length > 0 ? (
                                                        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                                            {step.documents.map((doc, docIndex) => (
                                                                <li key={docIndex}>
                                                                    {/* تم تصحيح بناء جملة القالب الحرفي في href */}
                                                                    <a
                                                                        href={`http://localhost:4000/uploads/${doc.savedPath || doc.filePath}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ color: '#007bff', textDecoration: 'none' }}
                                                                    >
                                                                        {doc.originalName || doc.fileName}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span style={{ fontStyle: 'italic', color: '#777' }}>لا توجد</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ textAlign: 'center', marginTop: '20px', color: '#777' }}>
                                    لا توجد خطوات مضافة لهذه المرحلة بعد.
                                </p>
                            )}
                        </div>
                    )}

                    {/* هنا يبدأ قسم تفاصيل المشروع المعدل */}
                    <div style={{
                        backgroundColor: '#fdfdfd',
                        borderRadius: '10px',
                        padding: '25px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{
                            color: '#0056b3',
                            marginTop: '0',
                            fontSize: '20px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '10px',
                            width: '100%'
                        }}>
                            <span style={{ marginLeft: '10px' }}>📋</span> تفاصيل المشروع
                        </h3>

                        {/* السطر الأول: التاريخ والحالة */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: '20px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px', color: '#0056b3' }}>📅</span>
                                <p style={{ margin: 0, fontSize: '16px' }}><strong>تاريخ البدء:</strong> {formatDate(project.startDate)}</p>
                            </div>
                            <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px', color: '#0056b3' }}>📆</span>
                                <p style={{ margin: 0, fontSize: '16px' }}><strong>تاريخ الانتهاء:</strong> {formatDate(project.endDate)}</p>
                            </div>
                            <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px', color: '#0056b3' }}>📌</span>
                                <p style={{ margin: 0, fontSize: '16px' }}><strong>حالة المشروع:</strong> {project.status}</p>
                            </div>
                        </div>

                        {/* السطر الثاني: المدير والميزانية والملاحظات */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: '20px'
                        }}>
                            <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px', color: '#0056b3' }}>👤</span>
                                <p style={{ margin: 0, fontSize: '16px' }}><strong>مدير المشروع:</strong> {project.responsible}</p>
                            </div>
                            <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px', color: '#0056b3' }}>💰</span>
                                <p style={{ margin: 0, fontSize: '16px' }}><strong>الميزانية:</strong> {project.budget || 0} OMR</p>
                            </div>
                            <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ fontSize: '22px', color: '#0056b3', marginTop: '4px' }}>🗒️</span>
                                <p style={{ margin: 0, fontSize: '16px' }}><strong>ملاحظات:</strong> {project.notes || 'لا توجد ملاحظات مضافة'}</p>
                            </div>
                        </div>
                    </div>
                    {/* هنا ينتهي قسم تفاصيل المشروع المعدل */}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '30px',
                        marginTop: '30px',
                        alignItems: 'start'
                    }}>
                        <div style={{
                            backgroundColor: '#fdfdfd',
                            borderRadius: '10px',
                            padding: '25px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#0056b3', marginTop: '0', fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <span style={{ marginLeft: '10px' }}>📊</span> تقدم المشروع العام
                                </h3>
                                <div style={{
                                    backgroundColor: '#fff',
                                    padding: '20px',
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    textAlign: 'center',
                                    marginBottom: '30px'
                                }}>
                                    <h3 style={{ color: '#0056b3', marginTop: '0', marginBottom: '20px' }}>التقدم العام للمشروع</h3>
                                    <div style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                                        <Doughnut data={chartData} options={chartOptions} />
                                    </div>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginTop: '10px' }}>
                                        {progressValue}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{
                                backgroundColor: '#fdfdfd',
                                borderRadius: '10px',
                                padding: '25px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{ color: '#0056b3', marginTop: '0', fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <span style={{ marginLeft: '10px' }}>📝</span> تقرير بسيط عن التقدم
                                </h3>
                                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '15px', color: '#333' }}>
                                    {project.progressReport || 'لا يوجد تقرير تقدم مضاف حاليًا لهذه المرحلة.'}
                                </p>
                            </div>

                            {project.challenges && (
                                <div style={{
                                    backgroundColor: '#fdfdfd',
                                    borderRadius: '10px',
                                    padding: '25px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ color: '#d84315', marginTop: '0', fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        <span style={{ marginLeft: '10px' }}>🚧</span> تحديات تنفيذ المشروع
                                    </h3>
                                    <p style={{ margin: 0, lineHeight: '1.6', fontSize: '15px', color: '#333' }}>
                                        {project.challenges}
                                    </p>
                                </div>
                            )}

                            {projectFilesArray.length > 0 && (
                                <div style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                                    marginTop: '20px'
                                }}>
                                    <h3 style={{
                                        color: '#0056b3',
                                        fontSize: '20px',
                                        marginBottom: '15px',
                                        borderBottom: '1px solid #eee',
                                        paddingBottom: '8px'
                                    }}>
                                        <span style={{ marginLeft: '8px' }}>📂</span> الملفات المرفقة
                                    </h3>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '15px'
                                    }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>#</th>
                                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>اسم الملف</th>
                                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>فتح الملف</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projectFilesArray.map((fileObj, index) => (
                                                <tr key={index}>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{fileObj.originalName}</td>
                                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                                        <a
                                                            href={`http://localhost:4000/uploads/${fileObj.savedPath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                color: '#28a745',
                                                                textDecoration: 'none',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            📥 فتح
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetails;
