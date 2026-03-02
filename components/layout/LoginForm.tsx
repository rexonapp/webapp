'use client'
import { useState } from 'react'
import { X, Mail, Lock, UserCircle, Phone, AlertCircle } from 'lucide-react'

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`

interface SignInData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

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

export default function LoginForm({
  isOpen,
  onClose,
  authMode,
  onAuthModeChange,
  onGoogleSignIn,
  onMicrosoftSignIn,
  onEmailSignIn,
  onEmailSignUp,
}: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [signInData, setSignInData] = useState<SignInData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const [signUpData, setSignUpData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  })

  const handleAuthModeChange = (mode: 'signin' | 'signup') => {
    onAuthModeChange(mode)
    setError('')
  }

  const handleGoogleClick = () => {
    setError('')
    onGoogleSignIn()
  }

  const handleMicrosoftClick = () => {
    setError('')
    onMicrosoftSignIn()
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

  if (!isOpen) return null

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[96vh] overflow-hidden border-2 border-blue-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-6">
          {/* Modal Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center">
              <img
                src="/rexon-logo.png"
                alt="Rexon"
                className="h-28 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-2">
              {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {authMode === 'signin' ? 'Sign in to continue to Rexon' : 'Sign up to get started with Rexon'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-blue-50 rounded-lg p-1.5 mb-7 border-2 border-blue-100 gap-2">
            <button
              onClick={() => handleAuthModeChange('signin')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                authMode === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuthModeChange('signup')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-orange-50 border-2 border-orange-200 rounded-lg flex items-start space-x-2.5">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700 font-medium">{error}</p>
            </div>
          )}
          
          {/* Social Sign In Buttons */}
          <div className="space-y-2.5 mb-6">
            <button 
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
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
              onClick={handleMicrosoftClick}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
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
              <div className="w-full border-t-2 border-blue-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with email</span>
            </div>
          </div>
          
          {/* Sign In Form */}
          {authMode === 'signin' && (
            <div className="space-y-5">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
                  <input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="signin-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
                  <input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs pt-1">
                <label htmlFor="remember" className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    id="remember"
                    type="checkbox" 
                    checked={signInData.rememberMe}
                    onChange={(e) => setSignInData({...signInData, rememberMe: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500 cursor-pointer" 
                  />
                  <span className="text-slate-700 font-medium">Remember me</span>
                </label>
                <button className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors">
                  Forgot password?
                </button>
              </div>
              
              <button
                onClick={handleSignInSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
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
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
                    <input
                      id="firstName"
                      type="text"
                      value={signUpData.firstName}
                      onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                      placeholder="John"
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      value={signUpData.lastName}
                      onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                      placeholder="Doe"
                      required
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
                  <input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Must be at least 8 characters</p>
              </div>
              
              <button
                onClick={handleSignUpSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 transition-all font-semibold shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-5"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}