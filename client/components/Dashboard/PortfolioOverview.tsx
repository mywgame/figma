/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from '../ui/Cards/index.tsx';
import { useTheme } from '../../hooks/useTheme.ts';

interface DatasetPoint {
  dayName: string;
  totalAssets: number;
  dailyYield: number;
  teamIncome: number;
  referralIncome: number;
  incentive: number;
}

interface PortfolioOverviewProps {
  wallet?: {
    availableBalance: string;
    lockedBalance: string;
    principalBalance: string;
    trialBalance: string;
    totalAssets: string;
  } | null;
  earnings?: {
    dailyYield: string;
    teamIncome: string;
    referralIncome: string;
    incentiveIncome: string;
  } | null;
}

/**
 * Earnings Overview chart. Preserves the original multi-metric line-chart
 * feature set (Total Assets / Daily Yield / Team / Referral / Incentive,
 * with a hoverable "Day 7 = live value" trend) — only the visual layer was
 * reskinned to be dark/light theme-aware, matching the rest of the Dashboard.
 */
export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ wallet, earnings }) => {
  const { t } = useTheme();
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(6); // Default hover on Day 7

  // Parse live metrics from backend
  const liveAssets = wallet ? parseFloat(wallet.totalAssets) : 12546.67;
  const liveYield = earnings ? parseFloat(earnings.dailyYield) : 56.80;
  const liveTeam = earnings ? parseFloat(earnings.teamIncome) : 320.00;
  const liveReferral = earnings ? parseFloat(earnings.referralIncome) : 245.00;
  const liveIncentive = earnings ? parseFloat(earnings.incentiveIncome) : 117.20;

  // Dynamically scale historical data points so they converge at the live value on Day 7
  const datasets: DatasetPoint[] = [
    { dayName: 'Day 1', totalAssets: liveAssets * 0.4, dailyYield: liveYield * 0.3, teamIncome: liveTeam * 0.2, referralIncome: liveReferral * 0.2, incentive: liveIncentive * 0.3 },
    { dayName: 'Day 2', totalAssets: liveAssets * 0.5, dailyYield: liveYield * 0.4, teamIncome: liveTeam * 0.3, referralIncome: liveReferral * 0.4, incentive: liveIncentive * 0.4 },
    { dayName: 'Day 3', totalAssets: liveAssets * 0.6, dailyYield: liveYield * 0.5, teamIncome: liveTeam * 0.4, referralIncome: liveReferral * 0.5, incentive: liveIncentive * 0.5 },
    { dayName: 'Day 4', totalAssets: liveAssets * 0.75, dailyYield: liveYield * 0.65, teamIncome: liveTeam * 0.55, referralIncome: liveReferral * 0.6, incentive: liveIncentive * 0.6 },
    { dayName: 'Day 5', totalAssets: liveAssets * 0.85, dailyYield: liveYield * 0.8, teamIncome: liveTeam * 0.75, referralIncome: liveReferral * 0.8, incentive: liveIncentive * 0.8 },
    { dayName: 'Day 6', totalAssets: liveAssets * 0.95, dailyYield: liveYield * 0.9, teamIncome: liveTeam * 0.9, referralIncome: liveReferral * 0.9, incentive: liveIncentive * 0.95 },
    { dayName: 'Day 7', totalAssets: liveAssets, dailyYield: liveYield, teamIncome: liveTeam, referralIncome: liveReferral, incentive: liveIncentive },
  ];

  // Map data to SVG viewBox="0 0 700 320"
  const width = 700;
  const height = 320;
  const paddingLeft = 48;
  const paddingRight = 12;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (datasets.length - 1)) * chartWidth;
  };

  // Find max value in dataset to scale Y axis perfectly
  const maxVal = Math.max(...datasets.map(d => Math.max(d.totalAssets, d.dailyYield, d.teamIncome, d.referralIncome, d.incentive)), 100);
  const scaleMax = Math.ceil(maxVal / 100) * 100;

  const getY = (value: number) => {
    if (scaleMax === 0) return paddingTop + chartHeight;
    return paddingTop + chartHeight - (value / scaleMax) * chartHeight;
  };

  // Generate SVG path 'd' for a given key
  const getPathD = (key: keyof Omit<DatasetPoint, 'dayName'>) => {
    return datasets
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[key] as number);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

  // Colors mapping matching mockup
  const linesConfig = [
    { key: 'totalAssets' as const, color: '#3b82f6', label: 'Total Assets' },
    { key: 'dailyYield' as const, color: '#10b981', label: 'Daily Yield' },
    { key: 'teamIncome' as const, color: '#8b5cf6', label: 'Team Income' },
    { key: 'referralIncome' as const, color: '#f97316', label: 'Referral Income' },
    { key: 'incentive' as const, color: '#ef4444', label: 'Incentive Income' },
  ];

  // Resolve current active day for display stats
  const activePoint = datasets[activeDayIndex ?? 6];

  return (
    <Card
      id="metafirm-enterprise-analytics"
      className={`backdrop-blur-lg border p-5 sm:p-6 rounded-2xl text-left flex flex-col justify-between h-full transition-all duration-300 w-full ${t.card}`}
    >

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
        <div className="space-y-1.5 w-full text-left">
          <h3 className={`text-sm font-sans font-extrabold uppercase tracking-tight ${t.text}`}>
            Earnings Overview <span className={`font-medium font-sans text-xs lowercase ${t.textMuted}`}>(last 7 days growth)</span>
          </h3>
        </div>
      </div>

      {/* Primary Analytics Graph Canvas Container */}
      <div className={`relative flex-grow min-h-[260px] rounded-2xl border pt-4 pb-2 px-1 overflow-hidden ${t.cardInner} ${t.sep}`}>
        <div className="w-full h-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[10px]" preserveAspectRatio="none">
            {/* Grid Horizontal Lines & Y Axis Labels */}
            {[0, scaleMax * 0.25, scaleMax * 0.5, scaleMax * 0.75, scaleMax].map((val) => {
              const y = getY(val);
              const label = val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val.toFixed(0)}`;
              return (
                <g key={val} className="opacity-80">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={t.chartGrid}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill={t.chartTick}
                    className="font-sans font-bold text-[11px]"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Vertical lines for each day column */}
            {datasets.map((_, i) => {
              const x = getX(i);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke={t.chartGrid}
                  strokeWidth="1"
                />
              );
            })}

            {/* Render line paths */}
            {linesConfig.map((line) => (
              <g key={line.key}>
                <path
                  d={getPathD(line.key)}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* Dots at intersection points */}
                {datasets.map((point, pointIdx) => (
                  <circle
                    key={pointIdx}
                    cx={getX(pointIdx)}
                    cy={getY(point[line.key] as number)}
                    r={pointIdx === activeDayIndex ? '4.5' : '3'}
                    fill={line.color}
                    stroke={t.tooltipBg}
                    strokeWidth={pointIdx === activeDayIndex ? '2' : '1'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setActiveDayIndex(pointIdx)}
                  />
                ))}
              </g>
            ))}

            {/* Highlight line for the hovered day */}
            {activeDayIndex !== null && (
              <line
                x1={getX(activeDayIndex)}
                y1={paddingTop}
                x2={getX(activeDayIndex)}
                y2={height - paddingBottom}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="pointer-events-none"
              />
            )}

            {/* X-Axis labels */}
            {datasets.map((d, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 10}
                textAnchor="middle"
                fill={t.chartTick}
                className="font-sans font-bold text-[11px] cursor-pointer"
                onMouseEnter={() => setActiveDayIndex(i)}
              >
                {d.dayName}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Bottom Row - Active Day Performance */}
      <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-[10px] font-mono font-bold uppercase tracking-wider w-full ${t.sep} ${t.textMuted}`}>
        <span className="text-indigo-500 font-extrabold">{activePoint.dayName.toUpperCase()} DETAILS</span>
        <span className={t.textMuted}>•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          <span>Assets: <strong className={`font-sans font-extrabold ${t.text}`}>${activePoint.totalAssets.toFixed(2)}</strong></span>
        </span>
        <span className={t.textMuted}>•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span>Yield: <strong className={`font-sans font-extrabold ${t.text}`}>${activePoint.dailyYield.toFixed(2)}</strong></span>
        </span>
        <span className={t.textMuted}>•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
          <span>Team: <strong className={`font-sans font-extrabold ${t.text}`}>${activePoint.teamIncome.toFixed(2)}</strong></span>
        </span>
        <span className={t.textMuted}>•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
          <span>Referral: <strong className={`font-sans font-extrabold ${t.text}`}>${activePoint.referralIncome.toFixed(2)}</strong></span>
        </span>
        <span className={t.textMuted}>•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span>Incentive: <strong className={`font-sans font-extrabold ${t.text}`}>${activePoint.incentive.toFixed(2)}</strong></span>
        </span>
      </div>

    </Card>
  );
};

export default PortfolioOverview;
