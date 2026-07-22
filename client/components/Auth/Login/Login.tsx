/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../../hooks/useAuth.ts';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input, Button } from '../../ui/index.ts';

interface LoginProps {
  onForgotPasswordClick: (email: string) => void;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
}

export const Login: React.FC<LoginProps> = ({
  onForgotPasswordClick,
  onSuccess,
  onError,
  onSuccessMsg,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      onError('Please enter both your Username/Email and password.');
      return;
    }

    setBusy(true);
    try {
      await login(email.trim(), password, false);
      onSuccessMsg('Authentication successful. Loading corporate dashboard...');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      onError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="login-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleLocalSubmit} className="space-y-4">
        <div className="space-y-4">
          <Input
            label="Username or Email Address"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username or email address"
            id="auth-email-input-login"
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password-input-login" className="block text-xs font-semibold text-gray-700 tracking-wide">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  onError(null);
                  onSuccessMsg(null);
                  onForgotPasswordClick(email);
                }}
                className="text-[10px] font-mono font-bold text-blue-600 hover:underline cursor-pointer focus:outline-none bg-transparent border-none p-0"
              >
                Forgot password?
              </button>
            </div>
            
            <div className="relative">
              <input
                id="auth-password-input-login"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus-visible:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={busy}
          className="w-full mt-2"
          variant="primary"
          size="lg"
          id="auth-submit-btn"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>
    </motion.div>
  );
};

export default Login;
