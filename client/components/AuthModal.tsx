/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth.ts';
import { ArrowRight, ShieldCheck, Sparkles, UserPlus, Eye, EyeOff, Key, Mail, RefreshCw } from 'lucide-react';
import { Modal, Input, Button, Alert } from './ui/index.ts';
import logoImg from '../../assets/images/branding/logo.png';

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India", "Germany", "France", "Japan", "China", "Brazil",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Central African Republic", "Chad", "Chile", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "Gabon",
  "Gambia", "Georgia", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

const COUNTRY_DATA: Record<string, { flag: string; code: string }> = {
  "United States": { flag: "🇺🇸", code: "+1" },
  "Canada": { flag: "🇨🇦", code: "+1" },
  "United Kingdom": { flag: "🇬🇧", code: "+44" },
  "Australia": { flag: "🇦🇺", code: "+61" },
  "India": { flag: "🇮🇳", code: "+91" },
  "Germany": { flag: "🇩🇪", code: "+49" },
  "France": { flag: "🇫🇷", code: "+33" },
  "Japan": { flag: "🇯🇵", code: "+81" },
  "China": { flag: "🇨🇳", code: "+86" },
  "Brazil": { flag: "🇧🇷", code: "+55" },
  "Afghanistan": { flag: "🇦🇫", code: "+93" },
  "Albania": { flag: "🇦🇱", code: "+355" },
  "Algeria": { flag: "🇩🇿", code: "+213" },
  "Andorra": { flag: "🇦🇩", code: "+376" },
  "Angola": { flag: "🇦🇴", code: "+244" },
  "Antigua and Barbuda": { flag: "🇦🇬", code: "+1-268" },
  "Argentina": { flag: "🇦🇷", code: "+54" },
  "Armenia": { flag: "🇦🇲", code: "+374" },
  "Austria": { flag: "🇦🇹", code: "+43" },
  "Azerbaijan": { flag: "🇦🇿", code: "+994" },
  "Bahamas": { flag: "🇧🇸", code: "+1-242" },
  "Bahrain": { flag: "🇧🇭", code: "+973" },
  "Bangladesh": { flag: "🇧🇩", code: "+880" },
  "Barbados": { flag: "🇧🇧", code: "+1-246" },
  "Belarus": { flag: "🇧🇾", code: "+375" },
  "Belgium": { flag: "🇧🇪", code: "+32" },
  "Belize": { flag: "🇧🇿", code: "+501" },
  "Benin": { flag: "🇧🇯", code: "+229" },
  "Bhutan": { flag: "🇧🇹", code: "+975" },
  "Bolivia": { flag: "🇧🇴", code: "+591" },
  "Bosnia and Herzegovina": { flag: "🇧🇦", code: "+387" },
  "Botswana": { flag: "🇧🇼", code: "+267" },
  "Brunei": { flag: "🇧🇳", code: "+673" },
  "Bulgaria": { flag: "🇧🇬", code: "+359" },
  "Burkina Faso": { flag: "🇧🇫", code: "+226" },
  "Burundi": { flag: "🇧🇮", code: "+257" },
  "Cabo Verde": { flag: "🇨🇻", code: "+238" },
  "Cambodia": { flag: "🇰🇭", code: "+855" },
  "Cameroon": { flag: "🇨🇲", code: "+237" },
  "Central African Republic": { flag: "🇨🇫", code: "+236" },
  "Chad": { flag: "🇹🇩", code: "+235" },
  "Chile": { flag: "🇨🇱", code: "+56" },
  "Colombia": { flag: "🇨🇴", code: "+57" },
  "Comoros": { flag: "🇰🇲", code: "+269" },
  "Congo": { flag: "🇨🇬", code: "+242" },
  "Costa Rica": { flag: "🇨🇷", code: "+506" },
  "Croatia": { flag: "🇭🇷", code: "+385" },
  "Cuba": { flag: "🇨🇺", code: "+53" },
  "Cyprus": { flag: "🇨🇾", code: "+357" },
  "Czechia": { flag: "🇨🇿", code: "+420" },
  "Denmark": { flag: "🇩🇰", code: "+45" },
  "Djibouti": { flag: "🇩🇯", code: "+253" },
  "Dominica": { flag: "🇩🇲", code: "+1-767" },
  "Dominican Republic": { flag: "🇩🇴", code: "+1-809" },
  "Ecuador": { flag: "🇪🇨", code: "+593" },
  "Egypt": { flag: "🇪🇬", code: "+20" },
  "El Salvador": { flag: "🇸🇻", code: "+503" },
  "Equatorial Guinea": { flag: "🇬🇶", code: "+240" },
  "Eritrea": { flag: "🇪🇷", code: "+291" },
  "Estonia": { flag: "🇪🇪", code: "+372" },
  "Eswatini": { flag: "🇸🇿", code: "+268" },
  "Ethiopia": { flag: "🇪🇹", code: "+251" },
  "Fiji": { flag: "🇫🇯", code: "+679" },
  "Lebanon": { flag: "🇱🇧", code: "+961" },
  "Lesotho": { flag: "🇱🇸", code: "+266" },
  "Liberia": { flag: "🇱🇷", code: "+231" },
  "Libya": { flag: "🇱🇾", code: "+218" },
  "Liechtenstein": { flag: "🇱🇮", code: "+423" },
  "Lithuania": { flag: "🇱🇹", code: "+370" },
  "Luxembourg": { flag: "🇱🇺", code: "+352" },
  "Madagascar": { flag: "🇲🇬", code: "+261" },
  "Malawi": { flag: "🇲🇼", code: "+265" },
  "Malaysia": { flag: "🇲🇾", code: "+60" },
  "Maldives": { flag: "🇲🇻", code: "+960" },
  "Mali": { flag: "🇲🇱", code: "+223" },
  "Malta": { flag: "🇲🇹", code: "+356" },
  "Mauritania": { flag: "🇲🇷", code: "+222" },
  "Mauritius": { flag: "🇲🇺", code: "+230" },
  "Mexico": { flag: "🇲🇽", code: "+52" },
  "Micronesia": { flag: "🇫🇲", code: "+691" },
  "Moldova": { flag: "🇲🇩", code: "+373" },
  "Monaco": { flag: "🇲🇨", code: "+377" },
  "Mongolia": { flag: "🇲🇳", code: "+976" },
  "Montenegro": { flag: "🇲🇪", code: "+382" },
  "Morocco": { flag: "🇲🇦", code: "+212" },
  "Mozambique": { flag: "🇲🇿", code: "+258" },
  "Myanmar": { flag: "🇲🇲", code: "+95" },
  "Namibia": { flag: "🇳🇦", code: "+264" },
  "Nauru": { flag: "🇳🇷", code: "+674" },
  "Nepal": { flag: "🇳🇵", code: "+977" },
  "Netherlands": { flag: "🇳🇱", code: "+31" },
  "New Zealand": { flag: "🇳🇿", code: "+64" },
  "Nicaragua": { flag: "🇳🇮", code: "+505" },
  "Niger": { flag: "🇳🇪", code: "+227" },
  "Nigeria": { flag: "🇳🇬", code: "+234" },
  "North Korea": { flag: "🇰🇵", code: "+850" },
  "North Macedonia": { flag: "🇲🇰", code: "+389" },
  "Norway": { flag: "🇳🇴", code: "+47" },
  "Oman": { flag: "🇴🇲", code: "+968" },
  "Pakistan": { flag: "🇵🇰", code: "+92" },
  "Palau": { flag: "🇵🇼", code: "+680" },
  "Panama": { flag: "🇵🇦", code: "+507" },
  "Papua New Guinea": { flag: "🇵🇬", code: "+675" },
  "Paraguay": { flag: "🇵🇾", code: "+595" },
  "Peru": { flag: "🇵🇪", code: "+51" },
  "Philippines": { flag: "🇵🇭", code: "+63" },
  "Poland": { flag: "🇵🇱", code: "+48" },
  "Portugal": { flag: "🇵🇹", code: "+351" },
  "Qatar": { flag: "🇶🇦", code: "+974" },
  "Romania": { flag: "🇷🇴", code: "+40" },
  "Russia": { flag: "🇷🇺", code: "+7" },
  "Rwanda": { flag: "🇷🇼", code: "+250" },
  "Saint Kitts and Nevis": { flag: "🇰🇳", code: "+1-869" },
  "Saint Lucia": { flag: "🇱🇨", code: "+1-758" },
  "Samoa": { flag: "🇼🇸", code: "+685" },
  "San Marino": { flag: "🇸🇲", code: "+378" },
  "Saudi Arabia": { flag: "🇸🇦", code: "+966" },
  "Senegal": { flag: "🇸🇳", code: "+221" },
  "Serbia": { flag: "🇷🇸", code: "+381" },
  "Seychelles": { flag: "🇸🇨", code: "+248" },
  "Sierra Leone": { flag: "🇸🇱", code: "+232" },
  "Singapore": { flag: "🇸🇬", code: "+65" },
  "Slovakia": { flag: "🇸🇰", code: "+421" },
  "Slovenia": { flag: "🇸🇮", code: "+386" },
  "Solomon Islands": { flag: "🇸🇧", code: "+677" },
  "Somalia": { flag: "🇸🇴", code: "+252" },
  "South Africa": { flag: "🇿🇦", code: "+27" },
  "South Korea": { flag: "🇰🇷", code: "+82" },
  "South Sudan": { flag: "🇸🇸", code: "+211" },
  "Spain": { flag: "🇪🇸", code: "+34" },
  "Sri Lanka": { flag: "🇱🇰", code: "+94" },
  "Sudan": { flag: "🇸🇩", code: "+249" },
  "Suriname": { flag: "🇸🇷", code: "+597" },
  "Sweden": { flag: "🇸🇪", code: "+46" },
  "Switzerland": { flag: "🇨🇭", code: "+41" },
  "Syria": { flag: "🇸🇾", code: "+963" },
  "Taiwan": { flag: "🇹🇼", code: "+886" },
  "Tajikistan": { flag: "🇹🇯", code: "+992" },
  "Tanzania": { flag: "🇹🇿", code: "+255" },
  "Thailand": { flag: "🇹🇭", code: "+66" },
  "Timor-Leste": { flag: "🇹🇱", code: "+670" },
  "Togo": { flag: "🇹🇬", code: "+228" },
  "Tonga": { flag: "🇹🇴", code: "+676" },
  "Trinidad and Tobago": { flag: "🇹🇹", code: "+1-868" },
  "Tunisia": { flag: "🇹🇳", code: "+216" },
  "Turkey": { flag: "🇹🇷", code: "+90" },
  "Turkmenistan": { flag: "🇹🇲", code: "+993" },
  "Tuvalu": { flag: "🇹🇻", code: "+688" },
  "Uganda": { flag: "🇺🇬", code: "+256" },
  "Ukraine": { flag: "🇺🇦", code: "+380" },
  "United Arab Emirates": { flag: "🇦🇪", code: "+971" },
  "Uruguay": { flag: "🇺🇾", code: "+598" },
  "Uzbekistan": { flag: "🇺🇿", code: "+998" },
  "Vanuatu": { flag: "🇻🇺", code: "+678" },
  "Vatican City": { flag: "🇻🇦", code: "+39-06" },
  "Venezuela": { flag: "🇻🇪", code: "+58" },
  "Vietnam": { flag: "🇻🇳", code: "+84" },
  "Yemen": { flag: "🇾🇪", code: "+967" },
  "Zambia": { flag: "🇿🇲", code: "+260" },
  "Zimbabwe": { flag: "🇿🇼", code: "+263" }
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthView = 'login' | 'register' | 'otp-verify' | 'forgot-password' | 'reset-password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, verifyOtp, loading, error: authError } = useAuth();
  const [activeView, setActiveView] = useState<AuthView>(initialMode === 'register' ? 'register' : 'login');

  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('United States');
  const [countryCode, setCountryCode] = useState('+1');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // OTP Verification state
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Forgot / Reset password state
  const [resetEmail, setResetEmail] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const info = COUNTRY_DATA[selectedCountry] || { flag: "🏳️", code: "+1" };
    setCountryCode(info.code);
  };

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMsg(null);

    // -------------------------------------------------------------
    // SIGN IN VIEW
    // -------------------------------------------------------------
    if (activeView === 'login') {
      if (!email.trim() || !password.trim()) {
        setValidationError('Please enter both your Username/Email and password.');
        return;
      }

      try {
        await login(email.trim(), password, false);
        setSuccessMsg('Authentication successful. Loading corporate dashboard...');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        setValidationError(err.message || 'An unexpected authentication error occurred.');
      }
    }

    // -------------------------------------------------------------
    // REGISTER VIEW (Trigger OTP creation and verification screen)
    // -------------------------------------------------------------
    else if (activeView === 'register') {
      if (!fullName.trim()) {
        setValidationError('Please enter your Full Name.');
        return;
      }
      if (!username.trim()) {
        setValidationError('Please enter a Username.');
        return;
      }
      if (!email.trim()) {
        setValidationError('Please enter your Email Address.');
        return;
      }
      if (!mobileNumber.trim()) {
        setValidationError('Please enter your Mobile Number.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }

      // Password validation rules
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setValidationError('Password must contain at least one uppercase letter.');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setValidationError('Password must contain at least one lowercase letter.');
        return;
      }
      if (!/\d/.test(password)) {
        setValidationError('Password must contain at least one number.');
        return;
      }
      if (!/[@$!%*?&()_+\-=\[\]{};':"\\|,.<>\/?#^]/.test(password)) {
        setValidationError('Password must contain at least one special character (e.g., ! @ # $ % & *).');
        return;
      }

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

        setSuccessMsg(resData.message || 'Verification code sent to your email.');
        setResetEmail(email.trim()); // Save email to verify OTP later
        setOtp('');
        setCooldown(60);

        if (resData.data?.debugOtp) {
          setDebugOtp(resData.data.debugOtp);
        } else {
          setDebugOtp(null);
        }

        // Transition to OTP verification
        setActiveView('otp-verify');
      } catch (err: any) {
        setValidationError(err.message || 'An unexpected registration error occurred.');
      }
    }

    // -------------------------------------------------------------
    // REGISTRATION OTP VERIFICATION VIEW (Active login on verification)
    // -------------------------------------------------------------
    else if (activeView === 'otp-verify') {
      if (otp.length < 6) {
        setValidationError('Please enter the full 6-digit verification code.');
        return;
      }

      try {
        await verifyOtp(resetEmail || email, otp);
        setSuccessMsg('Account verified successfully! Initializing secure environment...');
        setDebugOtp(null);
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err: any) {
        setValidationError(err.message || 'Invalid or expired verification code.');
      }
    }

    // -------------------------------------------------------------
    // FORGOT PASSWORD REQUEST VIEW
    // -------------------------------------------------------------
    else if (activeView === 'forgot-password') {
      if (!resetEmail.trim()) {
        setValidationError('Please enter your registered email address.');
        return;
      }

      try {
        const response = await fetch('/api/v1/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail.trim() }),
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error?.message || 'Unable to handle forgot password request.');
        }

        setSuccessMsg(resData.message || 'A 6-digit recovery code has been dispatched.');
        setOtp('');
        setPassword('');
        setConfirmPassword('');
        setCooldown(60);

        if (resData.debugToken) {
          setDebugOtp(resData.debugToken);
        } else {
          setDebugOtp(null);
        }

        // Transition to Reset Password page
        setActiveView('reset-password');
      } catch (err: any) {
        setValidationError(err.message || 'Error executing password recovery.');
      }
    }

    // -------------------------------------------------------------
    // RESET PASSWORD RE-CREATION VIEW
    // -------------------------------------------------------------
    else if (activeView === 'reset-password') {
      if (otp.length < 6) {
        setValidationError('Please enter the 6-digit recovery code.');
        return;
      }
      if (!password.trim()) {
        setValidationError('Please enter your new password.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }

      // Password rules
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setValidationError('Password must contain at least one uppercase letter.');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setValidationError('Password must contain at least one lowercase letter.');
        return;
      }
      if (!/\d/.test(password)) {
        setValidationError('Password must contain at least one number.');
        return;
      }

      try {
        const response = await fetch('/api/v1/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: resetEmail.trim(),
            token: otp,
            password: password,
          }),
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error?.message || 'Password reset failed.');
        }

        setSuccessMsg('Your password has been reset successfully! Please sign in with your new credentials.');
        setDebugOtp(null);
        setTimeout(() => {
          setValidationError(null);
          setSuccessMsg(null);
          setEmail(resetEmail);
          setPassword('');
          setActiveView('login');
        }, 2000);
      } catch (err: any) {
        setValidationError(err.message || 'Password reset failed.');
      }
    }
  };

  // Resend OTP code for Registration
  const handleResendRegistrationOtp = async () => {
    if (cooldown > 0) return;
    setValidationError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail || email }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Resending code failed.');
      }

      setSuccessMsg('A new 6-digit verification code has been dispatched.');
      setCooldown(60);

      if (resData.data?.debugOtp) {
        setDebugOtp(resData.data.debugOtp);
      } else {
        setDebugOtp(null);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error resending verification code.');
    }
  };

  // Resend OTP code for Forgot Password
  const handleResendForgotPasswordOtp = async () => {
    if (cooldown > 0) return;
    setValidationError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Resending code failed.');
      }

      setSuccessMsg('A new 6-digit recovery code has been sent.');
      setCooldown(60);

      if (resData.debugToken) {
        setDebugOtp(resData.debugToken);
      } else {
        setDebugOtp(null);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error resending verification code.');
    }
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
            {activeView === 'otp-verify' && `We sent a secure 6-digit confirmation code to ${resetEmail || email || 'your email'}.`}
            {activeView === 'forgot-password' && 'Enter your registered email address to receive a secure recovery code.'}
            {activeView === 'reset-password' && 'Complete the recovery process by inputting the verification code and creating a new password.'}
          </p>
        </div>

        {/* Debug Code Alert Helper (Non-prod environments only!) */}
        {debugOtp && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-mono flex items-center justify-between">
            <span className="flex items-center">
              <Key className="w-3.5 h-3.5 mr-1.5 text-amber-600 animate-bounce" />
              <span>[SANDBOX SIMULATION OTP]:</span>
            </span>
            <span className="font-extrabold text-sm tracking-wider bg-white px-2 py-0.5 rounded border border-amber-300 shadow-sm text-amber-900 select-all">
              {debugOtp}
            </span>
          </div>
        )}

        {/* Error Alerts */}
        {(authError || validationError) && (
          <Alert variant="error" className="mb-4">
            {validationError || authError}
          </Alert>
        )}

        {/* Success Alerts */}
        {successMsg && (
          <Alert variant="success" className="mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          </Alert>
        )}

        {/* Auth Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-modal-form">
          <AnimatePresence mode="wait">
            {activeView === 'register' && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0 w-full"
              >
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
                      const info = COUNTRY_DATA[c] || { flag: "🏳️", code: "" };
                      return (
                        <option key={c} value={c} className="text-gray-900 bg-white">
                          {info.flag} {c} ({info.code})
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
              </motion.div>
            )}

            {activeView === 'login' && (
              <motion.div
                key="login-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
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
                        setValidationError(null);
                        setSuccessMsg(null);
                        setResetEmail(email);
                        setActiveView('forgot-password');
                      }}
                      className="text-[10px] font-mono font-bold text-blue-600 hover:underline cursor-pointer focus:outline-none"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'otp-verify' && (
              <motion.div
                key="otp-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1.5 text-center py-2">
                  <label htmlFor="auth-otp-input" className="block text-xs font-semibold text-gray-700 tracking-wide uppercase font-mono">
                    Security Verification Code
                  </label>
                  <input
                    id="auth-otp-input"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full max-w-[200px] mx-auto text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-950 shadow-inner"
                    required
                    autoFocus
                  />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendRegistrationOtp}
                    disabled={cooldown > 0}
                    className={`text-xs font-mono font-bold inline-flex items-center space-x-1 ${
                      cooldown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                    <span>{cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeView === 'forgot-password' && (
              <motion.div
                key="forgot-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <Input
                  label="Registered Email Address"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="investor@metafirm.io"
                  id="auth-forgot-email-input"
                  required
                  autoFocus
                />
              </motion.div>
            )}

            {activeView === 'reset-password' && (
              <motion.div
                key="reset-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1.5 text-center py-2">
                  <label htmlFor="auth-recovery-otp" className="block text-xs font-semibold text-gray-700 tracking-wide uppercase font-mono">
                    Recovery Code (OTP)
                  </label>
                  <input
                    id="auth-recovery-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full max-w-[200px] mx-auto text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 text-gray-950 shadow-inner"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5 min-w-0 relative">
                  <label htmlFor="auth-password-reset-input" className="block text-xs font-semibold text-gray-700 tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password-reset-input"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0 relative">
                  <label htmlFor="auth-confirm-password-reset-input" className="block text-xs font-semibold text-gray-700 tracking-wide">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password-reset-input"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendForgotPasswordOtp}
                    disabled={cooldown > 0}
                    className={`text-xs font-mono font-bold inline-flex items-center space-x-1 ${
                      cooldown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                    <span>{cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Recovery Code'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit CTA */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full mt-2"
            variant="primary"
            size="lg"
            id="auth-submit-btn"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {activeView === 'login' && 'Sign In'}
            {activeView === 'register' && 'Send Verification Code'}
            {activeView === 'otp-verify' && 'Verify & Activate'}
            {activeView === 'forgot-password' && 'Request Recovery Code'}
            {activeView === 'reset-password' && 'Reset Password'}
          </Button>
        </form>

        {/* Bottom Switch Links */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          {activeView === 'login' && (
            <p className="text-xs text-gray-500 font-sans">
              New to MetaFirm?
              <button
                onClick={() => {
                  setValidationError(null);
                  setSuccessMsg(null);
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
                  setValidationError(null);
                  setSuccessMsg(null);
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
                  setValidationError(null);
                  setSuccessMsg(null);
                  setDebugOtp(null);
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
                  setValidationError(null);
                  setSuccessMsg(null);
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
                  setValidationError(null);
                  setSuccessMsg(null);
                  setDebugOtp(null);
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
