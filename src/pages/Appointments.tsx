import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, ChevronRight, ArrowLeft, Video, QrCode } from 'lucide-react';
import { apiFetch, API_URL } from '../utils/auth';

interface Slot {
  psychologist_id: number;
  psychologist_name: string;
  specialization: string;
  slot_time: string;
}

interface Appointment {
  id: number;
  psychologist_name: string;
  specialization: string;
  slot_time: string;
  status: string;
  notes: string | null;
  meeting_link?: string;
  check_in_code?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Confirmed', color: 'bg-success/15 text-success border-success/25', icon: <CheckCircle2 size={12} /> },
  pending:   { label: 'Pending',   color: 'bg-warning/15 text-warning border-warning/25', icon: <AlertCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: 'bg-error/15 text-error border-error/25',       icon: <XCircle size={12} /> },
};

export default function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'book' | 'mine'>('book');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [myAppts, setMyAppts] = useState<Appointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookedMsg, setBookedMsg] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/appointments/slots`)
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setSlots(d); }).finally(() => setLoadingSlots(false));
    apiFetch('/api/appointments/mine')
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setMyAppts(d); }).finally(() => setLoadingMine(false));
  }, []);

  const handleBook = async (slot: Slot) => {
    const key = `${slot.psychologist_id}_${slot.slot_time}`;
    setBookingId(key);
    try {
      const res = await apiFetch('/api/appointments/book', {
        method: 'POST',
        body: JSON.stringify({ psychologist_id: slot.psychologist_id, slot_time: slot.slot_time }),
      });
      if (res.ok) {
        const data = await res.json();
        const newAppt: Appointment = {
          id: data.id,
          psychologist_name: slot.psychologist_name,
          specialization: slot.specialization,
          slot_time: slot.slot_time,
          status: data.status,
          notes: null,
        };
        setMyAppts(prev => [...prev, newAppt]);
        setBookedMsg(`Session with ${slot.psychologist_name} confirmed!`);
        setActiveTab('mine');
        setTimeout(() => setBookedMsg(''), 4000);
      }
    } finally {
      setBookingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    await apiFetch(`/api/appointments/cancel/${id}`, { method: 'DELETE' });
    setMyAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  // Group slots by psychologist
  const slotsByDoc: Record<string, Slot[]> = {};
  slots.forEach(s => {
    if (!slotsByDoc[s.psychologist_name]) slotsByDoc[s.psychologist_name] = [];
    slotsByDoc[s.psychologist_name].push(s);
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-surface-dim/80 backdrop-blur-xl border-b border-border px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-bright transition-all shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-heading font-bold text-lg flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Counseling Sessions
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Anonymous — your counselor only sees your ID</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-5 animate-fade-in">
        {bookedMsg && (
          <div className="mb-4 flex items-center gap-2 bg-success/10 border border-success/25 rounded-xl px-4 py-3 text-sm text-success animate-slide-up">
            <CheckCircle2 size={16} /> {bookedMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-surface-bright rounded-xl p-1 mb-6">
          {(['book', 'mine'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${activeTab === tab ? 'bg-surface-dim text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              {tab === 'book' ? 'Book a Session' : `My Sessions (${myAppts.filter(a => a.status !== 'cancelled').length})`}
            </button>
          ))}
        </div>

        {activeTab === 'book' ? (
          <div className="space-y-6">
            {loadingSlots ? (
              <div className="text-center py-10 text-text-muted text-sm">Loading available slots...</div>
            ) : (
              Object.entries(slotsByDoc).map(([docName, docSlots]) => {
                const firstSlot = docSlots[0];
                return (
                  <Card key={docName} className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                        <User size={18} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold">{docName}</h3>
                        <p className="text-xs text-text-muted mt-0.5">{firstSlot.specialization}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {docSlots.slice(0, 4).map(slot => {
                        const dt = new Date(slot.slot_time);
                        const key = `${slot.psychologist_id}_${slot.slot_time}`;
                        const isBooking = bookingId === key;
                        return (
                          <button key={key} onClick={() => handleBook(slot)} disabled={isBooking}
                            className="text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group relative disabled:opacity-60">
                            <p className="text-xs font-semibold text-text">
                              {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {loadingMine ? (
              <div className="text-center py-10 text-text-muted text-sm">Loading your sessions...</div>
            ) : myAppts.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Calendar size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No sessions yet</p>
                <p className="text-xs mt-1 opacity-60">Book your first anonymous counseling session.</p>
                <button onClick={() => setActiveTab('book')} className="mt-4 text-primary text-sm hover:text-primary-hover font-medium transition-colors">
                  Browse available slots →
                </button>
              </div>
            ) : (
              myAppts.map(appt => {
                const dt = new Date(appt.slot_time);
                const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                const isFuture = dt > new Date();
                return (
                  <Card key={appt.id} className="p-4 animate-slide-up">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <User size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-sm">{appt.psychologist_name}</h3>
                          <p className="text-xs text-text-muted">{appt.specialization}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                            <Calendar size={11} />
                            {dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            <span>·</span>
                            <Clock size={11} />
                            {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${statusCfg.color}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                    </div>
                    {appt.status === 'confirmed' && isFuture && (
                      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                        <button onClick={() => handleCancel(appt.id)}
                          className="text-xs text-text-muted hover:text-error transition-colors flex items-center gap-1">
                          <XCircle size={12} /> Cancel
                        </button>
                        <div className="flex items-center gap-2">
                          {appt.meeting_link ? (
                            <button className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/20 transition-all flex items-center gap-1.5">
                              <Video size={12} /> Join Video
                            </button>
                          ) : appt.check_in_code ? (
                            <button className="text-xs bg-surface-dim border border-border text-text px-3 py-1.5 rounded-lg font-semibold hover:bg-surface-bright transition-all flex items-center gap-1.5">
                              <QrCode size={12} /> QR Check-in
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
