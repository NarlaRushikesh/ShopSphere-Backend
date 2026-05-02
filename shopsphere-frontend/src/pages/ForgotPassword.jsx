import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, KeyRound, Lock } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
      toast.success("OTP sent to your email");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please check your email and try again."
      );
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { 
        email, 
        otp, 
        newPassword 
      });
      setStep(3);
      toast.success("Password reset successfully");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please check your OTP and try again."
      );
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-card border border-border rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {step === 1 && "Reset Password"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "Success"}
        </h1>
        <p className="text-muted text-sm">
          {step === 1 && "Enter your email address and we'll send you an OTP to reset your password."}
          {step === 2 && `We've sent an OTP to ${email}. Please enter it below along with your new password.`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-bold tracking-wide uppercase text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Send OTP"
            )}
          </button>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              6-Digit OTP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-muted" />
              </div>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50 text-sm tracking-widest"
                placeholder="123456"
                maxLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted" />
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50 text-sm"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !otp || !newPassword}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-bold tracking-wide uppercase text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Reset Password"
            )}
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setNewPassword("");
              }}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Change Email Address
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Password Reset Successful!</h2>
          <p className="text-foreground/70 text-sm mb-8">
            Your password has been successfully changed. You can now use your new password to log in.
          </p>
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors font-medium shadow-sm"
          >
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;

