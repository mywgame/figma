import React from 'react';
import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    idx: '01',
    title: 'Submit your model',
    body: 'A two-page memo: unit economics, utilization or capacity factor, and the ask. No 40-slide deck required.',
  },
  {
    idx: '02',
    title: 'Diligence sprint',
    body: 'Site visits, hardware or interconnection audits, and customer reference calls — completed in under three weeks.',
  },
  {
    idx: '03',
    title: 'Term sheet',
    body: 'Structured as senior debt, revenue share, or equity — whichever fits the asset and your stage.',
  },
  {
    idx: '04',
    title: 'Capital deployed',
    body: 'Funds released against milestones — hardware delivery, interconnection approval, or COD — not just a signature.',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="benefits" className="border-y border-white/5 bg-navy-900 py-24 sm:py-32 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 max-w-2xl text-left"
        >
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-brand-cyan font-bold">
            Onboarding Pipeline
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white tracking-tight">
            From memo to money, in weeks.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-300 font-sans leading-relaxed">
            Skip the endless venture pitching cycles. We operate on asset economics, utilizing swift audit sprints to deploy capital to qualified developers.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 }}
              className="glass-panel p-6 sm:p-8 bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="mb-4 block font-mono text-lg font-bold text-brand-cyan">
                  {step.idx}
                </span>
                <div className="mb-6 h-[2px] w-12 bg-brand-gradient" />
                <h4 className="mb-3 text-lg font-bold text-white font-display">{step.title}</h4>
                <p className="text-xs sm:text-sm text-ink-300 font-sans leading-relaxed">{step.body}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 text-[10px] font-mono text-ink-500 font-bold uppercase tracking-wider">
                Pipeline Stage {step.idx}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
