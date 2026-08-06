import React, { useState, useEffect } from 'react';
import {
  FileText, Download, RefreshCw, Building2, TrendingUp,
  Users, Calendar, AlertTriangle, CheckCircle2, BarChart2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../utils/auth';

interface WellbeingReport {
  report_title: string;
  generated_by: string;
  summary: {
    total_enrolled_students_on_platform: number;
    campus_wellbeing_score: number;
    high_risk_students_percent: number;
    total_counseling_appointments: number;
  };
  department_breakdown: Array<{
    department: string;
    students: number;
    avg_stress_score: number;
    wellbeing_score: number;
  }>;
  note: string;
}

export default function AdminReports() {
  const [report, setReport] = useState<WellbeingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/reports/wellbeing');
      if (res.ok) setReport(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const downloadJSON = () => {
    if (!report) return;
    setDownloading(true);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VIT_Wellbeing_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 1000);
  };

  const downloadCSV = () => {
    if (!report) return;
    const header = 'Department,Students,Stress Score,Wellbeing Score\n';
    const rows = report.department_breakdown
      .map(d => `${d.department},${d.students},${d.avg_stress_score},${d.wellbeing_score}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VIT_Wellbeing_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-2xl text-white flex items-center gap-2">
              <FileText className="text-purple-400" size={24} />
              Wellbeing Reports
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Anonymized campus wellbeing data — no individual identity included
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReport}
              className="p-2 bg-surface border border-border rounded-xl text-text-muted hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-muted hover:text-white rounded-xl text-sm transition-colors"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={downloadJSON}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              <Download size={14} /> {downloading ? 'Downloading...' : 'Download JSON'}
            </button>
          </div>
        </div>

        {!report ? (
          <Card className="p-12 text-center">
            <FileText className="text-text-muted mx-auto mb-3" size={32} />
            <p className="text-text-muted">No report data available</p>
          </Card>
        ) : (
          <>
            {/* Report Header */}
            <Card className="p-5 mb-5 border-purple-500/20 bg-purple-500/5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="text-purple-400" size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">{report.report_title}</h2>
                  <p className="text-text-muted text-sm mt-0.5">
                    Generated by: {report.generated_by} ·{' '}
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-300/70">
                    <CheckCircle2 size={11} /> {report.note}
                  </div>
                </div>
              </div>
            </Card>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2 text-text-muted">
                  <Users size={14} className="text-blue-400" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <p className="font-bold text-2xl text-white">
                  {report.summary.total_enrolled_students_on_platform}
                </p>
                <p className="text-xs text-text-muted mt-0.5">On platform</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2 text-text-muted">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-xs font-medium">Wellbeing</span>
                </div>
                <p className="font-bold text-2xl text-white">
                  {report.summary.campus_wellbeing_score}%
                </p>
                <p className="text-xs text-green-400 mt-0.5">Campus score</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2 text-text-muted">
                  <AlertTriangle size={14} className="text-orange-400" />
                  <span className="text-xs font-medium">High Risk</span>
                </div>
                <p className="font-bold text-2xl text-white">
                  {report.summary.high_risk_students_percent}%
                </p>
                <p className="text-xs text-text-muted mt-0.5">Of students</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2 text-text-muted">
                  <Calendar size={14} className="text-purple-400" />
                  <span className="text-xs font-medium">Appointments</span>
                </div>
                <p className="font-bold text-2xl text-white">
                  {report.summary.total_counseling_appointments}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Total sessions</p>
              </Card>
            </div>

            {/* Department Breakdown */}
            <Card className="p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 size={18} className="text-purple-400" />
                Department Wellbeing Breakdown
              </h2>
              {report.department_breakdown.length === 0 ? (
                <p className="text-text-muted text-sm">No department data available yet.</p>
              ) : (
                <div className="space-y-4">
                  {report.department_breakdown.map(dept => (
                    <div key={dept.department}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-white">{dept.department}</span>
                          <span className="text-xs text-text-muted">({dept.students} students)</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-orange-400">Stress: {dept.avg_stress_score}%</span>
                          <span className="text-green-400">Wellbeing: {dept.wellbeing_score}%</span>
                        </div>
                      </div>
                      {/* Wellbeing bar */}
                      <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            dept.wellbeing_score >= 70 ? 'bg-green-500' :
                            dept.wellbeing_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${dept.wellbeing_score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Privacy Notice */}
            <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-300/70 flex items-center gap-2">
                <CheckCircle2 size={12} />
                This report contains <strong>no individual student identities, chat content, or journal entries</strong>.
                All data is anonymized and aggregated per VIT privacy policy.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
