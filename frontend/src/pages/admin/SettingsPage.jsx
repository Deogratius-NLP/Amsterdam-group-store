import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { adminService } from '../../services/adminService';
import { 
  Settings, 
  ShieldCheck, 
  MessageCircle, 
  Database, 
  Server, 
  Check, 
  Save, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Lock,
  Key
} from 'lucide-react';
import { AMSTERDAM_WHATSAPP_DISPLAY, AMSTERDAM_WHATSAPP_NUMBER } from '../../utils/constants';

export default function SettingsPage() {
  const { adminUser, updateSession } = useAuth();
  const { refreshSettings } = useSettings();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappDisplay, setWhatsappDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Security & Credentials Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Fetch active settings on page load
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await adminService.getSettings();
        if (data) {
          setWhatsappNumber(data.whatsapp_number || AMSTERDAM_WHATSAPP_NUMBER);
          setWhatsappDisplay(data.whatsapp_display || AMSTERDAM_WHATSAPP_DISPLAY);
        }
      } catch (err) {
        console.error('Failed to load admin settings:', err);
        setWhatsappNumber(AMSTERDAM_WHATSAPP_NUMBER);
        setWhatsappDisplay(AMSTERDAM_WHATSAPP_DISPLAY);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      setErrorMessage('Please provide a valid phone number.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSaveSuccess(false);

      const updated = await adminService.updateSettings({
        whatsapp_number: whatsappNumber.trim()
      });

      setWhatsappNumber(updated.whatsapp_number);
      setWhatsappDisplay(updated.whatsapp_display);
      setSaveSuccess(true);

      // Refresh global app context immediately
      if (refreshSettings) {
        await refreshSettings();
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error updating WhatsApp number:', err);
      const detail = err.response?.data?.detail || 'Failed to update WhatsApp number. Please check the format.';
      setErrorMessage(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!securityForm.currentPassword) {
      setSecurityError('Current password is required to authorize changes.');
      return;
    }

    if (!securityForm.newEmail.trim() && !securityForm.newPassword) {
      setSecurityError('Please enter a new email address or new password to update.');
      return;
    }

    if (securityForm.newPassword) {
      if (securityForm.newPassword.length < 8) {
        setSecurityError('New password must be at least 8 characters.');
        return;
      }
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        setSecurityError('New password and confirm password do not match.');
        return;
      }
    }

    try {
      setSecuritySaving(true);
      const payload = {
        current_password: securityForm.currentPassword
      };
      if (securityForm.newEmail.trim()) {
        payload.new_email = securityForm.newEmail.trim();
      }
      if (securityForm.newPassword) {
        payload.new_password = securityForm.newPassword;
      }

      const res = await adminService.updateSecurity(payload);
      if (updateSession) {
        updateSession(res);
      }

      setSecuritySuccess('Credentials updated successfully! Your active session is secured.');
      setSecurityForm({
        currentPassword: '',
        newEmail: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSecuritySuccess(''), 6000);
    } catch (err) {
      console.error('Failed to update security credentials:', err);
      setSecurityError(err.response?.data?.detail || 'Failed to update credentials. Please check your current password.');
    } finally {
      setSecuritySaving(false);
    }
  };

  const previewCleanNumber = (whatsappNumber || '').replace(/\D/g, '');
  const testWaUrl = previewCleanNumber ? `https://wa.me/${previewCleanNumber}` : '#';

  return (
    <AdminLayout activeTitle="System Settings & Integrations">
      
      <div className="max-w-4xl space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="font-display font-extrabold text-2xl text-amsterdam-dark tracking-tight">
            Store & System Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage organization credentials, WhatsApp order gateway, and backend configurations.
          </p>
        </div>

        {/* WhatsApp Gateway Integration */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-card space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-amsterdam-dark">
                  WhatsApp Order Dispatch Line
                </h3>
                <p className="text-xs text-gray-400">
                  Customer order notifications, storefront support buttons, and invoice QR codes are connected directly to this WhatsApp line.
                </p>
              </div>
            </div>

            {previewCleanNumber && (
              <a
                href={testWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors shrink-0 border border-emerald-200"
                title="Test sending a WhatsApp message to this number"
              >
                <span>Test Line</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Feedback messages */}
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Success!</strong> WhatsApp receiving number saved. All customer orders and invoice QR codes now route to this active line.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveWhatsApp} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Receiving WhatsApp Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={loading || saving}
                    placeholder="e.g. 0651728851 or 255651728851"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-mono font-bold text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:bg-gray-50"
                  />
                  {loading && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">
                    Active Format: <strong className="font-mono text-gray-700">{whatsappDisplay || 'Not configured'}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Currency & Notation
                </label>
                <input
                  type="text"
                  disabled
                  value="Tanzanian Shilling (TSh XX,XXX /=)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 cursor-not-allowed"
                />
                <span className="text-[11px] text-gray-400 mt-1.5 block">
                  Honors the official standard <code>/=</code> notation across catalogs and invoices.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 max-w-md">
                Enter your WhatsApp business number (Tanzanian local format <code>065... / 07...</code> or international <code>255...</code>). The system automatically formats it for WhatsApp order links and invoice QR codes.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save WhatsApp Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Security & Login Credentials */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-amsterdam-dark">
                Security & Login Credentials
              </h3>
              <p className="text-xs text-gray-400">
                Update your administrator login email and password. Protected by current password verification.
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {securitySuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{securitySuccess}</span>
            </div>
          )}

          {securityError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{securityError}</span>
            </div>
          )}

          <form onSubmit={handleSecuritySubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    disabled={securitySaving}
                    placeholder="Enter current password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-mono text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all disabled:bg-gray-50"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Required to authorize credential changes.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  New Admin Email
                </label>
                <input
                  type="email"
                  disabled={securitySaving}
                  placeholder={adminUser?.email || "newadmin@amsterdamgroup.co.tz"}
                  value={securityForm.newEmail}
                  onChange={(e) => setSecurityForm({ ...securityForm, newEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all disabled:bg-gray-50"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Leave blank if keeping current email ({adminUser?.email}).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  disabled={securitySaving}
                  placeholder="Min 8 characters"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-mono text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all disabled:bg-gray-50"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Leave blank if keeping existing password.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  disabled={securitySaving || !securityForm.newPassword}
                  placeholder="Re-enter new password"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-mono text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all disabled:bg-gray-50"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Must match new password above.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 max-w-md">
                Updating your credentials will update your account securely in the database and maintain your authenticated session.
              </p>

              <button
                type="submit"
                disabled={securitySaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {securitySaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Credentials</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Administrator Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amsterdam-muted text-amsterdam-olive flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-amsterdam-dark">
                Administrator Account
              </h3>
              <p className="text-xs text-gray-400">
                Active security profile and system role.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Full Name:</span>
              <span className="text-sm font-bold text-amsterdam-dark">{adminUser?.name || 'Amsterdam Admin'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Email Address:</span>
              <span className="text-sm font-bold text-amsterdam-dark">{adminUser?.email}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">System Role:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amsterdam-muted text-amsterdam-olive-dark inline-block mt-0.5 uppercase">
                {adminUser?.role || 'admin'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-semibold block">Authentication:</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <Check className="w-3.5 h-3.5" /> JWT Secure Session Active
              </span>
            </div>
          </div>
        </div>

        {/* Architecture & Infrastructure Status */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-amsterdam-dark">
                Database & Concurrency Architecture
              </h3>
              <p className="text-xs text-gray-400">
                PostgreSQL transaction isolation and atomic inventory protection.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-2 pt-2 leading-relaxed">
            <p>
              • <strong>Row-Level Locks:</strong> Customer orders trigger atomic <code>SELECT ... FOR UPDATE</code> locking, preventing overselling even during high concurrency flash promotions.
            </p>
            <p>
              • <strong>Double-Entry Auditing:</strong> Every inventory change (customer orders, manual restocks, write-offs, or cancellations) is recorded with immutable previous/new quantity snapshots.
            </p>
            <p>
              • <strong>Historical Integrity:</strong> Products are soft-deactivated rather than physically deleted to ensure historic orders never break.
            </p>
          </div>
        </div>

      </div>

    </AdminLayout>
  );
}
