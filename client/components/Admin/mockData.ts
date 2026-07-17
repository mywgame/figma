/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AdminUser,
  AdminDeposit,
  AdminWithdrawal,
  AdminTicket,
  AdminAuditLog,
  AdminSession,
  SecurityAlert
} from './types.ts';

export const USERS_MOCK: AdminUser[] = [
  {
    id: 'MF-001',
    name: 'Alex Morgan',
    email: 'alex@metafirm.app',
    mobile: '+1-555-0199',
    rank: 'VIP8',
    balance: '$24,567.00',
    referralCode: 'ALEX888',
    levelA: 32,
    levelB: 78,
    levelC: 110,
    levelD: 45,
    status: 'Active',
    joined: 'Jan 12, 2024',
    adminNotes: 'High-value priority partner. VIP coordinator.'
  },
  {
    id: 'MF-002',
    name: 'Sarah Khan',
    email: 'sarah@metafirm.app',
    mobile: '+44-20-7946-0192',
    rank: 'VIP7',
    balance: '$8,340.00',
    referralCode: 'SARAH77',
    levelA: 18,
    levelB: 35,
    levelC: 28,
    levelD: 15,
    status: 'Active',
    joined: 'Feb 3, 2024',
    adminNotes: 'Strong community builder in South Asia.'
  },
  {
    id: 'MF-003',
    name: 'John Crypto',
    email: 'john@metafirm.app',
    mobile: '+65-9123-4567',
    rank: 'VIP5',
    balance: '$2,190.00',
    referralCode: 'JOHN555',
    levelA: 8,
    levelB: 12,
    levelC: 18,
    levelD: 10,
    status: 'Suspended',
    joined: 'Mar 7, 2024',
    adminNotes: 'Suspended temporarily for multiple device access verification.'
  },
  {
    id: 'MF-004',
    name: 'Mike DeFi',
    email: 'mike@metafirm.app',
    mobile: '+1-415-555-2671',
    rank: 'VIP7',
    balance: '$11,450.00',
    referralCode: 'MIKEDEFI',
    levelA: 16,
    levelB: 30,
    levelC: 45,
    levelD: 22,
    status: 'Active',
    joined: 'Jan 28, 2024',
    adminNotes: 'Active yield optimizer.'
  },
  {
    id: 'MF-005',
    name: 'Luna Trade',
    email: 'luna@metafirm.app',
    mobile: '+81-90-1234-5678',
    rank: 'VIP4',
    balance: '$980.00',
    referralCode: 'LUNA444',
    levelA: 6,
    levelB: 8,
    levelC: 5,
    levelD: 2,
    status: 'Active',
    joined: 'Apr 15, 2024',
    adminNotes: 'Regular withdrawal patterns.'
  },
  {
    id: 'MF-006',
    name: 'Node Whale',
    email: 'node@metafirm.app',
    mobile: '+1-212-555-0143',
    rank: 'VIP8',
    balance: '$98,200.00',
    referralCode: 'WHALE88',
    levelA: 35,
    levelB: 95,
    levelC: 140,
    levelD: 82,
    status: 'Active',
    joined: 'Dec 1, 2023',
    adminNotes: 'Top liquidity provider on the platform.'
  },
  {
    id: 'MF-007',
    name: 'Emma Retail',
    email: 'emma@metafirm.app',
    mobile: '+33-6-5555-0122',
    rank: 'VIP6',
    balance: '$3,600.00',
    referralCode: 'EMMA666',
    levelA: 10,
    levelB: 24,
    levelC: 18,
    levelD: 8,
    status: 'Suspended',
    joined: 'May 2, 2024',
    adminNotes: 'Suspended due to chargeback request review.'
  },
];

export const DEPOSITS_MOCK: AdminDeposit[] = [
  { id: '#DEP-441', user: 'alex_morgan',  amount: '$500',    method: 'USDT (TRC20)', txHash: 'TX7a8b66c2dd662f6b8b8b8b8b', date: '2 min ago',  status: 'Pending'   },
  { id: '#DEP-440', user: 'node_whale',   amount: '$5,000',  method: 'USDT (BEP20)', txHash: '0x9f4e3c2d1a5b8f2a7b8c9d0e', date: '18 min ago', status: 'Completed' },
  { id: '#DEP-439', user: 'mike_defi',    amount: '$2,000',  method: 'USDT (ERC20)', txHash: '0x2c8d5e6f7e9f8a1b2c3d4e5f', date: '35 min ago', status: 'Pending'   },
  { id: '#DEP-438', user: 'sarah.k',      amount: '$750',    method: 'USDT (TRC20)', txHash: 'TX5b3a4c5d6e7f8a9b0c1d2e3f', date: '1 hour ago',  status: 'Completed' },
  { id: '#DEP-437', user: 'luna_trade',   amount: '$200',    method: 'USDT (BEP20)', txHash: '0x8e2f3d4c5b6a7f8e9d0c1b2a', date: '2 hours ago', status: 'Rejected'  },
];

export const WITHDRAWALS_MOCK: AdminWithdrawal[] = [
  { id: '#WD-221', user: 'sarah.k',     amount: '$1,200', wallet: 'TXa39kLmF9a33g7d8e9f2a4b', date: '8 min ago',  status: 'Pending'   },
  { id: '#WD-220', user: 'node_whale',  amount: '$8,000', wallet: 'TXb72nPqG8b21c4d5e6f7a8b', date: '25 min ago', status: 'Pending'   },
  { id: '#WD-219', user: 'mike_defi',   amount: '$3,400', wallet: '0x2c17rSt2b1c4e5f6a7b8c9d', date: '1 hour ago',  status: 'Approved'  },
  { id: '#WD-218', user: 'luna_trade',  amount: '$800',   wallet: 'TXd54uVwA9c4b3e2d1f0a9b8', date: '2 hours ago', status: 'Rejected'  },
  { id: '#WD-217', user: 'emma_retail', amount: '$450',   wallet: '0xe91xYz8f7e6d5c4b3a2a1a0f', date: '3 hours ago', status: 'Approved'  },
];

export const TICKETS_MOCK: AdminTicket[] = [
  {
    id: '#TK-88',
    user: 'luna_trade',
    subject: 'Withdrawal processing delay after 48 hours',
    priority: 'High',
    status: 'Open',
    date: '10 min ago',
    messages: [
      { sender: 'user', text: 'Hello, my withdrawal is still shown as pending after 48 hours. Please check.', time: '10m ago' }
    ]
  },
  {
    id: '#TK-87',
    user: 'john_crypto',
    subject: 'Suspended account review',
    priority: 'High',
    status: 'Open',
    date: '30 min ago',
    messages: [
      { sender: 'user', text: 'Why is my account suspended? I did not violate any financial policy.', time: '30m ago' }
    ]
  },
  {
    id: '#TK-86',
    user: 'emma_retail',
    subject: 'Referral bonus commission missing',
    priority: 'Medium',
    status: 'Pending',
    date: '1 hour ago',
    messages: [
      { sender: 'user', text: 'I invited Alex Morgan who made a $500 deposit, but I did not receive my Level 1 referral bonus.', time: '1h ago' }
    ]
  },
  {
    id: '#TK-85',
    user: 'mike_defi',
    subject: 'Request to update payout destination address',
    priority: 'Low',
    status: 'Resolved',
    date: '3 hours ago',
    messages: [
      { sender: 'user', text: 'Can I change my default withdrawal address? The old wallet is compromised.', time: '3h ago' },
      { sender: 'admin', text: 'Hello! For your security, please update your wallet in your Security Profile settings. Let us know if you need assistance.', time: '2h ago' }
    ]
  }
];

export const AUDIT_MOCK: AdminAuditLog[] = [
  { action: 'Approved withdrawal #WD-219',     admin: 'superadmin',  ip: '192.168.1.1', time: '5m ago',  module: 'Withdrawals' },
  { action: 'Suspended user john_crypto',       admin: 'mod_raj',     ip: '10.0.0.5',    time: '20m ago', module: 'Users'       },
  { action: 'Updated base commission rate to 5%',admin: 'superadmin',  ip: '192.168.1.1', time: '1h ago',  module: 'Settings'    },
  { action: 'Rejected deposit #DEP-437',        admin: 'mod_priya',   ip: '10.0.0.8',    time: '2h ago',  module: 'Deposits'    },
  { action: 'Sent system maintenance notification',admin: 'content_op',ip: '10.0.0.12',   time: '3h ago',  module: 'Announcements' },
  { action: 'Reset password for user sarah.k',  admin: 'superadmin',  ip: '192.168.1.1', time: '5h ago',  module: 'Security'    },
  { action: 'Created VIP tier "Platinum"',      admin: 'superadmin',  ip: '192.168.1.1', time: '8h ago',  module: 'VIP'         },
];

export const SESSIONS_MOCK: AdminSession[] = [
  { admin: 'superadmin', ip: '192.168.1.1', location: 'Mumbai, IN',  device: 'Chrome / Windows', since: '10 min ago',  active: true  },
  { admin: 'mod_raj',    ip: '10.0.0.5',    location: 'Delhi, IN',   device: 'Firefox / macOS',   since: '45 min ago', active: true  },
  { admin: 'mod_priya',  ip: '10.0.0.8',    location: 'Pune, IN',    device: 'Safari / iPhone',  since: '2 hours ago',  active: false },
];

export const ALERTS_MOCK: SecurityAlert[] = [
  { msg: '5 failed login attempts - user john_crypto', level: 'High',   time: '15 min ago' },
  { msg: 'Unusual withdrawal volume detected from account node_whale', level: 'High',   time: '1 hour ago'  },
  { msg: 'New IP login detected for administrator account superadmin', level: 'Medium', time: '3 hours ago'  },
];

export const USER_GROWTH_MOCK = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1850 },
  { month: 'Mar', users: 2400 },
  { month: 'Apr', users: 3100 },
  { month: 'May', users: 4200 },
  { month: 'Jun', users: 5680 },
  { month: 'Jul', users: 7340 },
];

export const TX_FLOW_MOCK = [
  { month: 'Jan', deposits: 42000, withdrawals: 18000 },
  { month: 'Feb', deposits: 58000, withdrawals: 24000 },
  { month: 'Mar', deposits: 71000, withdrawals: 31000 },
  { month: 'Apr', deposits: 65000, withdrawals: 28000 },
  { month: 'May', deposits: 89000, withdrawals: 41000 },
  { month: 'Jun', deposits: 112000, withdrawals: 55000 },
  { month: 'Jul', deposits: 134000, withdrawals: 67000 },
];

export const REVENUE_TREND_MOCK = [
  { month: 'Jan', revenue: 3200 },
  { month: 'Feb', revenue: 4800 },
  { month: 'Mar', revenue: 6100 },
  { month: 'Apr', revenue: 5400 },
  { month: 'May', revenue: 8200 },
  { month: 'Jun', revenue: 11400 },
  { month: 'Jul', revenue: 14700 },
];

export const VIP_TIERS_MOCK = [
  {
    name: 'VIP1',
    members: 5230,
    walletReq: '10 USDT - ∞',
    levelAReq: '—',
    levelBCDReq: '—',
    teamTotal: '—',
    dailyYield: '0.60%',
    color: 'from-orange-500/5 to-orange-500/10 dark:from-orange-700/10 dark:to-orange-500/5 border-orange-500/20 text-orange-600 dark:text-orange-400',
    badge: 'VIP1 Tier',
    icon: '🥉'
  },
  {
    name: 'VIP2',
    members: 2410,
    walletReq: '50 - 100 USDT',
    levelAReq: '2',
    levelBCDReq: '—',
    teamTotal: '2',
    dailyYield: '0.80%',
    color: 'from-slate-500/5 to-slate-500/10 dark:from-slate-500/10 dark:to-slate-400/5 border-slate-400/20 text-slate-600 dark:text-slate-400',
    badge: 'VIP2 Tier',
    icon: '🥈'
  },
  {
    name: 'VIP3',
    members: 1150,
    walletReq: '100 - 500 USDT',
    levelAReq: '3',
    levelBCDReq: '6',
    teamTotal: '9',
    dailyYield: '1.00%',
    color: 'from-yellow-500/5 to-yellow-500/10 dark:from-yellow-500/10 dark:to-yellow-400/5 border-yellow-400/20 text-amber-600 dark:text-yellow-400',
    badge: 'VIP3 Tier',
    icon: '🥇'
  },
  {
    name: 'VIP4',
    members: 480,
    walletReq: '500 - 1000 USDT',
    levelAReq: '6',
    levelBCDReq: '20',
    teamTotal: '26',
    dailyYield: '1.20%',
    color: 'from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    badge: 'VIP4 Tier',
    icon: '💎'
  },
  {
    name: 'VIP5',
    members: 210,
    walletReq: '1000 - 3000 USDT',
    levelAReq: '7',
    levelBCDReq: '35',
    teamTotal: '42',
    dailyYield: '1.30%',
    color: 'from-cyan-500/5 to-cyan-500/10 dark:from-cyan-500/10 dark:to-blue-500/5 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    badge: 'VIP5 Tier',
    icon: '🛡️'
  },
  {
    name: 'VIP6',
    members: 85,
    walletReq: '3000 - 5000 USDT',
    levelAReq: '8',
    levelBCDReq: '50',
    teamTotal: '58',
    dailyYield: '1.50%',
    color: 'from-purple-500/5 to-purple-500/10 dark:from-purple-500/10 dark:to-violet-500/5 border-purple-500/20 text-purple-600 dark:text-purple-400',
    badge: 'VIP6 Tier',
    icon: '👑'
  },
  {
    name: 'VIP7',
    members: 32,
    walletReq: '5000 - 10000 USDT',
    levelAReq: '15',
    levelBCDReq: '70',
    teamTotal: '85',
    dailyYield: '2.00%',
    color: 'from-rose-500/5 to-rose-500/10 dark:from-rose-500/10 dark:to-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400',
    badge: 'VIP7 Tier',
    icon: '✨'
  },
  {
    name: 'VIP8',
    members: 12,
    walletReq: '10000 - 20000 USDT',
    levelAReq: '30',
    levelBCDReq: '200',
    teamTotal: '230',
    dailyYield: '2.50%',
    color: 'from-indigo-500/5 to-indigo-500/10 dark:from-indigo-500/10 dark:to-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    badge: 'VIP8 Tier',
    icon: '🔮'
  }
];

export const SALARY_SLABS_MOCK = [
  { rank: 'Bronze',  members: 3120, salary: '$0',     requirement: 'No minimum requirement',      nextPayout: '—' },
  { rank: 'Silver',  members: 1840, salary: '$50',    requirement: '5 active direct referrals',   nextPayout: 'Aug 1' },
  { rank: 'Gold',    members: 892,  salary: '$200',   requirement: '15 active direct referrals',  nextPayout: 'Aug 1' },
  { rank: 'Diamond', members: 318,  salary: '$500',   requirement: '50 active direct referrals',  nextPayout: 'Aug 1' },
  { rank: 'Platinum',members: 64,   salary: '$1,500',  requirement: '150 active direct referrals', nextPayout: 'Aug 1' },
];
