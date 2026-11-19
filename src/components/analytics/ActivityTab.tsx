import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Download,
  Moon,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/services/analytics.service';
import { userService } from '@/services/user.service';
import { UserDetailsModal } from '@/components/ui/UserDetailsModal';
import { Pagination } from '@/components/ui/Pagination';
import type {
  ActivityAnalytics,
  ActivityBucket,
  ActivityRole,
  ActivityRow,
} from '@/types/analytics.types';

const LIMIT = 25;

// Green (active) → red (gone). Same order as the server's buckets.
const BUCKET_COLORS: Record<ActivityBucket, string> = {
  active7: '#10B981',
  d7to30: '#84CC16',
  d30to90: '#F59E0B',
  over90: '#EF4444',
  never: '#9CA3AF',
};

const BUCKET_BADGE: Record<ActivityBucket, string> = {
  active7: 'bg-green-100 text-green-700',
  d7to30: 'bg-lime-100 text-lime-700',
  d30to90: 'bg-amber-100 text-amber-700',
  over90: 'bg-red-100 text-red-700',
  never: 'bg-gray-100 text-gray-600',
};

const KYC_BADGE: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  not_submitted: 'bg-gray-100 text-gray-600',
};

/** "3d ago", "5mo ago", "Today" — with the full date in a tooltip. */
const relative = (iso: string | null): string => {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};
const fullDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : 'Never');

const StatCard: React.FC<{
  icon: React.ElementType;
  tint: string;
  value: React.ReactNode;
  label: string;
  hint?: string;
  onClick?: () => void;
}> = ({ icon: Icon, tint, value, label, hint, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={`text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition ${
      onClick ? 'hover:border-primary-300 hover:shadow' : 'cursor-default'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg ${tint}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
    {hint && <p className="text-xs text-gray-500 mt-3">{hint}</p>}
  </button>
);

export const ActivityTab: React.FC = () => {
  const [role, setRole] = useState<ActivityRole>('vendor');
  const [bucket, setBucket] = useState<ActivityBucket | ''>('');
  const [kyc, setKyc] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest'>('oldest');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ActivityAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const requestId = useRef(0);

  // Debounce search typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Any filter change goes back to page 1
  useEffect(() => {
    setPage(1);
  }, [role, bucket, kyc, debouncedSearch, sort]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    analyticsService
      .getActivityAnalytics({ role, bucket, kyc, search: debouncedSearch, sort, page, limit: LIMIT })
      .then((res) => {
        if (id === requestId.current) setData(res);
      })
      .catch((e: any) => {
        if (id === requestId.current) setError(e?.message || 'Could not load activity data');
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [role, bucket, kyc, debouncedSearch, sort, page]);

  const switchRole = (r: ActivityRole) => {
    setRole(r);
    setKyc('');
    setBucket('');
  };

  const showQuiet = () => {
    setBucket('');
    setSort('oldest');
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await analyticsService.exportActivityCSV({ role, bucket, kyc, search: debouncedSearch, sort });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${role}-activity-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Activity CSV export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const openUser = async (row: ActivityRow) => {
    try {
      setOpeningId(row._id);
      const res: any = await userService.getUserById(row._id);
      setSelectedUser(res?.user || res?.data?.user || res);
    } catch (e) {
      console.error('Could not open user:', e);
    } finally {
      setOpeningId(null);
    }
  };

  const s = data?.summary;
  const roleLabel = role === 'vendor' ? 'vendors' : 'clients';
  const pct = (n: number) => (s && s.total ? `${Math.round((n / s.total) * 100)}%` : '0%');

  return (
    <div className="space-y-6">
      {/* Role toggle + explainer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Who is active, and who has gone quiet</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            "Last active" is the most recent of: login, app use, booking actions (accept, start, complete…),
            messages sent{role === 'vendor' ? ', offer responses' : ', orders placed'}. Login date alone is
            misleading — the app keeps people signed in for weeks.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 self-start lg:self-auto">
          {(['vendor', 'client'] as ActivityRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                role === r ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {r === 'vendor' ? 'Vendors' : 'Clients'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {/* Summary cards */}
      {s && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            tint="bg-blue-100 text-blue-600"
            value={s.total.toLocaleString()}
            label={`Total ${roleLabel}`}
            onClick={() => setBucket('')}
          />
          <StatCard
            icon={Activity}
            tint="bg-green-100 text-green-600"
            value={s.active7.toLocaleString()}
            label="Active in last 7 days"
            hint={`${s.active30.toLocaleString()} active in last 30 days (${pct(s.active30)})`}
            onClick={() => setBucket('active7')}
          />
          <StatCard
            icon={Moon}
            tint="bg-amber-100 text-amber-600"
            value={s.inactive30.toLocaleString()}
            label="Quiet for 30+ days"
            hint={`${pct(s.inactive30)} of ${roleLabel} · by login alone it would look like ${s.loginOnlyInactive30.toLocaleString()}`}
            onClick={showQuiet}
          />
          {data?.verified ? (
            <StatCard
              icon={ShieldCheck}
              tint="bg-pink-100 text-primary-600"
              value={`${data.verified.quiet30} / ${data.verified.total}`}
              label="Verified vendors gone quiet"
              hint="KYC-approved, no activity in 30+ days — best to win back first"
              onClick={() => {
                setKyc('approved');
                setSort('oldest');
                setBucket('');
              }}
            />
          ) : (
            <StatCard
              icon={AlertTriangle}
              tint="bg-red-100 text-red-600"
              value={s.inactive90.toLocaleString()}
              label="Gone 90+ days"
              hint="Likely churned — candidates for a win-back campaign"
              onClick={() => setBucket('over90')}
            />
          )}
        </div>
      )}

      {/* Bucket chart */}
      {data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Last active</h3>
            <p className="text-xs text-gray-500">Click a bar to list those {roleLabel}</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.buckets} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), roleLabel]} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
                onClick={(d: any) => setBucket(d?.key ?? d?.payload?.key ?? '')}
              >
                {data.buckets.map((b) => (
                  <Cell
                    key={b.key}
                    fill={BUCKET_COLORS[b.key]}
                    fillOpacity={!bucket || bucket === b.key ? 1 : 0.35}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${roleLabel}…`}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-60"
              />
            </div>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as ActivityBucket | '')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All activity</option>
              {(data?.buckets || []).map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label} ({b.count})
                </option>
              ))}
            </select>
            {role === 'vendor' && (
              <select
                value={kyc}
                onChange={(e) => setKyc(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Any KYC</option>
                <option value="approved">KYC approved</option>
                <option value="pending">KYC pending</option>
                <option value="rejected">KYC rejected</option>
                <option value="not_submitted">KYC not submitted</option>
              </select>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'oldest')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="oldest">Quietest first</option>
              <option value="recent">Most recent first</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || !data?.list.total}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : `Export ${data?.list.total ?? ''} to CSV`}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{role === 'vendor' ? 'Vendor' : 'Client'}</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                {role === 'vendor' && <th className="px-4 py-3 font-medium">KYC</th>}
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Last booking action</th>
                <th className="px-4 py-3 font-medium text-right">Completed</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !data && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Loading activity…
                  </td>
                </tr>
              )}
              {data?.list.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No {roleLabel} match these filters.
                  </td>
                </tr>
              )}
              {data?.list.items.map((r) => (
                <tr
                  key={r._id}
                  onClick={() => openUser(r)}
                  className={`hover:bg-pink-50/40 cursor-pointer ${loading ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {openingId === r._id ? 'Opening…' : r.name || '—'}
                    </p>
                    {r.businessName && <p className="text-xs text-gray-500">{r.businessName}</p>}
                    {r.status === 'suspended' && (
                      <span className="text-[11px] text-red-600 font-medium">Suspended</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{r.email}</p>
                    {r.phone && <p className="text-xs text-gray-500">{r.phone}</p>}
                  </td>
                  {role === 'vendor' && (
                    <td className="px-4 py-3">
                      {r.kycStatus ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            KYC_BADGE[r.kycStatus] || KYC_BADGE.not_submitted
                          }`}
                        >
                          {r.kycStatus.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3" title={fullDate(r.lastActive)}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BUCKET_BADGE[r.bucket]}`}>
                      {relative(r.lastActive)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600" title={fullDate(r.lastLogin)}>
                    {relative(r.lastLogin)}
                  </td>
                  <td className="px-4 py-3 text-gray-600" title={fullDate(r.lastBookingAction)}>
                    {relative(r.lastBookingAction)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{r.completedBookings}</td>
                  <td className="px-4 py-3 text-gray-600" title={fullDate(r.joinedAt)}>
                    {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.list.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={data.list.page}
              totalPages={data.list.totalPages}
              total={data.list.total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5" />
        App-use tracking was fixed recently, so "last active" gets more precise over the coming weeks.
        {data && ` Updated ${new Date(data.generatedAt).toLocaleTimeString()}.`}
      </p>

      {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

export default ActivityTab;
