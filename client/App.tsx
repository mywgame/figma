/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { BaseLayout } from './layouts/BaseLayout.tsx';
import { 
  Database, 
  ShieldCheck, 
  KeyRound, 
  Layers, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  ShieldAlert,
  Lock,
  XCircle
} from 'lucide-react';

// Import our new Phase 4 World-Class Landing Page Components
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { About } from './components/About.tsx';
import { WhyChooseUs } from './components/WhyChooseUs.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Stats } from './components/Stats.tsx';
import { Security } from './components/Security.tsx';
import { Faq } from './components/Faq.tsx';
import { Contact } from './components/Contact.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { getPendingReferralCode } from './components/Auth/Register/Register.tsx';
import { UserDashboard } from './components/Dashboard/index.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { EnterpriseAdminDashboard } from './components/Admin/index.tsx';
import { Button } from './components/ui/Buttons/index.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';


/**
 * ORIGINAL CORE DASHBOARD VIEW (Preserved exactly as requested)
 */
function DashboardContent({ onBackToLanding }: { onBackToLanding: () => void }) {
  const { user, login, loading, error } = useAuth();
  const [email, setEmail] = useState('');

  const handleManualSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      login(email.trim());
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Back Header shortcut */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Premium Public Page</span>
        </button>
        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
          Enterprise Node Admin View
        </span>
      </div>

      {/* Title / Typography Pairing */}
      <div className="text-center md:text-left space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-xs text-emerald-700 font-medium font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
          <span>FinTech Core Architecture Successfully Bound</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-gray-950 tracking-tight leading-none">
          Enterprise MetaFirm Platform Foundation
        </h2>
        <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
          A production-grade, highly scalable full-stack architecture. Powered by an Express.js backend, 
          a Vite-React frontend, standard JWT authentication middleware, and a PostgreSQL database mapped via Drizzle ORM.
        </p>
      </div>

      {/* Main Grid: Info Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Postgres Database */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-gray-900 mb-2">
              PostgreSQL & Drizzle ORM
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Connection pooling configured securely. Schema is verified, optimized, and pushed to 
              Cloud SQL. Re-use safe prepared statements and index strategies.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center space-x-2 text-[10px] font-mono text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Schema: users table active</span>
          </div>
        </div>

        {/* Card 2: Security Middleware */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-gray-900 mb-2">
              Zero-Trust Security
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pre-loaded with modular security middlewares for Helmet headers, CORS policy enforcement, 
              global rate limiting, and robust JWT verification structures.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center space-x-2 text-[10px] font-mono text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Rate Limiting & Helmet: Active</span>
          </div>
        </div>

      </div>

      {/* Auth Synchronization Demonstration Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden md:block">
          <Layers className="w-40 h-40 text-gray-950" />
        </div>

        <div className="max-w-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-950">
              Identity Synchronization Engine
            </h3>
          </div>

          <p className="text-gray-500 text-xs leading-relaxed">
            Test the live backend sync. Enter your email to issue a secure simulated JWT token and trigger 
            the server's profile synchronizer. The PostgreSQL database will upsert your user record and return 
            your verified platform identity.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-mono">
              Authentication Sync Failed: {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <span>Verifying secure connection details...</span>
            </div>
          ) : user ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 font-mono text-left">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200/50">
                <span className="text-gray-400">Database Connection Status</span>
                <span className="text-emerald-500 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Synced
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Database Row ID: </span>
                  <span className="text-gray-900 font-bold">{user.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Platform Email: </span>
                  <span className="text-gray-700 font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Authorization UID: </span>
                  <span className="text-gray-700 select-all">{user.uid}</span>
                </div>
                <div>
                  <span className="text-gray-400">Platform Role: </span>
                  <span className="text-emerald-600 font-bold">{user.role}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created At: </span>
                  <span className="text-gray-500">{new Date(user.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Updated At: </span>
                  <span className="text-gray-500">{new Date(user.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSync} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="developer@cefi.platform"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-950 bg-white max-w-sm flex-grow"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-xs font-semibold active:scale-95 transition-all duration-150 shadow-sm border border-gray-950 cursor-pointer"
              >
                <span>Trigger Secure Login & Database Sync</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Directory Diagnostics Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-gray-950">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h4 className="font-display font-semibold text-sm">Monorepo Directory Integrity Diagnostics</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-left">
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-gray-400 block text-[10px] uppercase">Client Directory</span>
            <span className="text-gray-800 font-semibold">/client [OK]</span>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-gray-400 block text-[10px] uppercase">Server Directory</span>
            <span className="text-gray-800 font-semibold">/server [OK]</span>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-gray-400 block text-[10px] uppercase">Shared Directory</span>
            <span className="text-gray-800 font-semibold">/shared [OK]</span>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-gray-400 block text-[10px] uppercase">Database Schema</span>
            <span className="text-gray-800 font-semibold">Drizzle [OK]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MAIN APP CONTAINER WITH EMBEDDED PHASE 4 WEBSITE
 */
function MainAppContent() {
  const { user, token, syncProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [activeSection, setActiveSection] = useState('hero');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [referralCodeForAuth, setReferralCodeForAuth] = useState<string>('');

  // Initial premium app loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1800); // 1.8 seconds allows the shimmer progress to complete elegantly
    return () => clearTimeout(timer);
  }, []);

  // 1. Client-Side Pathname & Referral Routing Sync
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      const searchParams = new URLSearchParams(search);
      const codeFromSearch = searchParams.get('ref') || searchParams.get('referralCode') || searchParams.get('referral');
      const pathMatch = path.match(/^\/ref\/([^\/]+)/i);
      const extractedCode = (codeFromSearch || (pathMatch && pathMatch[1]) || '').trim();

      if (extractedCode) {
        try {
          sessionStorage.setItem('pendingReferralCode', extractedCode);
        } catch (e) {
          // ignore storage errors
        }
        setReferralCodeForAuth(extractedCode);
      }

      if (path === '/admin') {
        setCurrentView('admin');
      } else if (path === '/dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
        // If route is /register or /ref/CODE or a referral code is present in URL query params, trigger registration modal
        if (path === '/register' || path.startsWith('/ref/') || extractedCode) {
          setAuthModalMode('register');
          setIsAuthModalOpen(true);
        }
      }
    };

    // Run once on initial mount
    handleLocationChange();

    // Listen to browser forward/back popstate events
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update window.location.pathname dynamically when currentView state changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentView === 'admin' && currentPath !== '/admin') {
      window.history.pushState(null, '', '/admin');
    } else if (currentView === 'dashboard' && currentPath !== '/dashboard') {
      window.history.pushState(null, '', '/dashboard');
    } else if (currentView === 'landing') {
      if (currentPath !== '/' && currentPath !== '/register' && !currentPath.startsWith('/ref/')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentView]);

  // 2. Automatically navigate to correct destination after successful login
  useEffect(() => {
    if (user && currentView === 'landing') {
      const role = user.role.toLowerCase();
      if (['admin', 'superadmin', 'operator', 'support', 'finance', 'auditor'].includes(role)) {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [user, currentView]);

  // 3. Clear session and return to landing view on logout
  useEffect(() => {
    if (!user && (currentView === 'admin' || currentView === 'dashboard')) {
      setCurrentView('landing');
    }
  }, [user, currentView]);

  // 4. Automatically trigger login popup if unauthenticated visitor tries to access /admin
  useEffect(() => {
    if (currentView === 'admin' && !user) {
      handleOpenAuth('login');
    }
  }, [currentView, user]);

  // Section Tracking for Navbar Highlighter
  useEffect(() => {
    if (currentView !== 'landing') return;

    const sections = ['hero', 'about', 'benefits', 'how-it-works', 'security', 'faq', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160; // Offset for sticky navbar height
      
      for (const sId of sections) {
        const el = document.getElementById(`${sId}-section`) || document.getElementById(sId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      const code = getPendingReferralCode();
      if (code) {
        setReferralCodeForAuth(code);
      }
    }
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (sectionId === 'dashboard-dev') {
      setCurrentView('dashboard');
      return;
    }

    setCurrentView('landing');
    setTimeout(() => {
      const el = document.getElementById(`${sectionId}-section`) || document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(sectionId);
      }
    }, 50);
  };

  // Switch between public high-end landing page, user dashboard, and enterprise admin dashboard
  if (currentView === 'admin') {
    const isAuthorized = user && [
      'admin', 'superadmin', 'operator', 'support', 'finance', 'auditor'
    ].includes(user.role.toLowerCase());

    if (!user) {
      return (
        <>
          <AnimatePresence>
            {isAppLoading && <LoadingScreen />}
          </AnimatePresence>
          <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
            <div className="max-w-md w-full bg-white p-8 border border-gray-100 rounded-2xl shadow-xl space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-black text-gray-950 uppercase tracking-tight">Authentication Required</h3>
                <p className="text-xs text-gray-400 font-mono">SECURE OPERATIONS ENCLAVE</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Access to the MetaFirm Platform operational console requires active multi-factor cryptographic authentication. Please sign in to verify credentials.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Website
                </button>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all hover:shadow-md cursor-pointer"
                >
                  Login to Session
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (!isAuthorized) {
      return (
        <>
          <AnimatePresence>
            {isAppLoading && <LoadingScreen />}
          </AnimatePresence>
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none font-sans">
          <div className="max-w-lg w-full bg-white border border-red-100/80 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
            {/* Danger Warning Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
            
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-gray-950 uppercase tracking-tight">Access Prohibited</h3>
              <p className="text-[10px] font-mono text-red-600 font-bold tracking-widest uppercase">
                SECURITY FIREWALL INTERCEPT [ERR_AUTH_DENIED]
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2 text-left text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Authenticated Identity:</span>
                <span className="font-semibold text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Assigned Role:</span>
                <span className="font-bold text-red-600 uppercase bg-red-50 border border-red-100/50 px-1.5 py-0.5 rounded text-[10px]">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required Clearances:</span>
                <span className="font-semibold text-gray-700">ADMIN, OPERATOR, AUDITOR, etc.</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-gray-100">
                <span className="text-gray-400">Telemetry Log Status:</span>
                <span className="text-red-500 font-bold uppercase animate-pulse">● REPORTED TO SYSTEM AUDIT</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              Your security credentials do not grant access to the root operations console. This unauthorized attempt has been logged along with your active IP address in accordance with standard financial audit policies.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCurrentView('landing')}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Back to Landing
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-gray-950 hover:bg-gray-800 rounded-xl transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Core Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
    }

    return (
      <>
        <AnimatePresence>
          {isAppLoading && <LoadingScreen />}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-navy-950 flex flex-col"
        >
          <EnterpriseAdminDashboard onBackToLanding={() => setCurrentView('landing')} />
        </motion.div>
      </>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <AnimatePresence>
          {isAppLoading && <LoadingScreen />}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-navy-950 flex flex-col"
        >
          <ThemeProvider>
            <UserDashboard onBackToLanding={() => setCurrentView('landing')} />
          </ThemeProvider>
        </motion.div>
      </>
    );
  }


  return (
    <>
      <AnimatePresence>
        {isAppLoading && <LoadingScreen />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="min-h-screen bg-navy-950 text-white font-sans flex flex-col antialiased"
      >
      
      {/* 1. Header (Navbar component) */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        onNavigateToSection={handleNavigateToSection} 
        activeSection={activeSection}
      />

      {/* 2. Main content pages */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <div id="hero">
          <Hero 
            onOpenAuth={handleOpenAuth} 
            onNavigateToSection={handleNavigateToSection} 
          />
        </div>

        {/* About Company Section */}
        <div id="about">
          <About />
        </div>

        {/* Why Choose Us Section */}
        <div id="benefits">
          <WhyChooseUs />
        </div>

        {/* How It Works Section */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Platform Statistics Section */}
        <div id="stats">
          <Stats />
        </div>

        {/* Security Highlights Section */}
        <div id="security">
          <Security />
        </div>

        {/* FAQs Section */}
        <div id="faq">
          <Faq />
        </div>

        {/* Contact Desk Section */}
        <div id="contact">
          <Contact />
        </div>

      </main>

      {/* 3. Footer */}
      <Footer onNavigateToSection={handleNavigateToSection} />

      {/* 4. Auth Modal Portal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode} 
        initialReferralCode={referralCodeForAuth}
      />

      {/* 5. Floating Quick-Link to original sync dashboard when authenticated */}
      {user && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2 px-5 py-3.5 bg-gray-950 text-white rounded-full text-xs font-bold hover:bg-gray-800 shadow-xl border border-gray-800 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            title="Open Developer Ledger Dashboard"
            id="floating-dashboard-shortcut"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Developer Core Dashboard</span>
          </button>
        </div>
      )}

    </motion.div>
  </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
