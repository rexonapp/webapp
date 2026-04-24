'use client'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, User, Building2, Plus, Settings, Heart, LogOut } from 'lucide-react'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LoginForm from './LoginForm'

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  authProvider?: string;
  role?: string;
}

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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSession()
    checkUrlError()
  }, [])

  const checkUrlError = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    if (urlError) {
      setError(decodeURIComponent(urlError))
      setShowAuthModal(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  useEffect(() => {
    setShowProfileMenu(false);
  }, [pathname]);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setCurrentUser(data.user)
      }
    } catch (err) {
      console.error('Session check failed:', err)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false)
        setShowProfileMenu(false)
      }
    }
    if (showAuthModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showAuthModal])

  const handleEmailSignIn = async (signInData: SignInData) => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      setCurrentUser(data.user)
      setShowAuthModal(false)
      window.location.reload()
    } catch (err) {
      throw new Error((err as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (signUpData: SignUpData) => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Sign up failed')
      }

      setCurrentUser(data.user)
      setShowAuthModal(false)
      window.location.reload()
    } catch (err) {
      throw new Error((err as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError('')
    window.location.href = '/api/auth/google'
  }

  const handleMicrosoftSignIn = () => {
    setError('')
    window.location.href = '/api/auth/microsoft'
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setCurrentUser(null)
      setShowProfileMenu(false)
      window.location.href = '/'
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
    setError('')
  }

  const closeAuthModal = () => {
    setShowAuthModal(false)
    setError('')
  }

  const getUserInitials = (): string => {
    if (!currentUser) return '??'
    const first = currentUser.firstName?.[0] || currentUser.first_name?.[0] || ''
    const last = currentUser.lastName?.[0] || currentUser.last_name?.[0] || ''
    return (first + last).toUpperCase() || 'U'
  }

  const getUserFullName = (): string => {
    if (!currentUser) return ''
    const firstName = currentUser.firstName || currentUser.first_name || ''
    const lastName = currentUser.lastName || currentUser.last_name || ''
    return `${firstName} ${lastName}`.trim()
  }

  return (
    <>
      <nav className="bg-white/95 shadow-md sticky top-0 z-50 backdrop-blur-lg border-b border-[#13a8b4]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href={'/'}>
                <img
                  src="/rexon-logo.png"
                  alt="Rexon"
                  className="h-24 w-auto object-contain"
                />
              </Link>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Agent Join Button - Desktop */}
              <Link href='/agent/join'>
                <button className="hidden md:flex items-center space-x-2 px-4 py-2 text-[#0f8a94] hover:text-[#d07648] font-medium rounded-lg hover:bg-[#13a8b4]/10 transition-colors border-2 border-[#13a8b4]/25 hover:border-[#d07648]/45">
                  <span>Join as Agent</span>
                </button>
              </Link>

              {/* List Property Button - Only when logged in */}
              {/* {currentUser && (
                <Link href='/property'>
                  <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg hover:shadow-orange-500/50">
                    <Plus className="h-4 w-4" />
                    <span>List Property</span>
                  </button>
                </Link>
              )} */}
              
              {/* User Profile or Sign In */}
              {currentUser ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-3 focus:outline-none group"
                    aria-label="User menu"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#13a8b4] to-[#0b6f78] flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:shadow-[#13a8b4]/35 transition-all ring-2 ring-[#13a8b4]/30 group-hover:ring-[#d07648]/45">
                      {getUserInitials()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block group-hover:text-[#0f8a94] transition-colors" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-[#13a8b4]/20 overflow-hidden z-50">
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-br from-[#13a8b4]/10 to-[#d07648]/10 border-b-2 border-[#13a8b4]/20">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#13a8b4] to-[#0b6f78] flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#134c52] truncate">
                              {getUserFullName()}
                            </p>
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {currentUser.email}
                            </p>
                            {currentUser.authProvider && currentUser.authProvider !== 'email' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#d07648]/15 text-[#a85832] mt-1">
                                {currentUser.authProvider.charAt(0).toUpperCase() + currentUser.authProvider.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">My Profile</span>
                        </button> */}
                        
                        {/* <button onClick={()=>router.push('/mylistings')} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">My Properties</span>
                        </button> */}
                        <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-[#13a8b4]/10 hover:text-[#0f8a94] transition-colors">
                          <Link href="/myfavorites">
                            <div className="flex items-center gap-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <Heart className="h-4 w-4 text-red-600" />
                              <span className="font-medium">My Favorites</span>
                            </div>
                          </Link>
                        </button>

                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            router.push('/settings/banner/upload');
                          }} 
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-[#13a8b4]/10 hover:text-[#0f8a94] transition-colors"
                        >
                          <Settings className="h-4 w-4 text-[#0f8a94]" />
                          <span className="font-medium">Settings</span>
                        </button>
                        
                        <div className="border-t-2 border-[#13a8b4]/20 my-2"></div>
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-[#d07648] hover:bg-[#d07648]/10 transition-colors font-medium"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#13a8b4] to-[#0f8a94] text-white px-5 py-2 rounded-lg hover:from-[#0f8a94] hover:to-[#0b6f78] transition-all font-medium shadow-lg hover:shadow-[#13a8b4]/35"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-[#0f8a94] hover:bg-[#13a8b4]/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-[#13a8b4]/20 bg-white">
            <div className="px-4 py-4 space-y-1">
              <div className="pt-2 pb-1 space-y-2">
                <button className="block w-full text-left px-4 py-3 text-[#0f8a94] hover:bg-[#13a8b4]/10 rounded-lg font-medium border-2 border-[#13a8b4]/25 transition-colors">
                  Join as Agent
                </button>
                
                {currentUser && (
                  <button className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-[#d07648] to-[#c46b3f] text-white rounded-lg hover:from-[#c46b3f] hover:to-[#a85832] font-medium transition-all shadow-lg">
                    <Plus className="h-4 w-4" />
                    <span>List Property</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Form Modal */}
      <LoginForm
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        authMode={authMode}
        onAuthModeChange={setAuthMode}
        onGoogleSignIn={handleGoogleSignIn}
        onMicrosoftSignIn={handleMicrosoftSignIn}
        onEmailSignIn={handleEmailSignIn}
        onEmailSignUp={handleEmailSignUp}
      />
    </>
  )
}