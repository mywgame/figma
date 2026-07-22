/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { Modal, Alert } from './ui/index.ts';
import logoImg from '../../assets/images/branding/logo.png';

// Import refactored feature components
import { Login } from './Auth/Login/Login.tsx';
import { Register } from './Auth/Register/Register.tsx';
import { VerifyEmail } from './Auth/VerifyEmail/VerifyEmail.tsx';
import { ForgotPassword } from './Auth/ForgotPassword/ForgotPassword.tsx';
import { ResetPassword } from './Auth/ResetPassword/ResetPassword.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthView = 'login' | 'register' | 'otp-verify' | 'forgot-password' | 'reset-password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [activeView, setActiveView] = useState<AuthView>(initialMode === 'register' ? 'register' : 'login');
  
  // States to pass between steps
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setValidationError(null);
    setSuccessMsg(null);
  };

  const handleSuccess = () => {
    resetMessages();
    onClose();
  };

  const handleError = (msg: string | null) => {
    setValidationError(msg);
  };

  const handleSuccessMsg = (msg: string | null) => {
    setSuccessMsg(msg);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="auth-modal-portal"
      size={activeView === 'register' ? "md" : "sm"}
    >
      {/* Top Decorative gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-500 w-full" />

      <div className="pt-2">
        {/* Logo */}
        <div className="mb-4 flex justify-start">
          <img
            src={logoImg}
            alt="MetaFirm Logo"
            referrerPolicy="no-referrer"
            className="h-10 object-contain animate-fade-in"
          />
        </div>

        {/* Header Identity */}
        <div className="mb-4 space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MetaFirm Secure Gateway</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-950 tracking-tight leading-none pt-1">
            {activeView === 'login' && 'Sign In'}
            {activeView === 'register' && 'Create Account'}
            {activeView === 'otp-verify' && 'Verify Your Email'}
            {activeView === 'forgot-password' && 'Password Recovery'}
            {activeView === 'reset-password' && 'Set New Password'}
          </h2>

          <p className="text-xs text-gray-500 leading-relaxed font-sans pt-0.5">
            {activeView === 'login' && 'Access your secure ledger balance, team statistics, and automated payout channels.'}
            {activeView === 'register' && 'Open an institutional-grade account with real-time reserve auditing and compound yields.'}
            {activeView === 'otp-verify' && `We sent a secure 6-digit confirmation code to ${email || 'your email'}.`}
            {activeView === 'forgot-password' && 'Enter your registered email address to receive a secure recovery code.'}
            {activeView === 'reset-password' && 'Complete the recovery process by inputting the verification code and creating a new password.'}
          </p>
        </div>

        {/* Error Alerts */}
        {validationError && (
          <Alert variant="error" className="mb-4">
            {validationError}
          </Alert>
        )}

        {/* Success Alerts */}
        {successMsg && (
          <Alert variant="success" className="mb-4">
            {successMsg}
          </Alert>
        )}

        {/* Active Child View */}
        <AnimatePresence mode="wait">
          {activeView === 'login' && (
            <Login
              onForgotPasswordClick={(enteredEmail) => {
                resetMessages();
                setEmail(enteredEmail);
                setActiveView('forgot-password');
              }}
              onSuccess={handleSuccess}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'register' && (
            <Register
              onSuccess={(registeredEmail) => {
                resetMessages();
                setEmail(registeredEmail);
                setActiveView('otp-verify');
              }}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'otp-verify' && (
            <VerifyEmail
              email={email}
              onSuccess={handleSuccess}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'forgot-password' && (
            <ForgotPassword
              initialEmail={email}
              onSuccess={(resetEmail) => {
                resetMessages();
                setEmail(resetEmail);
                setActiveView('reset-password');
              }}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
            />
          )}

          {activeView === 'reset-password' && (
            <ResetPassword
              email={email}
              onSuccess={() => {
                resetMessages();
                setActiveView('login');
              }}
              onError={handleError}
              onSuccessMsg={handleSuccessMsg}
              onBackToLogin={() => {
                resetMessages();
                setActiveView('login');
              }}
            />
          )}
        </AnimatePresence>

        {/* Bottom Switch Links */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          {activeView === 'login' && (
            <p className="text-xs text-gray-500 font-sans">
              New to MetaFirm?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('register');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:underline inline-flex items-center space-x-0.5 cursor-pointer font-mono text-[11px] focus:outline-none"
                id="auth-toggle-mode-btn"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Create Account
              </button>
            </p>
          )}

          {activeView === 'register' && (
            <p className="text-xs text-gray-500 font-sans">
              Already have an account?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('login');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:underline inline-flex items-center space-x-0.5 cursor-pointer font-mono text-[11px] focus:outline-none"
                id="auth-toggle-mode-btn"
              >
                Sign In
              </button>
            </p>
          )}

          {activeView === 'otp-verify' && (
            <p className="text-xs text-gray-500 font-sans">
              Wrong email address or want to start over?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('register');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:underline cursor-pointer font-mono text-[11px] focus:outline-none"
              >
                Back to Registration
              </button>
            </p>
          )}

          {activeView === 'forgot-password' && (
            <p className="text-xs text-gray-500 font-sans">
              Remembered your password?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('login');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:underline cursor-pointer font-mono text-[11px] focus:outline-none"
              >
                Back to Sign In
              </button>
            </p>
          )}

          {activeView === 'reset-password' && (
            <p className="text-xs text-gray-500 font-sans">
              Want to change email?
              <button
                onClick={() => {
                  resetMessages();
                  setActiveView('forgot-password');
                }}
                className="ml-1.5 font-bold text-blue-600 hover:underline cursor-pointer font-mono text-[11px] focus:outline-none"
              >
                Change Email Address
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
