import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ShieldAlert, Phone, MessageCircle, Navigation, ArrowLeft, HeartPulse, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/auth';

const RESOURCES = [
  {
    title: "Campus Crisis Hotline",
    desc: "24/7 immediate assistance from campus safety",
    icon: Phone,
    action: "Call 555-0199",
    color: "bg-error/10 text-error border-error/20 hover:border-error/50",
  },
  {
    title: "National Crisis Text Line",
    desc: "Text HOME to 741741 for immediate support",
    icon: MessageCircle,
    action: "Text Now",
    color: "bg-orange-400/10 text-orange-400 border-orange-400/20 hover:border-orange-400/50",
  },
  {
    title: "Student Health Center",
    desc: "Walk-in crisis counseling available",
    icon: Navigation,
    action: "Get Directions",
    color: "bg-primary/10 text-primary border-primary/20 hover:border-primary/50",
  }
];

export default function EmergencyResponse() {
  const [sosSent, setSosSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSOS = async () => {
    setSending(true);
    try {
      const res = await apiFetch('/api/emergency/sos', { method: 'POST' });
      if (res.ok) {
        setSosSent(true);
      }
    } catch (err) {
      console.error('Failed to dispatch SOS', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in relative">
        <div className="absolute top-0 left-0 w-full h-full bg-error/5 blur-3xl -z-10 rounded-full animate-pulse-slow" />
        
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <Card className="p-8 border-error/30 shadow-[0_0_40px_rgba(255,180,171,0.05)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-error animate-pulse" />
          
          <div className="w-20 h-20 bg-error/10 border border-error/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-error/20 animate-ping" />
            <ShieldAlert size={36} className="text-error" />
          </div>
          
          <h1 className="font-heading font-bold text-2xl text-text mb-2">Emergency SOS</h1>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            If you are in immediate danger or experiencing a medical emergency, please use the resources below immediately.
          </p>

          <button 
            onClick={handleSOS}
            disabled={sosSent || sending}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${
              sosSent 
                ? 'bg-success/20 text-success border border-success/30' 
                : 'bg-error hover:bg-error/90 text-white shadow-[0_0_20px_rgba(255,180,171,0.2)] hover:scale-[1.02]'
            }`}
          >
            {sending ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Dispatching Alert...</>
            ) : sosSent ? (
              <><HeartPulse size={20} /> Help is on the way</>
            ) : (
              <><ShieldAlert size={20} /> Alert Campus Response</>
            )}
          </button>

          {sosSent && (
            <div className="mb-8 p-3 rounded-lg bg-surface-bright border border-border text-xs text-text-muted flex items-start gap-2 text-left animate-slide-up">
              <Clock size={14} className="text-primary shrink-0 mt-0.5" />
              <p>Campus security and the on-call psychologist have been notified. Stay exactly where you are, help will arrive shortly.</p>
            </div>
          )}

          <div className="space-y-3">
            {RESOURCES.map(res => (
              <a href="#" key={res.title} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${res.color}`}>
                <res.icon size={20} className="mb-2" />
                <h3 className="font-heading font-semibold text-sm">{res.title}</h3>
                <p className="text-xs opacity-80 mt-1 mb-2">{res.desc}</p>
                <span className="text-xs font-bold uppercase tracking-wider">{res.action}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
