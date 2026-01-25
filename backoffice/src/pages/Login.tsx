import { useState } from 'react';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await apiClient.post('/auth/login', { username, password });
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err: any) {
            setError('فشل تسجيل الدخول. تأكد من البيانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
            <div className="card" style={{ width: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                    <LogIn size={48} />
                    <h2>تسجيل الدخول للنظام</h2>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>اسم المستخدم</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            dir="ltr"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>كلمة المرور</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            dir="ltr"
                        />
                    </div>

                    {error && <div style={{ color: 'red', marginBottom: '15px', background: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                        {loading ? 'جاري التحقق...' : 'دخول'}
                    </button>
                </form>
            </div>
        </div>
    );
}
