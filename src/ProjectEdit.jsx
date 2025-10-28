import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProjectEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const directorates = [
        'المديرية العامة للمناقصات',
        'المديرية العامة للشؤون الإدارية والمالية',
        'المديرية العامة للإحصاء والنظم التلكترونية',
        'المكتب الوطني للمحتوى المحلي ',
        'مكتب متابعة المشاريع',
        'مكتب رئيس الهيئة',
    ];

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

    const [existingProjectFiles, setExistingProjectFiles] = useState([]);
    const [newProjectFiles, setNewProjectFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:4000/api/projects/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setName(data.name || '');
                setDescription(data.description || '');
                setResponsible(data.responsible || '');
                setStartDate(data.startDate || '');
                setEndDate(data.endDate || '');
                setStatus(data.status || '');
                setDirectory(data.directory || '');
                setBudget(data.budget || '');
                setProgressReport(data.progressReport || '');
                setChallenges(data.challenges || '');

                let loadedStages = [];
                try {
                    loadedStages = Array.isArray(data.stages) ? data.stages : JSON.parse(data.stages || '[]');
                } catch (e) {
                    console.error("Error parsing stages:", e);
                    loadedStages = [];
                }

                const formattedStages = loadedStages.length > 0
                    ? loadedStages.map((s, idx) => ({
                        name: s.name || '',
                        description: s.description || '',
                        startDate: s.startDate || '',
                        endDate: s.endDate || '',
                        status: s.status || 'لم يبدأ',
                        stageNumber: s.stageNumber || (idx + 1),
                        steps: (Array.isArray(s.steps) ? s.steps : []).map(step => ({
                            name: step.name || '',
                            description: step.description || '',
                            startDate: step.startDate || '',
                            endDate: step.endDate || '',
                            targetPercentage: step.targetPercentage || 0,
                            actualPercentage: step.actualPercentage || 0,
                            responsible: step.responsible || '',
                            documents: (Array.isArray(step.documents) ? step.documents : []).map(doc => ({
                                previewName: doc.originalName || doc.fileName || 'ملف',
                                originalName: doc.originalName,
                                savedPath: doc.savedPath,
                                file: null
                            }))
                        }))
                    }))
                    : [{
                        name: '', description: '', startDate: '', endDate: '', status: 'لم يبدأ', stageNumber: 1,
                        steps: [{
                            name: '', description: '', startDate: '', endDate: '',
                            targetPercentage: 0, actualPercentage: 0, responsible: '', documents: []
                        }]
                    }];
                setStages(formattedStages);

                let loadedProjectFiles = [];
                try {
                    loadedProjectFiles = Array.isArray(data.projectFiles) ? data.projectFiles : JSON.parse(data.projectFiles || '[]');
                } catch (e) {
                    console.error("Error parsing project files:", e);
                    loadedProjectFiles = [];
                }
                setExistingProjectFiles(loadedProjectFiles);
            })
            .catch(error => {
                alert('❌ فشل تحميل بيانات المشروع: ' + error.message);
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleStageChange = (index, field, value) => {
        const updatedStages = [...stages];
        updatedStages[index][field] = value;
        setStages(updatedStages);
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

    const removeStage = (indexToRemove) => {
        setStages(stages.filter((_, index) => index !== indexToRemove)
            .map((stage, idx) => ({ ...stage, stageNumber: idx + 1 }))
        );
    };

    const handleStepChange = (stageIndex, stepIndex, field, value) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps[stepIndex][field] = value;
        setStages(updatedStages);
    };

    const addStep = (stageIndex) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps.push({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            targetPercentage: 0,
            actualPercentage: 0,
            responsible: '',
            documents: []
        });
        setStages(updatedStages);
    };

    const removeStep = (stageIndex, stepIndexToRemove) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps = updatedStages[stageIndex].steps.filter((_, index) => index !== stepIndexToRemove);
        setStages(updatedStages);
    };

    const handleStepDocumentFileChange = (stageIndex, stepIndex, docIndex, file) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps[stepIndex].documents[docIndex] = {
            previewName: file ? file.name : '',
            originalName: file ? file.name : '',
            file: file,
            savedPath: null,
        };
        setStages(updatedStages);
    };

    const handleStepDocumentNameChange = (stageIndex, stepIndex, docIndex, name) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps[stepIndex].documents[docIndex].previewName = name;
        setStages(updatedStages);
    };

    const addStepDocument = (stageIndex, stepIndex) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps[stepIndex].documents.push({
            previewName: '',
            originalName: '',
            savedPath: null,
            file: null
        });
        setStages(updatedStages);
    };

    const removeStepDocument = (stageIndex, stepIndex, docIndexToRemove) => {
        const updatedStages = [...stages];
        updatedStages[stageIndex].steps[stepIndex].documents = updatedStages[stageIndex].steps[stepIndex].documents.filter((_, index) => index !== docIndexToRemove);
        setStages(updatedStages);
    };

    const handleNewProjectFilesChange = (e) => {
        setNewProjectFiles([...e.target.files]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('responsible', responsible);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('status', status);
        formData.append('budget', budget);
        formData.append('progressReport', progressReport);
        formData.append('challenges', challenges);
        formData.append('directory', directory);

        const stagesToSubmit = stages.map(stage => ({
            ...stage,
            steps: stage.steps.map(step => ({
                ...step,
                documents: step.documents.map(doc => {
                    if (doc.file) {
                        return { previewName: doc.previewName || doc.originalName, originalName: doc.originalName };
                    } else if (doc.savedPath) {
                        return { previewName: doc.previewName || doc.originalName, originalName: doc.originalName, savedPath: doc.savedPath };
                    }
                    return null;
                }).filter(Boolean)
            }))
        }));

        formData.append('stages', JSON.stringify(stagesToSubmit));
        formData.append('existingProjectFilesJson', JSON.stringify(existingProjectFiles));
        newProjectFiles.forEach(file => {
            formData.append('projectFiles', file);
        });

        stages.forEach((stage, stageIndex) => {
            stage.steps.forEach((step, stepIndex) => {
                step.documents.forEach((doc, docIndex) => {
                    if (doc.file) {
                        formData.append(`stepDocuments[${stageIndex}][${stepIndex}][${docIndex}]`, doc.file);
                    }
                });
            });
        });

        try {
            const res = await fetch(`http://localhost:4000/api/updateProject/${id}`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                navigate(`/details/${id}`);
            } else {
                throw new Error(data.message || 'فشل تحديث المشروع');
            }
        } catch (error) {
            alert('❌ فشل تحديث المشروع: ' + error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProjectFile = (fileNameToDelete) => {
        setExistingProjectFiles(existingProjectFiles.filter(file => file.originalName !== fileNameToDelete));
    };

    const handleDelete = () => {
        if (window.confirm('❗ هل أنت متأكد من حذف المشروع؟ سيتم حذف جميع المراحل والخطوات والملفات المرتبطة به.')) {
            fetch(`http://localhost:4000/api/deleteProject/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(() => {
                    alert('🗑️ تم حذف المشروع بنجاح');
                    navigate('/');
                })
                .catch(error => {
                    alert('❌ فشل حذف المشروع: ' + error.message);
                    console.error(error);
                });
        }
    };

    if (loading && name === '') {
        return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '20px', color: '#007bff' }}>جاري تحميل بيانات المشروع...</div>;
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.h2}>✏️ تعديل المشروع</h2>
            <form onSubmit={handleUpdate}>

                {/* Project General Information */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>معلومات المشروع الأساسية</h3>
                    <label style={styles.label}>اسم المشروع:</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="اسم المشروع" required style={styles.input} />

                    <label style={styles.label}>وصف المشروع:</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف المشروع" required style={styles.textarea} />

                    <label style={styles.label}>مدير المشروع:</label>
                    <input type="text" value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="المسؤول" required style={styles.input} />

                    <label style={styles.label}>تاريخ بداية المشروع:</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />

                    <label style={styles.label}>تاريخ نهاية المشروع:</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />

                    <label style={styles.label}>حالة المشروع الكلية:</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={styles.select} required>
                        <option value="">اختر حالة المشروع</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                        <option value="لم يبدأ">لم يبدأ</option>
                        <option value="متأخر">متأخر</option>
                        <option value="قيد المراجعة">قيد المراجعة</option>
                    </select>

                    <label style={styles.label}>الميزانية (OMR):</label>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="الميزانية" min="0" style={styles.input} />

                    <label style={styles.label}>تقرير تقدم المشروع:</label>
                    <textarea value={progressReport} onChange={e => setProgressReport(e.target.value)} placeholder="تقرير التقدم" style={styles.textarea} />

                    <label style={styles.label}>تحديات المشروع:</label>
                    <textarea value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="تحديات المشروع" style={styles.textarea} />

                    {/* ✅ تم إضافة حقل DIRECTORY الجديد */}
                    <label style={styles.label}>المديرية:</label>
                    <select value={directory} onChange={e => setDirectory(e.target.value)} style={styles.select} required>
                        <option value="">اختر المديرية</option>
                        {directorates.map((dir, index) => (
                            <option key={index} value={dir}>{dir}</option>
                        ))}
                    </select>

                </div>

                {/* Project Stages */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>المراحل الزمنية للمشروع</h3>
                    {stages.map((stage, stageIndex) => (
                        <div key={stageIndex} style={styles.stageContainer}>
                            <h4 style={styles.stageTitle}>
                                المرحلة {stageIndex + 1}
                            </h4>
                            <label style={styles.label}>اسم المرحلة:</label>
                            <input
                                type="text"
                                placeholder="اسم المرحلة"
                                value={stage.name}
                                onChange={e => handleStageChange(stageIndex, 'name', e.target.value)}
                                style={styles.input}
                                required
                            />
                            <label style={styles.label}>وصف المرحلة:</label>
                            <textarea
                                placeholder="وصف المرحلة"
                                value={stage.description}
                                onChange={e => handleStageChange(stageIndex, 'description', e.target.value)}
                                style={styles.textarea}
                            />
                            <label style={styles.label}>تاريخ بدء المرحلة:</label>
                            <input
                                type="date"
                                value={stage.startDate}
                                onChange={e => handleStageChange(stageIndex, 'startDate', e.target.value)}
                                style={styles.input}
                                required
                            />
                            <label style={styles.label}>تاريخ نهاية المرحلة:</label>
                            <input
                                type="date"
                                value={stage.endDate}
                                onChange={e => handleStageChange(stageIndex, 'endDate', e.target.value)}
                                style={styles.input}
                                required
                            />
                            <label style={styles.label}>حالة المرحلة:</label>
                            <select
                                value={stage.status}
                                onChange={e => handleStageChange(stageIndex, 'status', e.target.value)}
                                style={styles.select}
                                required
                            >
                                <option value="">اختر حالة المرحلة</option>
                                <option value="مكتمل">مكتمل</option>
                                <option value="قيد التنفيذ">قيد التنفيذ</option>
                                <option value="لم يبدأ">لم يبدأ</option>
                                <option value="متأخر">متأخر</option>
                             
                            </select>

                            {/* Steps for this Stage */}
                            <div style={styles.stepsSection}>
                                <h5 style={styles.stepsTitle}>الخطوات لهذه المرحلة:</h5>
                                {stage.steps.map((step, stepIndex) => (
                                    <div key={stepIndex} style={styles.stepContainer}>
                                        <h6 style={styles.stepTitle}>
                                            خطوة {stepIndex + 1}
                                        </h6>
                                        <label style={styles.label}>اسم الخطوة:</label>
                                        <input type="text" placeholder="اسم الخطوة" value={step.name} onChange={e => handleStepChange(stageIndex, stepIndex, 'name', e.target.value)} style={styles.input} required />
                                        <label style={styles.label}>وصف الخطوة:</label>
                                        <textarea placeholder="وصف الخطوة" value={step.description} onChange={e => handleStepChange(stageIndex, stepIndex, 'description', e.target.value)} style={styles.textarea} />
                                        <label style={styles.label}>المسؤول عن الخطوة:</label>
                                        <input type="text" placeholder="المسؤول عن الخطوة" value={step.responsible} onChange={e => handleStepChange(stageIndex, stepIndex, 'responsible', e.target.value)} style={styles.input} />
                                        <label style={styles.label}>تاريخ بدء الخطوة:</label>
                                        <input type="date" value={step.startDate} onChange={e => handleStepChange(stageIndex, stepIndex, 'startDate', e.target.value)} style={styles.input} />
                                        <label style={styles.label}>تاريخ نهاية الخطوة:</label>
                                        <input type="date" value={step.endDate} onChange={e => handleStepChange(stageIndex, stepIndex, 'endDate', e.target.value)} style={styles.input} />
                                        <label style={styles.label}>النسبة المستهدفة (%):</label>
                                        <input type="number" placeholder="النسبة المستهدفة (%)" value={step.targetPercentage} onChange={e => handleStepChange(stageIndex, stepIndex, 'targetPercentage', parseInt(e.target.value) || 0)} min="0" max="100" style={styles.input} />
                                        <label style={styles.label}>النسبة الفعلية (%):</label>
                                        <input type="number" placeholder="النسبة الفعلية (%)" value={step.actualPercentage} onChange={e => handleStepChange(stageIndex, stepIndex, 'actualPercentage', parseInt(e.target.value) || 0)} min="0" max="100" style={styles.input} />

                                        {/* Documents for this Step */}
                                        <div style={styles.documentsSection}>
                                            <h6 style={styles.documentsTitle}>المستندات الداعمة للخطوة:</h6>
                                            {step.documents.map((doc, docIndex) => (
                                                <div key={docIndex} style={styles.documentItem}>
                                                    <input
                                                        type="text"
                                                        placeholder="اسم عرض للملف"
                                                        value={doc.previewName || ''}
                                                        onChange={e => handleStepDocumentNameChange(stageIndex, stepIndex, docIndex, e.target.value)}
                                                        style={styles.documentInput}
                                                    />
                                                    {doc.savedPath && (
                                                        <a
                                                            href={`http://localhost:4000/uploads/${doc.savedPath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={styles.documentLink}
                                                        >
                                                            {doc.originalName || "الملف الحالي"}
                                                        </a>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={e => handleStepDocumentFileChange(stageIndex, stepIndex, docIndex, e.target.files[0])}
                                                        style={styles.documentFileInput}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStepDocument(stageIndex, stepIndex, docIndex)}
                                                        style={styles.removeButtonStyle}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addStepDocument(stageIndex, stepIndex)} style={styles.addSmallButton}>➕ إضافة مستند</button>
                                        </div>

                                        {stage.steps.length > 1 && (
                                            <button type="button" onClick={() => removeStep(stageIndex, stepIndex)} style={styles.removeSmallButton}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => addStep(stageIndex)} style={styles.addStepButton}>➕ إضافة خطوة</button>
                            </div>

                            {stages.length > 1 && (
                                <button type="button" onClick={() => removeStage(stageIndex)} style={styles.removeStageButton}>✕</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addStage} style={styles.addStageButton}>➕ إضافة مرحلة</button>
                </div>

                {/* Project General Files */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>الملفات العامة للمشروع</h3>
                    <label style={styles.label}>📁 الملفات القديمة:</label>
                    <ul style={styles.fileList}>
                        {existingProjectFiles.length > 0 ? (
                            existingProjectFiles.map((file, index) => (
                                <li key={index} style={styles.fileItem}>
                                    <a href={`http://localhost:4000/uploads/${file.savedPath}`} target="_blank" rel="noopener noreferrer" style={styles.fileLink}>
                                        {file.originalName}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProjectFile(file.originalName)}
                                        style={styles.removeFileButton}
                                    >
                                        حذف
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p style={styles.noFilesText}>لا توجد ملفات مرفوعة حاليًا للمشروع.</p>
                        )}
                    </ul>

                    <label style={styles.label}>📤 تحميل ملفات جديدة:</label>
                    <input type="file" multiple onChange={handleNewProjectFilesChange} style={styles.fileInput} />
                    {newProjectFiles.length > 0 && (
                        <div style={styles.newFilesContainer}>
                            <p style={styles.newFilesTitle}>الملفات الجديدة:</p>
                            <ul style={styles.fileList}>
                                {newProjectFiles.map((file, index) => (
                                    <li key={index} style={styles.newFileItem}>
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div style={styles.buttonContainer}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        {loading ? '...جاري الحفظ' : '💾 حفظ التعديلات'}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        style={styles.deleteButton}
                    >
                        🗑️ حذف المشروع
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    card: {
        maxWidth: '900px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        direction: 'rtl'
    },
    h2: {
        textAlign: 'center',
        color: '#0056b3',
        marginBottom: '25px',
        borderBottom: '2px solid #eee',
        paddingBottom: '15px'
    },
    section: {
        marginBottom: '25px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: '#fff',
    },
    sectionTitle: {
        color: '#333',
        marginTop: '0',
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        minHeight: '100px'
    },
    select: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box'
    },
    stageContainer: {
        border: '1px dashed #a0a0a0',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff',
        position: 'relative',
    },
    stageTitle: {
        marginTop: '0',
        marginBottom: '15px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        color: '#007bff',
    },
    stepsSection: {
        border: '1px solid #bbe0ff',
        borderRadius: '6px',
        padding: '15px',
        marginTop: '20px',
        backgroundColor: '#e6f7ff',
    },
    stepsTitle: {
        color: '#0056b3',
        marginTop: '0',
        marginBottom: '15px',
    },
    stepContainer: {
        border: '1px solid #99d0ff',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '6px',
        backgroundColor: '#f0f8ff',
        position: 'relative',
    },
    stepTitle: {
        color: '#004085',
        marginTop: '0',
        marginBottom: '10px',
    },
    documentsSection: {
        border: '1px solid #d4edda',
        borderRadius: '6px',
        padding: '10px',
        marginTop: '15px',
        backgroundColor: '#e9f7ef',
    },
    documentsTitle: {
        color: '#155724',
        marginTop: '0',
        marginBottom: '10px',
    },
    documentItem: {
        display: 'flex',
        gap: '5px',
        marginBottom: '5px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    documentInput: {
        flex: '1',
        minWidth: '150px',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    documentLink: {
        color: '#007bff',
        textDecoration: 'none',
        flexShrink: 0,
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid transparent',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: '#eaf5ff',
            border: '1px solid #007bff',
        }
    },
    documentFileInput: {
        flex: '2',
        minWidth: '150px',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f8f9fa',
    },
    addSmallButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s'
    },
    removeButtonStyle: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        width: '30px',
        height: '30px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontSize: '16px',
        lineHeight: '1',
    },
    addStepButton: {
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '15px',
        width: '100%',
        transition: 'background-color 0.3s',
    },
    removeSmallButton: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '18px',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addStageButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
        width: '100%',
        transition: 'background-color 0.3s'
    },
    removeStageButton: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '20px',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileList: {
        padding: '0',
        listStyle: 'none',
        marginBottom: '20px'
    },
    fileItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px',
        background: '#f5f5f5',
        padding: '5px 10px',
        borderRadius: '4px',
        border: '1px solid #eee'
    },
    fileLink: {
        color: '#007bff',
        textDecoration: 'none',
        flexGrow: 1
    },
    removeFileButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    fileInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
        backgroundColor: '#f8f9fa',
    },
    noFilesText: {
        color: '#888',
        textAlign: 'center'
    },
    newFilesContainer: {
        borderTop: '1px solid #eee',
        paddingTop: '15px',
        marginTop: '15px',
    },
    newFilesTitle: {
        fontWeight: 'bold',
        color: '#555',
        marginBottom: '10px',
    },
    newFileItem: {
        background: '#e2f0e2',
        padding: '5px 10px',
        borderRadius: '4px',
        border: '1px solid #c8e6c9',
        marginBottom: '5px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        marginTop: '30px',
    },
    submitButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        flexGrow: 1,
        transition: 'background-color 0.3s'
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        flexGrow: 1,
        transition: 'background-color 0.3s'
    },
};

export default ProjectEdit;
