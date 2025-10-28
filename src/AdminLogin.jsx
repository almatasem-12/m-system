import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin({ setIsAdmin }) {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            console.log('🔗 جاري إرسال طلب الدخول إلى الخادم...');
            console.log('🧑🏻‍💻 اسم المستخدم:', username);
            console.log('🔒 كلمة المرور:', password);

            const res = await axios.post('http://localhost:4000/api/login', { username, password });
            console.log('✅ تم استقبال الاستجابة من الخادم:', res.data);

            // تحقق من صلاحية المدير
            if (res.data.user && res.data.user.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
                // لا حاجة لـ setIsAdmin(true) هنا

                // التوجيه إلى صفحة المشاريع
                navigate('/projects');

                // إعادة تحميل الصفحة لضمان قراءة localStorage المحدث
                window.location.reload();
            } else {
                alert('🚫 المستخدم ليس مسؤولاً');
            }

        } catch (err) {
            console.error('❌ فشل تسجيل الدخول:', err.response ? err.response.data : err.message);
            alert(err.response?.data?.message || '❌ خطأ في تسجيل الدخول. يرجى التحقق من الخادم.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            direction: 'rtl'
        }}>
            <form onSubmit={handleLogin} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                padding: '30px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
                width: '300px'
            }}>
                <h2 style={{ textAlign: 'center', color: '#2f5d62' }}>دخول المدير</h2>
                <input
                    type="text"
                    placeholder="اسم المستخدم"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <input
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px',
                        backgroundColor: '#2f5d62',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    دخول
                </button>
            </form>
        </div>
    );
}

export default AdminLogin;
