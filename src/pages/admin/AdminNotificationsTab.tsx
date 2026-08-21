import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  CheckCheck,
  Send,
  Sparkles,
  Inbox,
  ShieldAlert,
  ArrowRight,
  Filter,
  Eye,
  RefreshCw,
  UserPlus,
  FileText
} from 'lucide-react';
import { AdminNotification, EmailDispatchLog } from '../../types';

interface AdminNotificationsTabProps {
  onNavigateToApplication?: (appId: string) => void;
  onNavigateToActivation?: (reqId: string) => void;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
  onNavigateToApplication,
  onNavigateToActivation
}) => {
  const {
    adminNotifications,
    emailDispatchLogs,
    unreadNotificationsCount,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    dismissAdminNotification,
    fetchAdminNotifications,
    triggerTestEnrollmentNotification,
    isLoading
  } = useBank();

  const [activeSubTab, setActiveSubTab] = useState<'ALERTS' | 'EMAIL_LOGS'>('ALERTS');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedEmail, setSelectedEmail] = useState<EmailDispatchLog | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await triggerTestEnrollmentNotification();
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredNotifications = adminNotifications.filter((n) => {
    if (filterSeverity !== 'ALL' && n.severity !== filterSeverity) return false;
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Card */}
      <div className="bg-[#0b1e36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#d4af37]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                  AUTOMATED ADMINISTRATIVE DISPATCH &amp; REAL-TIME ALERTS
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-100">
                  Compliance &amp; Onboarding Notification Service
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Whenever a prospective client completes an enrollment application or requests dual-signature access,
              the automated notification engine immediately records high-priority system alerts and dispatches
              transactional compliance emails to the Master Administrator.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={isSimulating || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#c5a030] text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSimulating ? 'Dispatched Simulation...' : 'Simulate New User Enrollment'}</span>
            </button>

            <button
              onClick={() => markAllAdminNotificationsRead()}
              disabled={unreadNotificationsCount === 0}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-40 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={() => fetchAdminNotifications()}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Notifications"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-3.5 bg-[#071526] rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unread Alerts</span>
            <div className="text-lg font-bold text-amber-400 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              {unreadNotificationsCount} Active
            </div>
          </div>

          <div className="p-3.5 bg-[#071526] rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Dispatched Emails</span>
            <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              {emailDispatchLogs.length} Logged
            </div>
          </div>

          <div className="p-3.5 bg-[#071526] rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Recipient Gateway</span>
            <div className="text-xs font-bold text-slate-200 mt-1 truncate" title="alexandra.vance@atlanticprivatebank.com">
              alexandra.vance@...
            </div>
          </div>

          <div className="p-3.5 bg-[#071526] rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Delivery Reliability</span>
            <div className="text-lg font-bold text-blue-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              100% Succeeded
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('ALERTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              activeSubTab === 'ALERTS'
                ? 'bg-[#d4af37] text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>System Alerts ({adminNotifications.length})</span>
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('EMAIL_LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              activeSubTab === 'EMAIL_LOGS'
                ? 'bg-[#d4af37] text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Automated Email Dispatches ({emailDispatchLogs.length})</span>
          </button>
        </div>

        {/* Filter Controls for Alerts */}
        {activeSubTab === 'ALERTS' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-mono uppercase">Filter:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-[#d4af37]"
            >
              <option value="ALL">All Severities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        )}
      </div>

      {/* SUBTAB 1: LIVE SYSTEM ALERTS */}
      {activeSubTab === 'ALERTS' && (
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-[#091b30] border border-slate-800/80 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300 font-serif">No Alerts Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All incoming customer applications and dual-approval requests have been cleared.
              </p>
              <button
                onClick={handleSimulate}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold transition inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate New Enrollment Application</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = notif.status === 'UNREAD';
              const isUrgent = notif.severity === 'URGENT' || notif.severity === 'HIGH';

              return (
                <div
                  key={notif.id}
                  className={`border rounded-2xl p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isUnread
                      ? 'bg-[#0c223c] border-[#d4af37]/40 shadow-lg'
                      : 'bg-[#08172b]/80 border-slate-800/80 opacity-90'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isUrgent
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {notif.type === 'NEW_ENROLLMENT_APPLICATION' ? (
                        <UserPlus className="w-5 h-5" />
                      ) : notif.type === 'ACCOUNT_ACTIVATION_REQUESTED' ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                            notif.severity === 'URGENT'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : notif.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {notif.severity}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                        </span>

                        {isUnread && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                            NEW ALERT
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 font-serif">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Metadata Chips */}
                      {notif.metadata && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-slate-400">
                          {notif.metadata.applicantName && (
                            <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-200">
                              Applicant: <strong className="text-white">{notif.metadata.applicantName}</strong>
                            </span>
                          )}
                          {notif.metadata.referenceNumber && (
                            <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-[#d4af37]">
                              Ref: {notif.metadata.referenceNumber}
                            </span>
                          )}
                          {notif.metadata.region && (
                            <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
                              Region: {notif.metadata.region} ({notif.metadata.currency})
                            </span>
                          )}
                          {notif.metadata.initialDeposit && (
                            <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-200">
                              Deposit: {notif.metadata.initialDeposit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {notif.relatedApplicationId && onNavigateToApplication && (
                      <button
                        onClick={() => {
                          if (isUnread) markAdminNotificationRead(notif.id);
                          onNavigateToApplication(notif.relatedApplicationId!);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c5a030] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Review Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {notif.relatedActivationRequestId && onNavigateToActivation && (
                      <button
                        onClick={() => {
                          if (isUnread) markAdminNotificationRead(notif.id);
                          onNavigateToActivation(notif.relatedActivationRequestId!);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c5a030] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Inspect Activation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isUnread ? (
                      <button
                        onClick={() => markAdminNotificationRead(notif.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        title="Mark as Read"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </button>
                    ) : (
                      <span className="p-2 text-slate-500 text-xs flex items-center gap-1" title="Read">
                        <CheckCheck className="w-4 h-4 text-slate-500" />
                      </span>
                    )}

                    <button
                      onClick={() => dismissAdminNotification(notif.id)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                      title="Dismiss Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUBTAB 2: AUTOMATED EMAIL DISPATCH LOGS */}
      {activeSubTab === 'EMAIL_LOGS' && (
        <div className="space-y-4">
          <div className="bg-[#091b30] border border-slate-800/90 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>OUTBOUND TRANSACTIONAL EMAIL AUDIT LOG</span>
              <span className="text-emerald-400 font-bold">SMTP PROTOCOL: TLS 1.3 SECURED</span>
            </div>
            <p className="text-xs text-slate-300">
              Every applicant enrollment generates a cryptographically hashed transactional email record delivered to the Master Administrator's executive inbox.
            </p>
          </div>

          <div className="space-y-3">
            {emailDispatchLogs.length === 0 ? (
              <div className="bg-[#091b30] border border-slate-800/80 rounded-2xl p-12 text-center">
                <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No outgoing transactional emails logged yet.</p>
              </div>
            ) : (
              emailDispatchLogs.map((log) => {
                const isSelected = selectedEmail?.id === log.id;

                return (
                  <div
                    key={log.id}
                    className="bg-[#08172b] border border-slate-800 rounded-2xl overflow-hidden transition"
                  >
                    <div
                      onClick={() => setSelectedEmail(isSelected ? null : log)}
                      className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <Send className="w-4 h-4" />
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {log.deliveryStatus}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(log.sentAt).toLocaleDateString()} {new Date(log.sentAt).toLocaleTimeString()}
                            </span>
                            <span className="text-[11px] font-mono text-[#d4af37]">
                              Tracking: {log.id}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-100 font-serif">
                            {log.subject}
                          </h4>

                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 font-mono">
                            <span>To: <strong className="text-slate-200">{log.recipientEmail}</strong> ({log.recipientName})</span>
                            <span>•</span>
                            <span>From: <strong className="text-slate-300">{log.fromAddress}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold">
                        <span>{isSelected ? 'Hide Content' : 'View Email Content'}</span>
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Expandable Email Content */}
                    {isSelected && (
                      <div className="p-5 bg-[#050e1a] border-t border-slate-800 text-xs font-mono space-y-4">
                        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                          <div><strong>MIME-Version:</strong> 1.0</div>
                          <div><strong>Content-Type:</strong> text/html; charset=UTF-8</div>
                          <div><strong>X-Atlantic-Priority:</strong> HIGH (Urgent Compliance Queue)</div>
                          <div><strong>X-Applicant-Reference:</strong> {log.relatedEntityId || 'N/A'}</div>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-sans text-xs whitespace-pre-line leading-relaxed">
                          {log.body}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
