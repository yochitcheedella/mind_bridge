import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Brain, HeartPulse, Lock, ArrowRight, CheckCircle2, ChevronRight, Activity, Users } from 'lucide-react';
import { FAQSection } from '../components/landing/FAQSection';
import { PricingSection } from '../components/landing/PricingSection';
import { Footer } from '../components/landing/Footer';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden selection:bg-primary/30 relative">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-float-slow -z-10" />
      <div className="absolute top-[40%] right-[-15%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-float-med -z-10" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-lg shadow-primary/10">
              <Shield className="text-primary" size={20} />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">Mind<span className="text-primary">Bridge</span> AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <a href="#security" className="hover:text-text transition-colors">Security</a>
            <a href="#testimonials" className="hover:text-text transition-colors">Universities</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-text hover:text-primary transition-colors">
              Student Login
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-primary/20 text-primary text-xs font-semibold mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live at 50+ Universities
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter leading-[1.1] mb-8 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          Zero-Identity Mental<br />
          Health Support for <span className="text-primary">Students.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
          MindBridge provides 24/7 empathetic AI counseling, real-time crisis triage, and guaranteed anonymity. We bridge the gap between struggling students and clinical care.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/onboarding')} className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-base font-bold rounded-xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
            Deploy at Your Campus <ChevronRight size={18} />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text text-base font-bold rounded-xl hover:bg-surface-bright transition-all flex items-center justify-center gap-2 group">
            <Activity size={18} className="text-text-muted group-hover:text-text transition-colors" /> View Live Demo
          </button>
        </div>

        {/* Dashboard Preview Image (Mock) */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="aspect-[16/9] rounded-2xl border border-border bg-surface-dim overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-surface/80 backdrop-blur-xl border border-border rounded-2xl">
                 <h3 className="font-heading font-bold text-2xl mb-2">Platform Overview</h3>
                 <p className="text-text-muted text-sm">Interactive demo environment coming soon.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">A complete ecosystem for student wellbeing.</h2>
            <p className="text-text-muted">Designed to detect, support, and triage without ever compromising student privacy.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Empathetic AI Guide</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Available 24/7. Our fine-tuned AI acts as a sounding board for stress, anxiety, and burnout, offering validated CBT-inspired exercises.
              </p>
            </div>
            
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-error/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-6">
                <HeartPulse className="text-error" size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Live Risk Triage</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                The AI passively analyzes chat sentiment and journals to detect severe crises, instantly pinging on-campus psychologists via WebSockets.
              </p>
            </div>
            
            <div className="p-8 bg-background border border-border rounded-2xl hover:border-success/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-6">
                <Lock className="text-success" size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Guaranteed Anonymity</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Students use AES-256 encrypted aliases. Identity is only decoupled through a strict emergency break-glass protocol during life-threatening events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Pricing */}
      <FAQSection />
      <PricingSection />

      {/* Footer CTA */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading font-bold mb-6">Ready to support your students?</h2>
        <p className="text-text-muted mb-8 max-w-lg mx-auto">
          Join leading universities in providing accessible, stigma-free mental health support.
        </p>
        <button onClick={() => navigate('/onboarding')} className="px-8 py-4 bg-white text-black text-base font-bold rounded-xl hover:bg-gray-200 transition-all shadow-xl">
          Get Started for Free
        </button>
      </section>
      
      <Footer />
      
    </div>
  );
}
