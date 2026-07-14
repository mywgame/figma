import React from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Server, Activity, Eye, ShieldAlert, Award, Shield, CheckCircle2 } from 'lucide-react';
import { securityHighlights } from '../utils/landingData.ts';

const EASE = [0.16, 1, 0.3, 1] as const;

const getSecurityIcon = (name: string) => {
  switch (name) {
    case 'Fingerprint':
      return Fingerprint;
    case 'ServerCrash':
      return Server;
    case 'Activity':
      return Activity;
    case 'Eye':
      return Eye;
    case 'ShieldAlert':
      return ShieldAlert;
    default:
      return Shield;
  }
};

export const Security: React.FC = () => {
  return (
    <section id="security" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5 relative overflow-hidden">
      {/* Absolute ambient lights */}
      <div
        className="absolute right-1/4 top-1/3 z-0 h-[380px] w-[380px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(233,30,140,0.18), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section title & Audit Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan font-bold block mb-2">
              Cryptographic Safeguards
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Zero-Trust Security Engine
            </h2>
            <p className="text-sm sm:text-base text-ink-300 leading-relaxed font-sans max-w-xl">
              Our financial platform is engineered with defensive security layers at every level of the protocol stack. 
              We protect both client sessions and core systems from extraction and vector attacks.
            </p>
          </div>

          {/* Secure Audit Certificate visual representation */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <div className="relative group w-full max-w-md">
              <div className="absolute -inset-0.5 rounded-[24px] bg-brand-gradient opacity-30 blur-lg transition-all duration-300 group-hover:opacity-40" />
              <div className="relative bg-navy-900 border border-white/10 text-white rounded-[24px] p-6 sm:p-8 overflow-hidden text-left shadow-2xl">
                {/* Overlay art */}
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  <Shield className="w-40 h-40" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-brand-cyan" />
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-brand-cyan-light">Audit Status: A+ Rated</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-display font-bold leading-snug">Continuous Real-time Ledger Verification</h4>
                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-sans">
                    Third-party cybersecurity leaders perform weekly automated penetration sweeps and constant integrity monitoring of our secure database clusters.
                  </p>
                  <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white">SSL/TLS 1.3 Active</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white">AES-256 Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left" id="security-pillar-grid" role="list">
          {securityHighlights.map((pillar, idx) => {
            const Icon = getSecurityIcon(pillar.iconName);
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: idx * 0.05 }}
                role="listitem"
                className="glass-panel p-6 sm:p-7 bg-white/[0.01] border border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-brand-cyan w-fit mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider">
                  <span>Cryptographic Shield</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Security;
