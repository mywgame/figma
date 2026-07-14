import React from 'react';
import { motion } from 'motion/react';
import gpuIllustrationImg from '../../assets/images/illustrations/gpu-farm-illustration.svg';
import solarIllustrationImg from '../../assets/images/illustrations/solar-farm-illustration.svg';

const EASE = [0.16, 1, 0.3, 1] as const;

interface VerticalCardProps {
  variant: 'compute' | 'solar';
  title: string;
  description: string;
  bullets: string[];
  statNum: string;
  statLabel: string;
  illustration: React.ReactNode;
  icon: React.ReactNode;
  delay?: number;
}

function VerticalCard({
  variant,
  title,
  description,
  bullets,
  statNum,
  statLabel,
  illustration,
  icon,
  delay = 0,
}: VerticalCardProps) {
  const accentText = variant === 'compute' ? 'text-brand-magenta-light' : 'text-brand-cyan';
  const barGradient =
    variant === 'compute'
      ? 'from-brand-magenta to-brand-magenta-light'
      : 'from-brand-blue to-brand-cyan';
  const iconBg = variant === 'compute' ? 'bg-brand-magenta/15' : 'bg-brand-blue/15';
  const iconColor = variant === 'compute' ? 'text-brand-magenta-light' : 'text-brand-cyan';
  const dotColor = variant === 'compute' ? 'bg-brand-magenta-light' : 'bg-brand-cyan';
  const iconRing = variant === 'compute' ? 'ring-brand-magenta/30' : 'ring-brand-blue/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-navy-900 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] text-left"
    >
      <div className={`absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r ${barGradient}`} />
      
      {/* Illustration banner */}
      <div className="relative overflow-hidden h-44 sm:h-48">
        <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
          {illustration}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/10 to-transparent" />
        <div
          className={`absolute -bottom-6 left-8 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-white/10 ${iconBg} ${iconColor} ring-4 ${iconRing} ring-offset-2 ring-offset-navy-900 backdrop-blur-sm`}
        >
          {icon}
        </div>
      </div>

      <div className="p-9 pt-11 text-left">
        <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h3>
        <p className="mt-3.5 text-[14px] text-ink-300 font-sans leading-relaxed">{description}</p>
        <ul className="mt-6 flex flex-col gap-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="relative pl-5 text-xs sm:text-sm text-ink-300 font-sans">
              <span className={`absolute left-0 top-2 h-1.5 w-1.5 rounded-sm ${dotColor}`} />
              {bullet}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
          <span className={`font-mono text-lg font-bold ${accentText}`}>{statNum}</span>
          <span className="text-[11px] uppercase tracking-wider font-bold text-ink-500 font-mono">{statLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

const ComputeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
);

const SolarIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 sm:py-32 bg-navy-950 text-white border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Thesis Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 max-w-2xl text-left"
        >
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-brand-cyan font-bold">
            What We Fund / Investment Thesis
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
            Two currents. One thesis.
          </h2>
          <p className="mt-4 text-[15px] sm:text-[16.5px] text-ink-300 font-sans leading-relaxed">
            Compute and energy are converging into the same infrastructure
            stack. We back the operators building both sides of it — the
            machines that think, and the power that runs them.
          </p>
        </motion.div>

        {/* Verticals Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <VerticalCard
            variant="compute"
            title="Virtual GPU Farms"
            description="We fund operators who convert capital into compute capacity — colocated GPU clusters leased to AI labs, render studios, and inference platforms hungry for cycles."
            bullets={[
              'Underwritten on actual utilization, not AI hype',
              'Hardware-secured institutional lending structures',
              'Optimized revenue-share and equity blends',
            ]}
            statNum="21 Nodes"
            statLabel="compute operators funded"
            illustration={
              <img
                src={gpuIllustrationImg}
                alt="Virtual GPU Farms"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            }
            icon={ComputeIcon}
          />
          <VerticalCard
            variant="solar"
            title="Solar Energy Farms"
            description="We fund early and growth-stage solar developers building utility-scale and behind-the-meter farms — the power layer every compute farm eventually competes for."
            bullets={[
              'PPA-backed robust structuring',
              'Land, interconnection & permitting meticulous diligence',
              'Blended debt and equity capital stacks',
            ]}
            statNum="17 Farms"
            statLabel="energy operators funded"
            illustration={
              <img
                src={solarIllustrationImg}
                alt="Solar Energy Farms"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            }
            icon={SolarIcon}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
};

export default About;
