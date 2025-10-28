import React, { useState } from 'react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function AddProject() {
    const navigate = useNavigate();

    // --- الحالة الأساسية ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [responsible, setResponsible] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [directory, setDirectory] = useState('');
    const [budget, setBudget] = useState('');
    const [progressReport, setProgressReport] = useState('');
    const [challenges, setChallenges] = useState('');
    const [projectFiles, setProjectFiles] = useState([]);
    const [stages, setStages] = useState([{
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'لم يبدأ',
        stageNumber: 1,
        steps: [{
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            targetPercentage: 0,
            actualPercentage: 0,
            responsible: '',
            documents: []
        }]
    }]);

    const directorates = [
        'المديرية العامة للمناقصات',
        'المديرية العامة للشؤون الإدارية والمالية',
        'المديرية العامة للإحصاء والنظم التلكترونية',
        'المكتب الوطني للمحتوى المحلي',
        'مكتب متابعة المشاريع',
        'مكتب رئيس الهيئة',
    ];

    // ======== دوال المراحل والخطوات ========
    const handleStageChange = (index, field, value) => {
        const updated = [...stages];
        updated[index][field] = value;
        setStages(updated);
    };

    const addStage = () => {
        setStages([...stages, {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            status: 'لم يبدأ',
            stageNumber: stages.length + 1,
            steps: [{
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                targetPercentage: 0,
                actualPercentage: 0,
                responsible: '',
                documents: []
            }]
        }]);
    };

    const removeStage = (index) => {
        const updated = stages.filter((_, i) => i !== index)
            .map((stage, i) => ({ ...stage, stageNumber: i + 1 }));
        setStages(updated);
    };

    const handleStepChange = (stageIndex, stepIndex, field, value) => {
        const updated = [...stages];
        updated[stageIndex].steps[stepIndex][field] = value;
        setStages(updated);
    };

    const addStep = (stageIndex) => {
        const updated = [...stages];
        updated[stageIndex].steps.push({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            targetPercentage: 0,
            actualPercentage: 0,
            responsible: '',
            documents: []
        });
        setStages(updated);
    };

    const removeStep = (stageIndex, stepIndex) => {
        const updated = [...stages];
        updated[stageIndex].steps = updated[stageIndex].steps.filter((_, i) => i !== stepIndex);
        setStages(updated);
    };

    const handleStepDocumentFileChange = (stageIndex, stepIndex, event) => {
        const files = Array.from(event.target.files);
        const updated = [...stages];
        files.forEach(file => {
            updated[stageIndex].steps[stepIndex].documents.push(file);
        });
        setStages(updated);
    };

    const removeStepDocument = (stageIndex, stepIndex, docIndex) => {
        const updated = [...stages];
        updated[stageIndex].steps[stepIndex].documents =
            updated[stageIndex].steps[stepIndex].documents.filter((_, i) => i !== docIndex);
        setStages(updated);
    };

    // ======== إرسال النموذج ========
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('responsible', responsible);
            formData.append('directory', directory);
            formData.append('startDate', startDate);
            formData.append('endDate', endDate);
            formData.append('status', status);
            formData.append('budget', budget);
            formData.append('progressReport', progressReport);
            formData.append('challenges', challenges);

            // رفع ملفات المشروع
            projectFiles.forEach(file => formData.append('projectFiles', file));

            // رفع ملفات الخطوات والمراحل
            stages.forEach((stage, sIndex) => {
                stage.steps.forEach((step, stIndex) => {
                    step.documents.forEach(file => {
                        formData.append(`stage_${sIndex}_step_${stIndex}_docs`, file);
                    });
                });
            });

            // إضافة المراحل والخطوات كـ JSON
            formData.append('stages', JSON.stringify(stages.map(stage => ({
                ...stage,
                steps: stage.steps.map(step => ({
                    ...step,
                    documents: step.documents.map(file => file.name) // حفظ أسماء الملفات فقط في JSON
                }))
            }))));

            const res = await fetch('http://localhost:4000/api/addProject', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                alert('✅ تم إضافة المشروع بنجاح!');
                navigate('/projects', { state: { refresh: true } });
            } else {
                alert('❌ حدث خطأ: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('❌ حدث خطأ أثناء إضافة المشروع');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>➕ إضافة مشروع جديد</h2>
            <form onSubmit={handleSubmit}>
                {/* ===== معلومات المشروع ===== */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>معلومات المشروع الأساسية</h3>
                    <input type="text" placeholder="اسم المشروع" value={name} onChange={e => setName(e.target.value)} required style={styles.input} />
                    <textarea placeholder="وصف المشروع" value={description} onChange={e => setDescription(e.target.value)} required style={styles.textarea} />
                    <input type="text" placeholder="مدير المشروع" value={responsible} onChange={e => setResponsible(e.target.value)} required style={styles.input} />

                    <div style={styles.dateGroup}>
                        <div>
                            <label style={styles.label}>تاريخ البداية:</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
                        </div>
                        <div>
                            <label style={styles.label}>تاريخ النهاية:</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
                        </div>
                    </div>

                    <label style={styles.label}>حالة المشروع:</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={styles.select} required>
                        <option value="">اختر حالة المشروع</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                        <option value="لم يبدأ">لم يبدأ</option>
                        <option value="متأخر">متأخر</option>
                    </select>

                    <label style={styles.label}>المديرية:</label>
                    <select value={directory} onChange={e => setDirectory(e.target.value)} style={styles.select} required>
                        <option value="">اختر المديرية...</option>
                        {directorates.map(dir => <option key={dir} value={dir}>{dir}</option>)}
                    </select>

                    <input type="number" placeholder="الميزانية" value={budget} onChange={e => setBudget(e.target.value)} style={styles.input} />
                    <textarea placeholder="تقرير تقدم المشروع" value={progressReport} onChange={e => setProgressReport(e.target.value)} style={styles.textarea} />
                    <textarea placeholder="تحديات المشروع" value={challenges} onChange={e => setChallenges(e.target.value)} style={styles.textarea} />
                </div>

                {/* ===== ملفات المشروع ===== */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>ملفات المشروع</h3>
                    <input type="file" multiple onChange={e => setProjectFiles([...projectFiles, ...e.target.files])} style={styles.fileInput} />
                    {projectFiles.length > 0 && (
                        <ul style={styles.fileList}>
                            {projectFiles.map((file, i) => (
                                <li key={i} style={styles.fileListItem}>
                                    <span>{file.name}</span>
                                    <button type="button" style={styles.removeFileButton} onClick={() => setProjectFiles(projectFiles.filter((_, idx) => idx !== i))}><FaTrashAlt /></button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ===== المراحل ===== */}
                {stages.map((stage, sIndex) => (
                    <div key={sIndex} style={styles.stageCard}>
                        <button type="button" style={styles.removeStageButton} onClick={() => removeStage(sIndex)}>×</button>
                        <h4 style={styles.stageTitle}>المرحلة {sIndex + 1}</h4>
                        <input type="text" placeholder="اسم المرحلة" value={stage.name} onChange={e => handleStageChange(sIndex, 'name', e.target.value)} style={styles.input} />
                        <textarea placeholder="وصف المرحلة" value={stage.description} onChange={e => handleStageChange(sIndex, 'description', e.target.value)} style={styles.textarea} />
                        <div style={styles.dateGroup}>
                            <input type="date" value={stage.startDate} onChange={e => handleStageChange(sIndex, 'startDate', e.target.value)} style={styles.input} />
                            <input type="date" value={stage.endDate} onChange={e => handleStageChange(sIndex, 'endDate', e.target.value)} style={styles.input} />
                        </div>
                        <select value={stage.status} onChange={e => handleStageChange(sIndex, 'status', e.target.value)} style={styles.select}>
                            <option value="">اختر حالة المرحلة</option>
                            <option value="مكتمل">مكتمل</option>
                            <option value="قيد التنفيذ">قيد التنفيذ</option>
                            <option value="لم يبدأ">لم يبدأ</option>
                            <option value="متأخر">متأخر</option>
                        </select>

                        {/* ===== الخطوات ===== */}
                        <div style={styles.stepsContainer}>
                            {stage.steps.map((step, stIndex) => (
                                <div key={stIndex} style={styles.stepCard}>
                                    <button type="button" style={styles.removeStepButton} onClick={() => removeStep(sIndex, stIndex)}>×</button>
                                    <h5 style={styles.stepTitle}>الخطوة {stIndex + 1}</h5>
                                    <input type="text" placeholder="اسم الخطوة" value={step.name} onChange={e => handleStepChange(sIndex, stIndex, 'name', e.target.value)} style={styles.input} />
                                    <textarea placeholder="وصف الخطوة" value={step.description} onChange={e => handleStepChange(sIndex, stIndex, 'description', e.target.value)} style={styles.textarea} />
                                    <div style={styles.dateGroup}>
                                        <input type="date" value={step.startDate} onChange={e => handleStepChange(sIndex, stIndex, 'startDate', e.target.value)} style={styles.input} />
                                        <input type="date" value={step.endDate} onChange={e => handleStepChange(sIndex, stIndex, 'endDate', e.target.value)} style={styles.input} />
                                    </div>
                                    <input type="number" placeholder="النسبة المستهدفة" value={step.targetPercentage} onChange={e => handleStepChange(sIndex, stIndex, 'targetPercentage', e.target.value)} style={styles.input} />
                                    <input type="number" placeholder="النسبة الفعلية" value={step.actualPercentage} onChange={e => handleStepChange(sIndex, stIndex, 'actualPercentage', e.target.value)} style={styles.input} />
                                    <input type="text" placeholder="المسؤول" value={step.responsible} onChange={e => handleStepChange(sIndex, stIndex, 'responsible', e.target.value)} style={styles.input} />

                                    {/* ملفات الخطوة */}
                                    <input type="file" multiple onChange={e => handleStepDocumentFileChange(sIndex, stIndex, e)} style={styles.fileInput} />
                                    {step.documents.length > 0 && (
                                        <ul style={styles.fileList}>
                                            {step.documents.map((doc, idx) => (
                                                <li key={idx} style={styles.fileListItem}>
                                                    <span>{doc.name}</span>
                                                    <button type="button" style={styles.removeFileButton} onClick={() => removeStepDocument(sIndex, stIndex, idx)}><FaTrashAlt /></button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                            <button type="button" style={styles.addButton} onClick={() => addStep(sIndex)}><FaPlus /> إضافة خطوة</button>
                        </div>
                    </div>
                ))}

                <button type="button" style={styles.addStageButton} onClick={addStage}><FaPlus /> إضافة مرحلة</button>
                <button type="submit" style={styles.submitButton}>إضافة المشروع</button>
            </form>
        </div>
    );
}

// استخدم كائن styles كما في كودك الأصلي
const styles = { 
    container: {
        maxWidth: '900px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        direction: 'rtl'
    },
    title: {
        textAlign: 'center',
        color: '#0056b3',
        marginBottom: '25px',
        borderBottom: '2px solid #eee',
        paddingBottom: '15px'
    },
    card: {
        marginBottom: '25px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: '#fff'
    },
    cardTitle: {
        color: '#333',
        marginTop: '0',
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontSize: '15px',
        textAlign: 'right'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        minHeight: '80px',
        fontSize: '15px',
        textAlign: 'right'
    },
    select: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        fontSize: '15px',
        textAlignLast: 'right',
        direction: 'rtl'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555',
        fontSize: '14px',
        textAlign: 'right'
    },
    dateGroup: {
        display: 'flex',
        gap: '15px',
    },
    fileInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
    },
    fileList: {
        listStyleType: 'none',
        padding: '0',
        marginTop: '10px',
    },
    fileListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: '5px 10px',
        borderRadius: '3px',
        marginBottom: '5px',
        fontSize: '14px'
    },
    removeFileButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    stageCard: {
        border: '1px dashed #a0a0a0',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff',
        position: 'relative'
    },
    stageTitle: {
        marginTop: '0',
        marginBottom: '15px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        color: '#007bff'
    },
    stepsContainer: {
        border: '1px solid #bbe0ff',
        borderRadius: '6px',
        padding: '15px',
        marginTop: '20px',
        backgroundColor: '#e6f7ff'
    },
    stepsTitle: {
        color: '#0056b3',
        marginTop: '0',
        marginBottom: '15px'
    },
    stepCard: {
        border: '1px solid #99d0ff',
        padding: '12px',
        marginBottom: '10px',
        borderRadius: '5px',
        backgroundColor: '#f5fbff',
        position: 'relative'
    },
    stepTitle: {
        marginTop: '0',
        marginBottom: '10px',
        borderBottom: '1px dashed #cce5ff',
        paddingBottom: '5px',
        color: '#007bff'
    },
    documentsContainer: {
        border: '1px solid #cce5ff',
        borderRadius: '5px',
        padding: '10px',
        marginTop: '15px',
        backgroundColor: '#ebf8ff'
    },
    documentsTitle: {
        color: '#6a1b9a',
        marginTop: '0',
        marginBottom: '10px'
    },
    addButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 15px',
        cursor: 'pointer',
        fontSize: '14px',
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginLeft: 'auto'
    },
    removeStepButton: {
        position: 'absolute',
        top: '5px',
        left: '5px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '25px',
        height: '25px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '14px',
        cursor: 'pointer'
    },
    removeStageButton: {
        position: 'absolute',
        top: '5px',
        left: '5px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '16px',
        cursor: 'pointer'
    },
    addStageButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        margin: '20px auto 0'
    },
    submitButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#0056b3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: '30px',
        transition: 'background-color 0.3s ease'
    },
};

export default AddProject;
