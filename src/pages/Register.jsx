import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data.token, data.user);
      toast.success(`Account created! Welcome, ${data.user.name} 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthClass = ['', 'weak', 'fair', 'good', 'strong', 'very-strong'][strength] || '';

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-hero">
          <div className="hero-icon-wrap">
            <CheckSquare size={52} />
          </div>
          <h1>TaskFlow</h1>
          <p>Join thousands of people who manage their tasks smarter with TaskFlow.</p>
          <ul className="hero-features">
            <li><span className="dot" /> Free forever, no credit card</li>
            <li><span className="dot" /> All your tasks in one place</li>
            <li><span className="dot" /> Available anywhere, anytime</li>
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p>Start managing tasks for free today</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {errors.general && <div className="form-error-banner">{errors.general}</div>}

            {/* Name */}
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="reg-name">Full name</label>
              <div className="input-wrap">
                <User size={17} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="reg-email">Email address</label>
              <div className="input-wrap">
                <Mail size={17} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="reg-password">Password</label>
              <div className="input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass((p) => !p)} tabIndex={-1}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.password && (
                <div className="strength-bar-wrap">
                  <div className="strength-bar">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`bar-seg ${i <= strength ? strengthClass : ''}`} />
                    ))}
                  </div>
                  <span className={`strength-label ${strengthClass}`}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
              <label htmlFor="reg-confirm">Confirm password</label>
              <div className="input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : <UserPlus size={18} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
