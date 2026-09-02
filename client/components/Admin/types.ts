/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdminUser {
  id: string;
  userId?: string;
  username?: string;
  name: string;
  email: string;
  mobile: string;
  rank: string;
  balance: string;
  referralCode: string;
  levelA: number;
  levelB: number;
  levelC: number;
  levelD: number;
  teamSize?: number;
  teamCounts?: {
    levelA: number;
    levelB: number;
    levelC: number;
    levelD: number;
    total: number;
  };
  totalDeposits?: string | number;
  totalEarnings?: string | number;
  status: 'Active' | 'Suspended';
  joined: string;
  adminNotes?: string;
  parent?: {
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
  } | null;
  parentId?: string | null;
  parentUserId?: string | null;
  parentName?: string | null;
}

export interface AdminDeposit {
  id: string;
  displayId?: string;
  referenceNumber?: string;
  user: string;
  userId?: string;
  userUid?: string;
  userEmail?: string;
  userCustomId?: string;
  amount: string;
  method: string;
  txHash: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Rejected';
}

export interface AdminWithdrawal {
  id: string;
  displayId?: string;
  reference?: string;
  user: string;
  userId?: string;
  userUid?: string;
  userEmail?: string;
  userCustomId?: string;
  amount: string;
  network?: string;
  wallet: string;
  txHash?: string | null;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rawStatus?: string;
}

export interface AdminTicket {
  id: string;
  user: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  date: string;
  messages: Array<{
    sender: 'user' | 'admin';
    text: string;
    time: string;
  }>;
}

export interface AdminAuditLog {
  action: string;
  admin: string;
  ip: string;
  time: string;
  module: string;
}

export interface AdminSession {
  admin: string;
  ip: string;
  location: string;
  device: string;
  since: string;
  active: boolean;
}

export interface SecurityAlert {
  msg: string;
  level: 'High' | 'Medium' | 'Low';
  time: string;
}
