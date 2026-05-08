import React, { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  MessageSquare,
  Settings,
  BookMarked,
  Calendar,
  Sun,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  LogOut,
  AlertCircle,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { profile, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'security' | 'privacy'>('account');

  React.useEffect(() => {
    if (profile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.theme]);

  // Form states
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Los Angeles (PT)');
  const [language, setLanguage] = useState(profile?.language || 'English');
  const [recoveryEmail, setRecoveryEmail] = useState(profile?.recoveryEmail || '');
  const [theme, setTheme] = useState(profile?.theme || 'light');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await updateProfile({ profilePhoto: base64 });
        setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      await updateProfile({ profilePhoto: null });
      setMessage({ type: 'success', text: 'Profile photo deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete image' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        fullName,
        timezone,
        language,
        recoveryEmail,
        theme
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (passwordForm.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await updateProfile({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setMessage({ type: 'error', text: 'Account deletion will be available soon' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDownloadReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Data Privacy Report</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; }
              h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              .section { margin-bottom: 30px; }
              .label { font-weight: bold; color: #64748b; }
            </style>
          </head>
          <body>
            <h1>Data Privacy & Usage Report</h1>
            <div class="section">
              <p><span class="label">Name:</span> ${profile?.fullName}</p>
              <p><span class="label">Email:</span> ${profile?.email}</p>
              <p><span class="label">Role:</span> ${profile?.role}</p>
              <p><span class="label">Account Created:</span> ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
              <h2>Learning Data</h2>
              <p>Total Hours Tracked: 124.5h</p>
              <p>Certificates Earned: 1</p>
            </div>
            <p><em>Generated by ADZ4NEEDZ on ${new Date().toLocaleString()}</em></p>
            <script>
              window.onload = () => {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message.text}</p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-2 bg-white rounded-xl p-4 border border-slate-100 h-fit">
            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'appearance', label: 'Appearance', icon: Sun },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'privacy', label: 'Privacy', icon: Mail }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile Photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Photo</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile?.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl border-2 border-indigo-200">
                        {profile?.fullName
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </button>
                      {profile?.profilePhoto && (
                        <button
                          onClick={handleDeleteImage}
                          disabled={loading}
                          className="px-4 py-2.5 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">JPG or PNG, max 5MB</p>
                  </div>
                </div>
              </motion.div>

              {/* Personal Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Personal Info
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed text-slate-600"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Timezone</label>
                      <select
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option>Los Angeles (PT)</option>
                        <option>Denver (MT)</option>
                        <option>Chicago (CT)</option>
                        <option>New York (ET)</option>
                        <option>London (GMT)</option>
                        <option>India (IST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                      <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Recovery Email</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      placeholder="recovery@example.com"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">This email will be used if you lose access to your primary account.</p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl border border-slate-100 p-4 text-left hover:shadow-md transition-all"
                >
                  <MessageSquare className="h-5 w-5 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm">Communication</h3>
                  <p className="text-xs text-slate-500 mt-1">Manage notifications</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl border border-slate-100 p-4 text-left hover:shadow-md transition-all"
                >
                  <Settings className="h-5 w-5 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm">Preferences</h3>
                  <p className="text-xs text-slate-500 mt-1">Customize your experience</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl border border-slate-100 p-4 text-left hover:shadow-md transition-all"
                >
                  <BookMarked className="h-5 w-5 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm">Notes & Highlights</h3>
                  <p className="text-xs text-slate-500 mt-1">Your learning notes</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl border border-slate-100 p-4 text-left hover:shadow-md transition-all"
                >
                  <Calendar className="h-5 w-5 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm">Calendar Sync</h3>
                  <p className="text-xs text-slate-500 mt-1">Sync your schedule</p>
                </motion.button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <Sun className="h-5 w-5 text-indigo-600" />
                Appearance
              </h2>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-4">Color Theme</h3>
                <p className="text-xs text-slate-500 mb-4">Current: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 px-6 py-8 border-2 rounded-xl transition-all ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold text-slate-900">Light Mode</span>
                    </div>
                    <div className="w-full h-24 bg-white border border-slate-200 rounded-lg"></div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 px-6 py-8 border-2 rounded-xl transition-all ${
                      theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sun className="h-5 w-5 text-slate-600 rotate-45" />
                      <span className="font-bold text-slate-900">Dark Mode</span>
                    </div>
                    <div className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg"></div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Verification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">Verification</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{profile?.fullName}</p>
                    <p className="text-xs text-green-600 font-medium">Verified for Certificates</p>
                  </div>
                </div>
              </motion.div>

              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  Change Password
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.new}
                        onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Retype New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Data Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Download className="h-5 w-5 text-indigo-600" />
                  Data Privacy
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Download a comprehensive report of all your learning activities, forum posts, and progress.
                </p>
                <button onClick={handleDownloadReport} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-all">
                  Download Learner Data Report (PDF)
                </button>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-red-50 rounded-2xl border border-red-200 p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-red-700 mb-6">
                  Deleting your account is permanent. All course progress, certificates, and personal data will be erased and cannot be recovered.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
