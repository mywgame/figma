/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TOKENS } from '../theme.ts';
import { Copy, Check } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-gray-100/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] ${
        hoverEffect ? 'hover:border-blue-100/80 hover:shadow-[0_12px_32px_rgba(37,99,235,0.035)] transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const truncateId = (str: string) => {
  if (str.length <= 15) return str;
  return `${str.slice(0, 9)}...${str.slice(-4)}`;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  className = '',
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const isUserId = title.toLowerCase().includes('user id') || title.toLowerCase().includes('operator');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = isUserId ? truncateId(String(value)) : value;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`bg-white border border-gray-100/90 rounded-2xl p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-blue-100/80 hover:shadow-[0_12px_24px_rgba(37,99,235,0.03)] flex flex-col justify-between h-full w-full min-h-[135px] relative overflow-hidden group ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between w-full gap-2 mb-2.5">
        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block truncate">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-gray-50/80 border border-gray-100/50 text-gray-400 group-hover:scale-105 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 flex-shrink-0">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' }) : icon}
          </div>
        )}
      </div>

      <div className="space-y-1 text-left w-full flex-grow flex flex-col justify-end">
        <div className="flex items-center gap-1.5 min-w-0">
          <span 
            className="text-base sm:text-lg font-display font-extrabold text-gray-950 tracking-tight leading-none truncate flex-grow"
            title={String(value)}
          >
            {displayValue}
          </span>
          {isUserId && (
            <button
              onClick={handleCopy}
              className="p-1 rounded bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-100 transition-colors flex-shrink-0 cursor-pointer"
              title="Copy ID"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
        
        {trend && (
          <div className="pt-2 border-t border-gray-100/40 w-full flex items-center space-x-1.5 text-[9px] font-mono leading-none mt-1.5">
            <span
              className={`font-bold ${
                trendDirection === 'up'
                  ? 'text-emerald-600'
                  : trendDirection === 'down'
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'primary' | 'amber' | 'emerald';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  icon,
  badge,
  badgeVariant = 'primary',
  className = '',
  ...props
}) => {
  const badgeColors = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  };

  return (
    <div
      className={`bg-white border border-gray-100/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:border-blue-100/80 hover:shadow-[0_12px_32px_rgba(37,99,235,0.035)] transition-all duration-300 text-left space-y-4 group ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            {icon}
          </div>
        )}
        {badge && (
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${badgeColors[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-semibold text-gray-950 text-sm sm:text-base group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>
        <div className="text-xs text-gray-500 leading-relaxed font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

export const GlassCard: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] relative overflow-hidden ${
        hoverEffect ? 'hover:shadow-[0_16px_48px_rgba(0,0,0,0.04)] transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
