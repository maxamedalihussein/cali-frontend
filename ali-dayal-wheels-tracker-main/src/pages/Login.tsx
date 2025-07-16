import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Loading from '../components/Loading';
import MiniSpinner from '../components/MiniSpinner';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const result = await login(email, password);
    if (result.success) {
      navigate("/"); // Redirect to root, which is the dashboard
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(""); setForgotMsg(""); setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg("Verification code sent to your email.");
        setForgotStep(2);
      } else {
        setForgotError(data.error || "Failed to send code");
      }
    } catch {
      setForgotError("Network error");
    }
    setForgotLoading(false);
  };
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(""); setForgotMsg(""); setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword: forgotNewPass })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg("Password reset successful. You can now log in.");
        setForgotStep(1);
        setForgotEmail(""); setForgotCode(""); setForgotNewPass("");
        setForgotOpen(false);
      } else {
        setForgotError(data.error || "Failed to reset password");
        // Do NOT close dialog or clear fields
      }
    } catch {
      setForgotError("Network error");
      // Do NOT close dialog or clear fields
    }
    setForgotLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card shadow-lg rounded-2xl p-8 border border-border">
        <div className="flex flex-col items-center mb-6">
          <img src="/publiccali-dayax-logo.png.jpg" alt="CALI DAYAX Logo" className="w-16 h-16 rounded-full mb-2" />
          <h1 className="text-2xl font-bold text-black mb-1">CALI DAYAX</h1>
          <p className="text-gray-900">Admin Access Only</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-black">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 text-black placeholder:text-gray-700"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-black">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-1 pr-10 text-black placeholder:text-gray-700"
                placeholder="Your password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-muted-foreground"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="accent-primary"
              />
              Remember me
            </label>
            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogTrigger asChild>
                <button type="button" className="text-sm text-black hover:underline bg-transparent p-0" onClick={() => setForgotStep(1)}>
                  Forgot password?
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>Forgot Password</DialogTitle>
                </DialogHeader>
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotSend} className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    {forgotError && <div className="text-red-500 text-sm text-center">{forgotError}</div>}
                    {forgotMsg && <div className="text-green-600 text-sm text-center">{forgotMsg}</div>}
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white font-bold rounded-full shadow-2xl py-3 text-lg transition" disabled={forgotLoading}>
                      {forgotLoading ? <MiniSpinner className="text-white" /> : "Send Code"}
                    </Button>
                  </form>
                )}
                {forgotStep === 2 && (
                  <form onSubmit={handleForgotReset} className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-code">Verification Code</Label>
                      <Input
                        id="forgot-code"
                        type="text"
                        value={forgotCode}
                        onChange={e => setForgotCode(e.target.value)}
                        required
                        placeholder="6-digit code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="forgot-newpass">New Password</Label>
                      <Input
                        id="forgot-newpass"
                        type="password"
                        value={forgotNewPass}
                        onChange={e => setForgotNewPass(e.target.value)}
                        required
                        placeholder="Enter new password"
                      />
                    </div>
                    {forgotError && <div className="text-red-500 text-sm text-center">{forgotError}</div>}
                    {forgotMsg && <div className="text-green-600 text-sm text-center">{forgotMsg}</div>}
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white font-bold rounded-full shadow-2xl py-3 text-lg transition" disabled={forgotLoading}>
                      {forgotLoading ? <MiniSpinner className="text-white" /> : "Reset Password"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white font-bold rounded-full shadow-2xl py-3 text-lg transition"
            disabled={loading}
          >
            {loading ? <MiniSpinner className="text-white" /> : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login; 