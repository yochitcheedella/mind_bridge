import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, User, AlertCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../utils/auth';

interface AppointmentItem {
  id: number;
  anonymous_id: string;
  slot_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
}

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function PsychologistCalendar() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [tab, setTab] = useState<'calendar' | 'list'>('calendar');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/appointments/psychologist');
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Calendar helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getApptsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(a => a.slot_time.startsWith(dateStr));
  };

  const selectedAppts = selectedDate
    ? appointments.filter(a => {
        const d = new Date(a.slot_time);
        return d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate();
      })
    : [];

  const upcoming = appointments
    .filter(a => new Date(a.slot_time) >= new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.slot_time).getTime() - new Date(b.slot_time).getTime());

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-2xl text-white flex items-center gap-2">
              <Calendar className="text-blue-400" size={24} />
              Appointment Calendar
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              {appointments.filter(a => a.status === 'confirmed').length} confirmed ·{' '}
              {appointments.filter(a => a.status === 'pending').length} pending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAppointments}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-xl text-sm text-text-muted hover:text-white transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="flex bg-surface border border-border rounded-xl overflow-hidden">
              {(['calendar', 'list'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    tab === t ? 'bg-blue-600 text-white' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <Card className="p-5">
                {/* Month Nav */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setViewDate(new Date(year, month - 1))}
                    className="p-2 hover:bg-surface-bright rounded-lg transition-colors text-text-muted"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h2 className="font-semibold text-white">{MONTHS[month]} {year}</h2>
                  <button
                    onClick={() => setViewDate(new Date(year, month + 1))}
                    className="p-2 hover:bg-surface-bright rounded-lg transition-colors text-text-muted"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-text-muted py-2">{d}</div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayAppts = getApptsForDay(day);
                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(new Date(year, month, day))}
                        className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                          ${isSelected ? 'bg-blue-600 text-white' :
                            isToday ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'hover:bg-surface-bright text-text'}`}
                      >
                        {day}
                        {dayAppts.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayAppts.slice(0, 3).map((a, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  a.status === 'confirmed' ? 'bg-green-400' :
                                  a.status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'
                                } ${isSelected ? 'opacity-70' : ''}`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Selected Day Panel */}
            <div>
              <Card className="p-5 h-full">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  {selectedDate
                    ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`
                    : 'Select a date'}
                </h3>

                {!selectedDate ? (
                  <p className="text-text-muted text-sm">Click a date to see appointments.</p>
                ) : selectedAppts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="text-text-muted mx-auto mb-2" size={24} />
                    <p className="text-text-muted text-sm">No appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAppts.map(appt => (
                      <div key={appt.id} className="p-3 bg-surface rounded-xl border border-border">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <User size={13} className="text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white truncate max-w-[120px]">{appt.anonymous_id}</p>
                              <p className="text-xs text-text-muted">
                                {new Date(appt.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[appt.status].color}`}>
                            {STATUS_CONFIG[appt.status].label}
                          </span>
                        </div>
                        {appt.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => updateStatus(appt.id, 'confirmed')}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors"
                            >
                              <CheckCircle2 size={12} /> Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            <h2 className="font-semibold text-white text-lg">
              Upcoming Appointments ({upcoming.length})
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : upcoming.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="text-text-muted mx-auto mb-3" size={32} />
                <p className="text-text-muted">No upcoming appointments</p>
              </Card>
            ) : (
              upcoming.map(appt => (
                <Card key={appt.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-sm">
                        {new Date(appt.slot_time).getDate()}
                      </span>
                      <span className="text-blue-300/60 text-xs">
                        {MONTHS[new Date(appt.slot_time).getMonth()].slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{appt.anonymous_id}</p>
                      <p className="text-text-muted text-xs flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(appt.slot_time).toLocaleString([], {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[appt.status].color}`}>
                      {STATUS_CONFIG[appt.status].label}
                    </span>
                    {appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(appt.id, 'confirmed')}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, 'cancelled')}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
