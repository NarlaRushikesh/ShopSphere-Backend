import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Lock, UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isVerifyOnly = queryParams.get("verify") === "true";

  const [step, setStep] = useState(isVerifyOnly ? 2 : 1); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email first");
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email }); // Reusing forgot-password to send OTP
      toast.success("New OTP sent to " + email);
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Registration initiated! Please verify your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register. Please try again.");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-registration", { email, otp });
      toast.success("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-card border border-border rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create Account
        </h1>
        <p className="text-muted">Join ShopSphere to start shopping</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={step === 1 ? handleRegister : handleVerifyOtp} className="space-y-5">
        {step === 1 ? (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {isVerifyOnly && (
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
                   className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50"
                   placeholder="you@example.com"
                 />
               </div>
             </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Verification Code (OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-primary focus:border-primary transition-colors bg-secondary/50 text-center tracking-widest text-lg font-bold"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted">
                  Check your email <strong>{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <UserPlus className="h-5 w-5" /> 
              {step === 1 ? "Sign Up" : "Verify Account"}
            </>
          )}
        </button>

        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-sm text-primary hover:underline mt-4"
          >
            Wrong email? Go back
          </button>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-foreground/70">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
