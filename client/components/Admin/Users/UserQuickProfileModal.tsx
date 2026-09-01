/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeTokens } from '../../ui/themeTokens.ts';
import { api } from '../../../services/api.ts';
import { AdminUser } from '../types.ts';
import {
  UserProfileModal,
  AddressHistoryModal,
  RotateAddressConfirmModal,
} from './UserHistoryModals.tsx';
import { UserEditModal } from './UserActionModals.tsx';
import { Sparkles } from 'lucide-react';

export interface UserQuickProfileModalProps {
  userId: string | null;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

export const UserQuickProfileModal: React.FC<UserQuickProfileModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
  t,
}) => {
  const [profileDetail, setProfileDetail] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);

  // Sub-modal states
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [rotatingNetwork, setRotatingNetwork] = useState<string | null>(null);
  const [rotateConfirmNetwork, setRotateConfirmNetwork] = useState<string | null>(null);
  const [addressHistoryModal, setAddressHistoryModal] = useState<{
    network: string;
    history: any[];
    loading: boolean;
  } | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    status: 'Active' as 'Active' | 'Suspended',
    adminNotes: '',
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    variant?: 'info' | 'success' | 'error';
  } | null>(null);

  const triggerToast = (text: string, variant: 'info' | 'success' | 'error' = 'success') => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch complete profile whenever modal opens or userId changes
  useEffect(() => {
    if (!isOpen || !userId) {
      setProfileDetail(null);
      setActiveUser(null);
      setIsEditOpen(false);
      setAddressHistoryModal(null);
      setRotateConfirmNetwork(null);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoadingDetails(true);
        const res = await api.getAdminUserProfile(userId);
        if (!isMounted) return;

        if (res && res.success && res.data) {
          const detail = res.data.profile || res.data;
          setProfileDetail(detail);
          const constructedUser: AdminUser = {
            id: detail.id || detail.uid || userId,
            userId: detail.userId,
            username: detail.username || '',
            name: detail.name || userName || 'Member',
            email: detail.email || '',
            mobile: detail.mobile || '',
            rank: detail.rank || 'VIP1',
            balance: detail.balance || '$0.00',
            referralCode: detail.referralCode || '',
            levelA: detail.teamCounts?.levelA ?? detail.levelA ?? 0,
            levelB: detail.teamCounts?.levelB ?? detail.levelB ?? 0,
            levelC: detail.teamCounts?.levelC ?? detail.levelC ?? 0,
            levelD: detail.teamCounts?.levelD ?? detail.levelD ?? 0,
            teamSize: detail.teamCounts?.total ?? 0,
            status: detail.status || 'Active',
            joined: detail.joined || 'Recently',
            adminNotes: detail.adminNotes || '',
          };
          setActiveUser(constructedUser);
        } else {
          // Fallback if network returned non-standard format
          const fallbackUser: AdminUser = {
            id: userId,
            userId: userId,
            name: userName || 'Member',
            email: 'user@platform.internal',
            mobile: '',
            rank: 'VIP1',
            balance: '$0.00',
            referralCode: '',
            levelA: 0,
            levelB: 0,
            levelC: 0,
            levelD: 0,
            status: 'Active',
            joined: 'N/A',
          };
          setProfileDetail(fallbackUser);
          setActiveUser(fallbackUser);
        }
      } catch (err: any) {
        console.error('Failed to load user profile in Quick View:', err);
        if (!isMounted) return;
        const fallbackUser: AdminUser = {
          id: userId,
          userId: userId,
          name: userName || 'Member',
          email: 'user@platform.internal',
          mobile: '',
          rank: 'VIP1',
          balance: '$0.00',
          referralCode: '',
          levelA: 0,
          levelB: 0,
          levelC: 0,
          levelD: 0,
          status: 'Active',
          joined: 'N/A',
        };
        setProfileDetail(fallbackUser);
        setActiveUser(fallbackUser);
      } finally {
        if (isMounted) {
          setLoadingDetails(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, userName]);

  // Handle Address Copy
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    triggerToast(`Address copied to clipboard: ${address.slice(0, 8)}...${address.slice(-6)}`, 'info');
  };

  // Handle Address History View
  const handleViewAddressHistory = async (network: string) => {
    const targetUid = profileDetail?.id || profileDetail?.uid || activeUser?.id || userId;
    if (!targetUid) return;

    setAddressHistoryModal({ network, history: [], loading: true });
    try {
      const res = await api.getUserDepositAddressHistory(targetUid, network);
      const historyList = res?.data?.history || (Array.isArray(res?.data) ? res.data : []);
      setAddressHistoryModal({ network, history: historyList, loading: false });
    } catch (err: any) {
      console.error('Failed to fetch address history:', err);
      triggerToast('Failed to load address history', 'error');
      setAddressHistoryModal(null);
    }
  };

  // Handle Address Rotation
  const handleRotateAddress = async (network: string) => {
    const targetUid = profileDetail?.id || profileDetail?.uid || activeUser?.id || userId;
    if (!targetUid) return;

    try {
      setRotatingNetwork(network);
      const res = await api.rotateUserDepositAddress(targetUid, network);
      if (res && res.success && res.data) {
        const newAddress = res.data.newAddress || res.data;
        setProfileDetail((prev: any) => {
          if (!prev) return prev;
          const updated = (prev.depositAddresses || []).map((a: any) =>
            a.network === network ? { ...a, address: newAddress.address || newAddress } : a
          );
          if (!updated.find((a: any) => a.network === network)) {
            updated.push({ network, address: newAddress.address || newAddress });
          }
          return { ...prev, depositAddresses: updated };
        });
        triggerToast(`New ${network} deposit address generated successfully!`, 'success');
      }
    } catch (err: any) {
      console.error('Failed to rotate deposit address:', err);
      triggerToast(err?.message || 'Failed to rotate deposit address', 'error');
    } finally {
      setRotatingNetwork(null);
      setRotateConfirmNetwork(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!profileDetail && !activeUser) return;
    const target = profileDetail || activeUser;
    setEditForm({
      name: target.name || '',
      email: target.email || '',
      mobile: target.mobile || '',
      status: (target.status === 'Suspended' ? 'Suspended' : 'Active') as 'Active' | 'Suspended',
      adminNotes: target.adminNotes || '',
    });
    setIsEditOpen(true);
  };

  // Save Edit Updates
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUid = profileDetail?.id || profileDetail?.uid || activeUser?.id || userId;
    if (!targetUid) return;

    try {
      const res = await api.updateAdminUserProfile(targetUid, {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        status: editForm.status,
      });

      const updated = res?.data || editForm;
      setProfileDetail((prev: any) => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        status: editForm.status,
      }));
      if (activeUser) {
        setActiveUser(prev => prev ? ({ ...prev, ...updated }) : null);
      }
      triggerToast(`Account details for ${editForm.name} updated successfully!`);
      setIsEditOpen(false);
    } catch (err) {
      console.error('Failed to update user:', err);
      triggerToast('Failed to commit profile updates to server', 'error');
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-60 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.variant === 'error'
              ? 'bg-red-500/90 text-white border-red-400 backdrop-blur-md'
              : toastMessage.variant === 'info'
              ? 'bg-blue-600/90 text-white border-blue-400 backdrop-blur-md'
              : 'bg-emerald-600/90 text-white border-emerald-400 backdrop-blur-md'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Full User Profile Modal */}
      {!isEditOpen && (
        <UserProfileModal
          user={
            activeUser || {
              id: userId,
              name: userName || 'Member',
              email: '',
              mobile: '',
              rank: 'VIP1',
              balance: '$0.00',
              referralCode: '',
              levelA: 0,
              levelB: 0,
              levelC: 0,
              levelD: 0,
              status: 'Active',
              joined: 'N/A',
            }
          }
          profileDetail={profileDetail}
          loadingDetails={loadingDetails}
          onEdit={handleOpenEdit}
          onClose={onClose}
          onViewHistory={handleViewAddressHistory}
          onCopyAddress={handleCopyAddress}
          onRotateAddress={(net) => setRotateConfirmNetwork(net)}
          rotatingNetwork={rotatingNetwork}
          t={t}
        />
      )}

      {/* Address History Modal */}
      {addressHistoryModal && (
        <AddressHistoryModal
          network={addressHistoryModal.network}
          history={addressHistoryModal.history}
          loading={addressHistoryModal.loading}
          onClose={() => setAddressHistoryModal(null)}
          onCopyAddress={handleCopyAddress}
          t={t}
        />
      )}

      {/* Rotate Address Confirmation Modal */}
      {rotateConfirmNetwork && (
        <RotateAddressConfirmModal
          network={rotateConfirmNetwork}
          rotatingNetwork={rotatingNetwork}
          onConfirm={(net) => handleRotateAddress(net)}
          onClose={() => setRotateConfirmNetwork(null)}
        />
      )}

      {/* Edit User Details Modal */}
      {isEditOpen && (
        <UserEditModal
          user={
            activeUser || {
              id: userId,
              name: userName || 'Member',
              email: '',
              mobile: '',
              rank: 'VIP1',
              balance: '$0.00',
              referralCode: '',
              levelA: 0,
              levelB: 0,
              levelC: 0,
              levelD: 0,
              status: 'Active',
              joined: 'N/A',
            }
          }
          profileDetail={profileDetail}
          loadingDetails={loadingDetails}
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSaveEdit}
          onClose={() => setIsEditOpen(false)}
          t={t}
        />
      )}
    </>
  );
};
export default UserQuickProfileModal;
