'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard user={user} />
}

function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.reload()
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-blue">
            Signal<span className="text-brand-orange">Stack</span>
          </h1>
          <p className="text-gray-500 mt-2">Intent data that doesn't cost $60K/year</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.includes('Check') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-orange font-semibold ml-1 hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}

function Dashboard({ user }: { user: User }) {
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('signals')
  const supabase = createClient()

  useEffect(() => {
    fetchSignals()
  }, [])

  const fetchSignals = async () => {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setSignals(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Signal<span className="text-brand-orange">Stack</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            {['signals', 'accounts', 'alerts', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium capitalize border-b-2 transition ${
                  activeTab === tab 
                    ? 'border-brand-orange text-brand-orange' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'signals' && (
          <SignalsView signals={signals} loading={loading} />
        )}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}

function SignalsView({ signals, loading }: { signals: any[], loading: boolean }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Intent Signals</h2>
          <p className="text-gray-500">Real-time buying indicators from your target accounts</p>
        </div>
        <button className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition">
          Refresh Signals
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading signals...</p>
        </div>
      ) : signals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <div className="text-6xl mb-4">ð¡</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No signals yet</h3>
          <p className="text-gray-500 mb-6">Add target accounts to start receiving intent signals</p>
          <button className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-800 transition">
            Add Target Accounts
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Company</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Signal Type</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Details</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Strength</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {signals.map((signal) => (
                <tr key={signal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{signal.company_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalTypeColor(signal.signal_type)}`}>
                      {signal.signal_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{signal.details}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-orange h-2 rounded-full" 
                          style={{ width: `${signal.strength}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{signal.strength}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(signal.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function getSignalTypeColor(type: string) {
  const colors: Record<string, string> = {
    'job_posting': 'bg-blue-100 text-blue-700',
    'tech_change': 'bg-purple-100 text-purple-700',
    'funding': 'bg-green-100 text-green-700',
    'hiring_velocity': 'bg-orange-100 text-orange-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

function AccountsView() {
  return (
    <div className="bg-white rounded-xl p-8 border text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Target Accounts</h2>
      <p className="text-gray-500 mb-6">Upload your target account list to start monitoring intent signals</p>
      <button className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-800 transition">
        Upload Account List
      </button>
    </div>
  )
}

function AlertsView() {
  return (
    <div className="bg-white rounded-xl p-8 border text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Alert Settings</h2>
      <p className="text-gray-500 mb-6">Configure how and when you receive intent signal notifications</p>
      <button className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-800 transition">
        Configure Alerts
      </button>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="bg-white rounded-xl p-8 border">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">API Integration</h3>
          <p className="text-gray-500 text-sm mb-4">Connect your CRM and other tools</p>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Manage Integrations
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Billing</h3>
          <p className="text-gray-500 text-sm mb-4">Manage your subscription and payment methods</p>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            View Billing
          </button>
        </div>
      </div>
    </div>
  )
}