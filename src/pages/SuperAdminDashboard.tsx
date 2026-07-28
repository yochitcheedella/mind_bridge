import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, Activity, Settings, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../utils/auth';

interface SaaSMetrics {
  mrr: number;
  active_universities: number;
  total_students_covered: number;
  recent_invoices: any[];
  system_health: string;
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await apiFetch('/api/saas/dashboard');
        if (res.ok) {
          setMetrics(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadMetrics();
  }, []);

  if (!metrics) return <div className="p-8">Loading SaaS metrics...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl text-text">MindBridge Super Admin</h1>
            <p className="text-text-muted">Global Platform & SaaS Billing Overview</p>
          </div>
          <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-primary-hover">
            Onboard New University
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2 text-text-muted">
              <DollarSign className="text-success" size={20} />
              <h3 className="font-semibold">Global MRR</h3>
            </div>
            <p className="font-heading font-bold text-3xl">${metrics.mrr.toLocaleString()}</p>
            <p className="text-xs text-success mt-2 flex items-center gap-1"><TrendingUp size={12}/> +12% this month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2 text-text-muted">
              <Building2 className="text-primary" size={20} />
              <h3 className="font-semibold">Active Universities</h3>
            </div>
            <p className="font-heading font-bold text-3xl">{metrics.active_universities}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2 text-text-muted">
              <Users className="text-warning" size={20} />
              <h3 className="font-semibold">Total Lives Covered</h3>
            </div>
            <p className="font-heading font-bold text-3xl">{metrics.total_students_covered.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-2 text-text-muted">
              <Activity className="text-info" size={20} />
              <h3 className="font-semibold">System Health</h3>
            </div>
            <p className="font-heading font-bold text-3xl text-success">{metrics.system_health}</p>
          </Card>
        </div>

        {/* Invoices */}
        <Card className="p-6">
          <h2 className="font-heading font-bold text-xl mb-4 border-b border-border pb-4">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-text-muted text-sm border-b border-border/50">
                  <th className="pb-3 font-semibold">Invoice ID</th>
                  <th className="pb-3 font-semibold">University</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {metrics.recent_invoices.map((inv, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-surface-bright transition-colors">
                    <td className="py-4 font-mono">{inv.id}</td>
                    <td className="py-4 font-medium">{inv.university}</td>
                    <td className="py-4">${inv.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        inv.status === 'paid' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
