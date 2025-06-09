import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AuthScreen.css';

interface AuthScreenProps {
  mode: 'login' | 'signup';
}

export default function AuthScreen({ mode }: AuthScreenProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (mode === 'signup') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        alert('❌ Please enter your first and last name.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('❌ Passwords do not match.');
        return;
      }
      if (!formData.agreeToTerms) {
        alert('❌ Please agree to the Terms of Service and Privacy Policy.');
        return;
      }
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      alert('❌ Please enter your email and password.');
      return;
    }

    if (mode === 'login') {
      alert('🎉 Welcome back to Thriftures!\n\nYou have been successfully logged in.');
    } else {
      alert('🎉 Welcome to Thriftures!\n\nYour account has been created successfully. You can now start posting sales and discovering amazing deals!');
    }
    
    navigate('/map');
  };

  const handleSocialLogin = (provider: string) => {
    alert(`🔗 ${provider} Login\n\nThis would connect with ${provider} for quick authentication.\n\nFeature coming soon!`);
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      alert('📧 Please enter your email address first, then click "Forgot Password?"');
      return;
    }
    alert('📧 Password Reset\n\nA password reset link has been sent to your email address.\n\nPlease check your inbox and follow the instructions.');
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <button className="back-button" onClick={() => navigate('/map')}>
            <ArrowLeft size={24} />
          </button>
          <div className="logo-container">
            <div className="logo">
              <span className="logo-text">Thriftures</span>
            </div>
            <p className="tagline">Find Amazing Sales Near You</p>
          </div>
        </div>

        {/* Form */}
        <div className="auth-form">
          <h1 className="form-title">
            {mode === 'login' ? 'Welcome Back!' : 'Join Thriftures'}
          </h1>
          <p className="form-subtitle">
            {mode === 'login' 
              ? 'Sign in to access your saved sales and post new ones'
              : 'Create an account to start posting sales and saving your favorites'
            }
          </p>

          {/* Social Login Buttons */}
          <div className="social-buttons">
            <button 
              className="social-button google"
              onClick={() => handleSocialLogin('Google')}
            >
              <span className="social-icon">🔍</span>
              Continue with Google
            </button>
            <button 
              className="social-button apple"
              onClick={() => handleSocialLogin('Apple')}
            >
              <span className="social-icon">🍎</span>
              Continue with Apple
            </button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          {/* Name Fields (Signup only) */}
          {mode === 'signup' && (
            <div className="name-fields">
              <div className="input-group">
                <label className="input-label">First Name *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password *</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Confirm Password *</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
            </div>
          )}

          {/* Terms Agreement (Signup only) */}
          {mode === 'signup' && (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              />
              <label htmlFor="agreeToTerms" className="checkbox-label">
                I agree to the <a href="#" className="link">Terms of Service</a> and <a href="#" className="link">Privacy Policy</a>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button className="submit-button" onClick={handleSubmit}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Forgot Password (Login only) */}
          {mode === 'login' && (
            <button className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          )}

          {/* Switch Mode */}
          <div className="switch-mode">
            <span>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              className="switch-button"
              onClick={() => navigate(mode === 'login' ? '/signup' : '/login')}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}