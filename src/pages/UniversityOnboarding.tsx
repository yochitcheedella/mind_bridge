import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building, Palette, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { API_URL } from '../utils/auth';

export default function UniversityOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState('#22c55e');

  const handleNext = () => setStep(step + 1);
  const handleBack = () => step > 1 ? setStep(step - 1) : navigate('/');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/onboarding/university`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          admin_email: email,
          admin_password: password,
          primary_color: color,
          logo_url: ''
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to register university');
      }

      setStep(3); // Success step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float-slow -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-3xl animate-float-med -z-10" />

      <div className="max-w-xl mx-auto w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 mb-4 shadow-lg shadow-primary/10">
            <Shield className="text-primary" size={28} />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Deploy MindBridge AI</h1>
          <p className="text-text-muted">Set up your university tenant in minutes.</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i ? 'bg-primary text-white' : 'bg-surface border border-border text-text-muted'}`}>
                {step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              {i < 3 && <div className={`w-12 h-1 rounded-full ${step > i ? 'bg-primary' : 'bg-surface'}`} />}
            </div>
          ))}
        </div>

        {/* Wizard Forms */}
        <Card className="p-6 md:p-8 shadow-2xl border border-primary/20 bg-surface/80 backdrop-blur-xl animate-fade-in">
          
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Building className="text-primary" size={24} />
                <div>
                  <h2 className="text-xl font-heading font-bold">Institution Details</h2>
                  <p className="text-xs text-text-muted">Basic info for your university tenant.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">University Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Stanford University"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Admin Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@stanford.edu"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Admin Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary transition-colors" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Palette className="text-primary" size={24} />
                <div>
                  <h2 className="text-xl font-heading font-bold">Custom Branding</h2>
                  <p className="text-xs text-text-muted">Personalize the platform for your students.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Primary Brand Color</label>
                <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-2">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                  <span className="font-mono text-sm uppercase">{color}</span>
                </div>
                <p className="text-[10px] text-text-muted">This color will be used for buttons, charts, and highlights.</p>
              </div>

              {/* Preview */}
              <div className="mt-8 p-6 rounded-xl border border-border" style={{ backgroundColor: `${color}15` }}>
                <p className="text-xs font-semibold mb-3 uppercase tracking-wider text-text-muted text-center">App Preview</p>
                <button className="w-full py-3 rounded-lg text-white font-bold transition-all" style={{ backgroundColor: color }}>
                  Login to {name || 'University'}
                </button>
              </div>
              
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-20 h-20 bg-success/15 border border-success/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={36} className="text-success" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">Tenant Created!</h2>
              <p className="text-text-muted text-sm mb-8">
                {name} is now live on MindBridge AI. Your students can immediately begin signing up anonymously.
              </p>
              
              <div className="bg-surface-dim border border-border p-4 rounded-xl mb-8">
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Your Admin Portal</p>
                <a href="http://localhost:5173/admin" target="_blank" rel="noreferrer" className="text-primary hover:underline break-all text-sm font-mono">
                  http://localhost:5173/admin
                </a>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button onClick={handleBack} className="flex items-center gap-2 text-text-muted hover:text-text px-4 py-2 rounded-lg hover:bg-surface-bright transition-all">
                <ArrowLeft size={16} /> Back
              </button>
              
              {step === 1 ? (
                <button onClick={handleNext} disabled={!name || !email || !password}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50">
                  Continue to Branding <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50">
                  {loading ? 'Creating Tenant...' : 'Deploy Platform'} <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 pt-6 border-t border-border">
              <button onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                Enter Administrator Portal <ChevronRight size={18} />
              </button>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
