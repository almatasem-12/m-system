import React, { useState } from 'react';

function AddAdmin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role: 'admin' })
            });
            if (!res.ok) throw new Error('فشل إضافة المدير');
            alert('✅ تم إضافة المدير بنجاح');
            setUsername('');
            setPassword('');
        } catch (err) {
            console.error(err);
            alert('❌ حدث خطأ أثناء الإضافة');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>إضافة مدير جديد</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>اسم المستخدم: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>كلمة المرور: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">إضافة</button>
            </form>
        </div>
    );
}

export default AddAdmin;
