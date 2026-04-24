'use client'
import { useState } from 'react'
import { X, Mail, Lock, UserCircle, Phone, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`

interface SignInData { email: string; password: string; rememberMe: boolean; }
interface SignUpData { firstName: string; lastName: string; email: string; password: string; phone: string; }

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'signin' | 'signup';
  onAuthModeChange: (mode: 'signin' | 'signup') => void;
  onGoogleSignIn: () => void;
  onMicrosoftSignIn: () => void;
  onEmailSignIn: (data: SignInData) => Promise<void>;
  onEmailSignUp: (data: SignUpData) => Promise<void>;
}

type ModalView = 'auth' | 'forgot' | 'forgot-sent'

export default function LoginForm({
  isOpen, onClose, authMode, onAuthModeChange,
  onGoogleSignIn, onMicrosoftSignIn, onEmailSignIn, onEmailSignUp,
}: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<ModalView>('auth')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const [signInData, setSignInData] = useState<SignInData>({ email: '', password: '', rememberMe: false })
  const [signUpData, setSignUpData] = useState<SignUpData>({ firstName: '', lastName: '', email: '', password: '', phone: '' })

  const handleAuthModeChange = (mode: 'signin' | 'signup') => {
    onAuthModeChange(mode)
    setError('')
  }

  const handleClose = () => {
    // Reset forgot-password state on close
    setView('auth')
    setForgotEmail('')
    setForgotError('')
    onClose()
  }

  const handleSignInSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onEmailSignIn(signInData)
      setSignInData({ email: '', password: '', rememberMe: false })
    } catch (err) {
      setError((err as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.email || !signUpData.password) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }
    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }
    try {
      await onEmailSignUp(signUpData)
      setSignUpData({ firstName: '', lastName: '', email: '', password: '', phone: '' })
    } catch (err) {
      setError((err as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    if (!forgotEmail.trim()) { setForgotError('Please enter your email address.'); return }
    setForgotLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForgotError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setView('forgot-sent')
    } catch {
      setForgotError('An unexpected error occurred. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />

        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[96vh] overflow-hidden border-2 border-[#13a8b4]/20 flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0f8a94] hover:bg-[#13a8b4]/10 rounded-full transition-all z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-6">

              {/* ── FORGOT PASSWORD VIEW ── */}
              {view === 'forgot' && (
                <>
                  <button
                    onClick={() => { setView('auth'); setForgotError(''); setForgotEmail('') }}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0f8a94] transition-colors mb-6 -mt-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </button>

                  <div className="text-center mb-8">
                    <div className="flex justify-center">
                      <img src="/rexon-logo.png" alt="Rexon" className="h-20 w-auto object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0f8a94] to-[#0b6f78] bg-clip-text text-transparent mb-2">
                      Forgot Password?
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="mb-5 p-3.5 bg-[#d07648]/10 border-2 border-[#d07648]/25 rounded-lg flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-[#a85832] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#a85832] font-medium">{forgotError}</p>
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                        <input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoFocus
                          className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-gradient-to-r from-[#d07648] to-[#bf6a41] text-white py-3 rounded-xl hover:from-[#bf6a41] hover:to-[#a85832] transition-all font-semibold shadow-lg hover:shadow-[#d07648]/35 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              )}

              {/* ── FORGOT SENT VIEW ── */}
              {view === 'forgot-sent' && (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#134c52] mb-2">Check your inbox</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-1">
                    A reset link has been sent to
                  </p>
                  <p className="text-[#0f8a94] font-semibold text-sm mb-6">{forgotEmail}</p>
                  <div className="mb-6 p-3.5 bg-[#d07648]/10 border-2 border-[#d07648]/20 rounded-xl text-left">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ⏱ The link expires in <span className="font-semibold text-[#d07648]">1 hour</span>. Didn't receive it?{' '}
                      <button
                        onClick={() => { setView('forgot'); setForgotError(''); }}
                        className="text-[#0f8a94] font-semibold hover:underline"
                      >
                        Try again
                      </button>{' '}
                      or check your spam folder.
                    </p>
                  </div>
                  <button
                    onClick={() => { setView('auth'); setForgotEmail(''); setForgotError('') }}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0f8a94] transition-colors mx-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* ── AUTH VIEW (Sign In / Sign Up) ── */}
              {view === 'auth' && (
                <>
                  {/* Modal Header */}
                  <div className="text-center mb-10">
                    <div className="flex justify-center">
                      <img src="/rexon-logo.png" alt="Rexon" className="h-28 w-auto object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0f8a94] to-[#0b6f78] bg-clip-text text-transparent mb-2">
                      {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {authMode === 'signin' ? 'Sign in to continue to Rexon' : 'Sign up to get started with Rexon'}
                    </p>
                  </div>

                  {/* Toggle Tabs */}
                  <div className="flex bg-[#13a8b4]/10 rounded-lg p-1.5 mb-7 border-2 border-[#13a8b4]/20 gap-2">
                    <button
                      onClick={() => handleAuthModeChange('signin')}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                        authMode === 'signin' ? 'bg-gradient-to-r from-[#13a8b4] to-[#0f8a94] text-white shadow-lg' : 'text-slate-600 hover:text-[#0f8a94]'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthModeChange('signup')}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                        authMode === 'signup' ? 'bg-gradient-to-r from-[#13a8b4] to-[#0f8a94] text-white shadow-lg' : 'text-slate-600 hover:text-[#0f8a94]'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-6 p-3.5 bg-[#d07648]/10 border-2 border-[#d07648]/25 rounded-lg flex items-start space-x-2.5">
                      <AlertCircle className="h-5 w-5 text-[#a85832] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#a85832] font-medium">{error}</p>
                    </div>
                  )}

                  {/* Social Buttons */}
                  <div className="space-y-2.5 mb-6">
                    <button
                      onClick={() => { setError(''); onGoogleSignIn() }}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl hover:border-[#13a8b4]/50 hover:bg-[#13a8b4]/10 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                    <button
                      onClick={() => { setError(''); onMicrosoftSignIn() }}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl hover:border-[#13a8b4]/50 hover:bg-[#13a8b4]/10 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00A4EF">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                      </svg>
                      <span>Continue with Microsoft</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-[#13a8b4]/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-white text-slate-500 font-medium">Or continue with email</span>
                    </div>
                  </div>

                  {/* Sign In Form */}
                  {authMode === 'signin' && (
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="signin-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                          <input
                            id="signin-email"
                            type="email"
                            value={signInData.email}
                            onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="signin-password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                          <input
                            id="signin-password"
                            type="password"
                            value={signInData.password}
                            onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <label htmlFor="remember" className="flex items-center space-x-2 cursor-pointer">
                          <input
                            id="remember"
                            type="checkbox"
                            checked={signInData.rememberMe}
                            onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                            className="w-4 h-4 text-[#13a8b4] border-[#13a8b4]/45 rounded focus:ring-[#13a8b4]/35 cursor-pointer"
                          />
                          <span className="text-slate-700 font-medium">Remember me</span>
                        </label>
                        {/* ── Forgot password trigger ── */}
                        <button
                          type="button"
                          onClick={() => { setView('forgot'); setForgotEmail(signInData.email); setForgotError('') }}
                          className="text-[#d07648] hover:text-[#a85832] font-semibold hover:underline transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        onClick={handleSignInSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#d07648] to-[#bf6a41] text-white py-3 rounded-xl hover:from-[#bf6a41] hover:to-[#a85832] transition-all font-semibold shadow-lg hover:shadow-[#d07648]/35 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </button>
                    </div>
                  )}

                  {/* Sign Up Form */}
                  {authMode === 'signup' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                          <div className="relative">
                            <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                            <input
                              id="firstName"
                              type="text"
                              value={signUpData.firstName}
                              onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                              placeholder="John"
                              required
                              className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                          <input
                            id="lastName"
                            type="text"
                            value={signUpData.lastName}
                            onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                            placeholder="Doe"
                            required
                            className="w-full px-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                          <input
                            id="signup-email"
                            type="email"
                            value={signUpData.email}
                            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">Phone Number (Optional)</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                          <input
                            id="phone"
                            type="tel"
                            value={signUpData.phone}
                            onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0f8a94] pointer-events-none" />
                          <input
                            id="signup-password"
                            type="password"
                            value={signUpData.password}
                            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full pl-12 pr-4 py-3 border-2 border-[#13a8b4]/25 rounded-xl focus:border-[#13a8b4] focus:ring-2 focus:ring-[#13a8b4]/25 focus:outline-none transition-all text-sm"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Must be at least 8 characters</p>
                      </div>

                      <button
                        onClick={handleSignUpSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#d07648] to-[#bf6a41] text-white py-3 rounded-xl hover:from-[#bf6a41] hover:to-[#a85832] active:from-[#a85832] active:to-[#924729] transition-all font-semibold shadow-lg hover:shadow-[#d07648]/35 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-5"
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}