import React, { useState } from 'react';
import API from '../api/axios';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Processing...', type: 'info' });

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        try {
            const response = await API.post(endpoint, formData);
            
            if (isLogin) {
                // The backend returns the JWT string directly
                //localStorage.setItem('token', response.data);
                //setMessage({ text: 'Login Successful! Redirecting...', type: 'success' });
                localStorage.setItem('token', response.data);
                window.location.reload(); // Temporary trick to switch views
                // Tomorrow we will add: window.location.href = '/dashboard';
            } else {
                setMessage({ text: 'Registration Successful! Please Login.', type: 'success' });
                setIsLogin(true);
            }
        } catch (error) {
            const errorMsg = error.response?.data || 'Connection failed. Is the backend running?';
            setMessage({ text: errorMsg, type: 'error' });
        }
    };

    return (
        <div style={styles.card}>
            <h1 style={styles.title}>CloudShare</h1>
            <p style={styles.subtitle}>{isLogin ? 'Welcome back' : 'Create your drive account'}</p>
            
            {message.text && (
                <div style={{ ...styles.alert, backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                {!isLogin && (
                    <input
                        name="fullName"
                        placeholder="Full Name"
                        style={styles.input}
                        onChange={handleChange}
                        required
                    />
                )}
                <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    style={styles.input}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    style={styles.input}
                    onChange={handleChange}
                    required
                />
                <button type="submit" style={styles.button}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <button 
                onClick={() => setIsLogin(!isLogin)} 
                style={styles.toggleBtn}
            >
                {isLogin ? "New to CloudShare? Register" : "Have an account? Sign In"}
            </button>
        </div>
    );
};

const styles = {
    card: { maxWidth: '400px', margin: '80px auto', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff' },
    title: { color: '#2563eb', fontSize: '2rem', marginBottom: '8px' },
    subtitle: { color: '#64748b', marginBottom: '24px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' },
    button: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
    toggleBtn: { marginTop: '20px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' },
    alert: { padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }
};

export default AuthPage