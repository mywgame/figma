/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input, Button } from '../../ui/index.ts';
import { COUNTRIES, COUNTRY_DATA } from '../Shared/countries.ts';

interface RegisterProps {
  onSuccess: (email: string) => void;
  onError: (msg: string | null) => void;
  onSuccessMsg: (msg: string | null) => void;
}

export const Register: React.FC<RegisterProps> = ({
  onSuccess,
  onError,
  onSuccessMsg,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [countryCode, setCountryCode] = useState('+1');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const info = COUNTRY_DATA[selectedCountry] || { flag: "🏳️", code: "+1" };
    setCountryCode(info.code);
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onSuccessMsg(null);

    if (!fullName.trim()) {
      onError('Please enter your Full Name.');
      return;
    }
    if (!username.trim()) {
      onError('Please enter a Username.');
      return;
    }
    if (!email.trim()) {
      onError('Please enter your Email Address.');
      return;
    }
    if (!mobileNumber.trim()) {
      onError('Please enter your Mobile Number.');
      return;
    }
    if (password !== confirmPassword) {
      onError('Passwords do not match.');
      return;
    }

    // Password validation rules
    if (password.length < 8) {
      onError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      onError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      onError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/\d/.test(password)) {
      onError('Password must contain at least one number.');
      return;
    }
    if (!/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(password)) {
      onError('Password must contain at least one special character (e.g., ! @ # $ % & *).');
      return;
    }

    setBusy(true);
    try {
      const fullPhone = `${countryCode} ${mobileNumber.trim()}`;
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          name: fullName.trim(),
          phone: fullPhone,
          country,
          password,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Failed to create user account.');
      }

      // Stripped all emojis/icons from the success message
      const cleanedMessage = (resData.message || 'Verification code sent to your email.').replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
      onSuccessMsg(cleanedMessage);
      onSuccess(email.trim());
    } catch (err: any) {
      onError(err.message || 'An unexpected registration error occurred.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="register-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <form onSubmit={handleLocalSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0 w-full">
          <div className="min-w-0">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              id="auth-name-input"
              required
            />
          </div>

          <div className="min-w-0">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              id="auth-username-input"
              required
            />
          </div>

          <div className="min-w-0">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="investor@metafirm.io"
              id="auth-email-input"
              required
            />
          </div>

          {/* Country Selector */}
          <div className="space-y-1.5 min-w-0">
            <label htmlFor="auth-country-select" className="block text-xs font-semibold text-gray-700 tracking-wide">
              Country
            </label>
            <select
              id="auth-country-select"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full max-w-full min-w-0 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900 transition-all duration-150 focus-visible:outline-none"
            >
              {COUNTRIES.map((c) => {
                return (
                  <option key={c} value={c} className="text-gray-900 bg-white">
                    {c}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Country Code + Mobile Number */}
          <div className="space-y-1.5 md:col-span-2 min-w-0">
            <label htmlFor="auth-mobile-input" className="block text-xs font-semibold text-gray-700 tracking-wide">
              Mobile Number
            </label>
            <div className="flex space-x-2 min-w-0">
              <input
                type="text"
                id="auth-country-code"
                value={countryCode}
                readOnly
                placeholder="+1"
                className="w-20 flex-shrink-0 px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-gray-50 text-gray-500 text-center transition-all duration-150 focus-visible:outline-none cursor-not-allowed font-medium"
                required
              />
              <input
                type="tel"
                id="auth-mobile-input"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="555-0199"
                className="flex-1 min-w-0 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus-visible:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0 relative">
            <label htmlFor="auth-password-input-reg" className="block text-xs font-semibold text-gray-700 tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password-input-reg"
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

          <div className="space-y-1.5 min-w-0 relative">
            <label htmlFor="auth-confirm-password-input" className="block text-xs font-semibold text-gray-700 tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="auth-confirm-password-input"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus-visible:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-0"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 min-w-0">
            <Input
              label="Referral Code (Optional)"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g. PARTNER88"
              id="auth-referral-input"
            />
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
          Send Verification Code
        </Button>
      </form>
    </motion.div>
  );
};

export default Register;
