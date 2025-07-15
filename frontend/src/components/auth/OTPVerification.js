import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Shield, Clock, RefreshCw } from 'lucide-react';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const fromLogin = location.state?.fromLogin || false;

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedOtp = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    const newOtp = [...otp];
    pastedOtp.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit, index) => !digit && index < 6);
    const targetIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    const targetInput = document.getElementById(`otp-${targetIndex}`);
    if (targetInput) targetInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    const result = await verifyOTP(email, otpString);
    
    if (result.success) {
      setSuccess('Account verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    const result = await resendOTP(email);
    
    if (result.success) {
      setSuccess('New OTP sent successfully!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } else {
      setError(result.error);
    }
    
    setResendLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Shield size={48} />
          </div>
          <h2>Verify Your Account</h2>
          <p>We've sent a 6-digit verification code to</p>
          <p className="email-display">{email}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-container">
            <label className="form-label">Enter Verification Code</label>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="otp-input"
                  maxLength="1"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <div className="otp-timer">
            <Clock size={16} />
            <span>Code expires in 10 minutes</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className="btn btn-link"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
          >
            {resendLoading ? (
              <>
                <RefreshCw size={16} className="spin" />
                Sending...
              </>
            ) : canResend ? (
              <>
                <Mail size={16} />
                Resend Code
              </>
            ) : (
              `Resend in ${countdown}s`
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .auth-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          color: #667eea;
        }

        .email-display {
          font-weight: 600;
          color: #667eea;
          margin-top: 0.5rem;
        }

        .otp-container {
          margin-bottom: 1.5rem;
        }

        .otp-inputs {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .otp-input {
          width: 3rem;
          height: 3rem;
          text-align: center;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          transition: border-color 0.2s;
        }

        .otp-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .otp-timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .btn-link {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .btn-link:hover:not(:disabled) {
          color: #5a67d8;
        }

        .btn-link:disabled {
          color: #9ca3af;
          cursor: not-allowed;
          text-decoration: none;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;