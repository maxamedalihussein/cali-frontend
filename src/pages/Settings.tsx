import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Upload, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, User, Lock, Mail } from "lucide-react";
import { authFetch } from "@/lib/utils";
import Loading from '../components/Loading';
import MiniSpinner from '../components/MiniSpinner';
import { DatePicker } from '../components/DatePicker';

const Settings = () => {
  const { toast } = useToast();
  const { user, updateEmail, updatePassword, forgotPassword, resetPassword, loading } = useAuth();
  
  const [settings, setSettings] = useState({
    companyName: "CALI DAYAX",
    timezone: "Asia/Dubai",
    currency: "USD",
    logo: null as File | null,
    language: "en",
    notifications: true,
    autoBackup: true
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Data cleaning state
  const [clearType, setClearType] = useState<'day' | 'month' | 'year'>('day');
  const [clearValue, setClearValue] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteLog, setDeleteLog] = useState<any[]>([]);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Authentication settings state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const timezones = [
    { value: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
    { value: "Asia/Riyadh", label: "Asia/Riyadh (UTC+3)" },
    { value: "Europe/London", label: "Europe/London (UTC+0)" },
    { value: "America/New_York", label: "America/New_York (UTC-5)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8)" },
  ];

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "AED", label: "AED - UAE Dirham" },
    { value: "SAR", label: "SAR - Saudi Riyal" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ];

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSettings(prev => ({ ...prev, logo: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In a real app, you would save these settings to your backend
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteResult(null);
    try {
      const res = await authFetch(
        `http://localhost:5050/api/cars/clear-by-time?type=${clearType}&value=${clearValue}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok) {
        setDeleteLog(data.deleted || []);
        setDeleteResult('success');
        toast({ title: 'Data Cleared', description: `${data.deleted.length} cars deleted.` });
      } else {
        setDeleteResult('error');
        toast({ title: 'Error', description: data.error || 'Failed to delete data', variant: 'destructive' });
      }
    } catch (err) {
      setDeleteResult('error');
      toast({ title: 'Error', description: 'Failed to delete data', variant: 'destructive' });
    }
    setDeleting(false);
    setConfirmOpen(false);
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    setDeleteResult(null);
    try {
      const res = await authFetch('http://localhost:5050/api/cars/clear-by-time?type=all', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setDeleteLog(data.deleted || []);
        setDeleteResult('success');
        toast({ title: 'All Data Cleared', description: `${data.deleted.length} cars deleted.` });
      } else {
        setDeleteResult('error');
        toast({ title: 'Error', description: data.error || 'Failed to delete all data', variant: 'destructive' });
      }
    } catch (err) {
      setDeleteResult('error');
      toast({ title: 'Error', description: 'Failed to delete all data', variant: 'destructive' });
    }
    setDeletingAll(false);
    setConfirmDeleteAll(false);
  };



  // Authentication handlers
  const handleUpdateEmail = async () => {
    if (!currentPassword || !newEmail) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    const result = await updateEmail(newEmail, currentPassword);
    if (result.success) {
      toast({ title: 'Success', description: 'Email updated successfully' });
      setShowEmailForm(false);
      setNewEmail('');
      setCurrentPassword('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    
    const result = await updatePassword(currentPassword, newPassword);
    if (result.success) {
      toast({ title: 'Success', description: 'Password updated successfully' });
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }
    
    const result = await forgotPassword(resetEmail);
    if (result.success) {
      toast({ title: 'Success', description: 'Reset code sent to your email' });
      setShowForgotPassword(false);
      setShowResetPassword(true);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    const result = await resetPassword(resetEmail, resetCode, newPassword);
    if (result.success) {
      toast({ title: 'Success', description: 'Password reset successfully' });
      setShowResetPassword(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and company information</p>
        </div>
        
        <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark" disabled={loading}>
          {loading ? <MiniSpinner /> : (<><Save className="mr-2 h-4 w-4" /> Save Settings</>)}
        </Button>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="mr-2 h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Update your company details and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="logo">Company Logo</Label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
              </div>
              <Button variant="outline" onClick={() => document.getElementById('logo')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            </div>
            
            {logoPreview && (
              <div className="mt-4">
                <Label>Logo Preview</Label>
                <div className="mt-2 p-4 border rounded-lg bg-muted">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-16 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
          <CardDescription>Configure timezone, currency, and regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system behavior and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for important events
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup your data daily
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Authentication Settings
          </CardTitle>
          <CardDescription>Manage your account security and authentication preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Info */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Current User</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>

          {/* Update Email */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  Update your email address
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowEmailForm(!showEmailForm)}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {showEmailForm ? 'Cancel' : 'Update Email'}
              </Button>
            </div>
            
            {showEmailForm && (
              <div className="p-4 border rounded-lg space-y-4">
                <div>
                  <Label htmlFor="newEmail">New Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                  />
                </div>
                <div>
                  <Label htmlFor="emailPassword">Current Password</Label>
                  <Input
                    id="emailPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <Button onClick={handleUpdateEmail} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Email'}
                </Button>
              </div>
            )}
          </div>

          {/* Update Password */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                disabled={loading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </Button>
            </div>
            
            {showPasswordForm && (
              <div className="p-4 border rounded-lg space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={handleUpdatePassword} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            )}
          </div>

          {/* Forgot Password */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Reset Password</Label>
                <p className="text-sm text-muted-foreground">
                  Reset your password via email
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {showForgotPassword ? 'Cancel' : 'Forgot Password'}
              </Button>
            </div>
            
            {showForgotPassword && (
              <div className="p-4 border rounded-lg space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <Button onClick={handleForgotPassword} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </div>
            )}
          </div>

          {/* Reset Password with Code */}
          {showResetPassword && (
            <div className="p-4 border rounded-lg space-y-4">
              <div>
                <Label htmlFor="resetCode">Reset Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code from email"
                />
              </div>
              <div>
                <Label htmlFor="resetNewPassword">New Password</Label>
                <Input
                  id="resetNewPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="resetConfirmPassword">Confirm New Password</Label>
                <Input
                  id="resetConfirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🧹 Clear Data by Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Trash2 className="text-red-600 w-5 h-5" /> 🧹 Clear Data by Time
          </CardTitle>
          <CardDescription>Delete cars and buyers by day, month, year, or <span className="text-red-700 font-bold">all data</span>. This action is irreversible!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={clearType} onValueChange={v => setClearType(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">By Day</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>
            {clearType === 'day' && (
              <DatePicker value={clearValue ? new Date(clearValue) : null} onChange={d => setClearValue(d ? d.toISOString().slice(0,10) : '')} placeholder="Select date" />
            )}
            {clearType === 'month' && (
              <Input type="month" className="w-40" value={clearValue} onChange={e => setClearValue(e.target.value)} />
            )}
            {clearType === 'year' && (
              <Input type="number" min="2000" max="2100" className="w-32" placeholder="Year" value={clearValue} onChange={e => setClearValue(e.target.value)} />
            )}
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              disabled={!clearValue || deleting}
              onClick={() => setConfirmOpen(true)}
            >
              {deleting ? <MiniSpinner /> : 'Delete'}
            </Button>
            <Button
              className="bg-red-800 hover:bg-red-900 text-white font-semibold"
              disabled={deletingAll}
              onClick={() => setConfirmDeleteAll(true)}
            >
              {deletingAll ? <MiniSpinner /> : 'Delete All Data'}
            </Button>
          </div>
          {deleteResult === 'success' && (
            <div className="mt-4 text-green-700 text-sm">
              Deleted {deleteLog.length} cars and related buyers.
            </div>
          )}
          {deleteResult === 'error' && (
            <div className="mt-4 text-red-700 text-sm">
              Error deleting data. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
      {/* Confirm Delete Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Confirm Data Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Are you sure you want to <span className="font-bold text-red-700">delete all cars and buyers</span> added in the selected {clearType}?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone. Consider exporting a backup first.</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleDelete} disabled={deleting}>
              {deleting ? <MiniSpinner /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Confirm Delete All Modal */}
      <Dialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-800">Confirm Delete All Data</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Are you sure you want to <span className="font-bold text-red-800">delete ALL cars and buyers</span> in the system?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone. Consider exporting a backup first.</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteAll(false)} disabled={deletingAll}>Cancel</Button>
            <Button className="bg-red-800 text-white" onClick={handleDeleteAll} disabled={deletingAll}>
              {deletingAll ? <MiniSpinner /> : 'Delete All Data'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Summary of your current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-semibold">{settings.companyName}</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Currency</p>
              <Badge variant="outline">{settings.currency}</Badge>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Language</p>
              <Badge variant="outline">
                {languages.find(l => l.value === settings.language)?.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;