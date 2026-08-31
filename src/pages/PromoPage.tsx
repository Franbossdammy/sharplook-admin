import React, { useEffect, useMemo, useState } from 'react';
import {
  Gift,
  Plus,
  Play,
  Pause,
  BarChart3,
  X,
  RefreshCw,
  Users,
  Wallet,
  TrendingUp,
  Percent,
  DollarSign,
} from 'lucide-react';
import {
  promoService,
  PromoCampaign,
  PromoStats,
  CreatePromoDto,
} from '../services/promo.service';

const PINK = '#D73870';

const numberFmt = (n: number | undefined) =>
  typeof n === 'number' ? `₦${n.toLocaleString()}` : '—';

export const PromoPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsFor, setStatsFor] = useState<PromoStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<CreatePromoDto>({
    name: '',
    description: '',
    discountAmount: 3000,
    vendorBonusAmount: 2000,
    minServicePrice: 10000,
    maxSlots: 200,
    maxUsesPerUser: 1,
    appliesTo: 'ALL',
    isActive: true,
  });

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.isActive && c.slotsRemaining > 0) || null,
    [campaigns]
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await promoService.listCampaigns();
      setCampaigns(res.data || []);
    } catch (e) {
      console.error('Failed to load promo campaigns', e);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await promoService.createCampaign({
        ...form,
        description: form.description?.trim() || undefined,
      });
      setShowCreateModal(false);
      setForm({
        name: '',
        description: '',
        discountAmount: 3000,
        vendorBonusAmount: 2000,
        minServicePrice: 10000,
        maxSlots: 200,
        maxUsesPerUser: 1,
        appliesTo: 'ALL',
        isActive: true,
      });
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePause = async (c: PromoCampaign) => {
    try {
      await promoService.setActive(c._id, !c.isActive);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Failed to toggle');
    }
  };

  const openStats = async (c: PromoCampaign) => {
    setShowStatsModal(true);
    setStatsFor(null);
    setStatsLoading(true);
    try {
      const res = await promoService.getStats(c._id);
      setStatsFor(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6" style={{ color: PINK }} />
            Promo Campaigns
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Run booking promos: give clients a discount and vendors a bonus.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: PINK }}
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Active campaign summary */}
      {activeCampaign && (
        <div
          className="rounded-2xl p-6 text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${PINK} 0%, #9F1239 100%)` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Active campaign</p>
              <h2 className="text-2xl font-bold mt-1">{activeCampaign.name}</h2>
              {activeCampaign.description && (
                <p className="text-sm opacity-90 mt-1">{activeCampaign.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider opacity-80">Slots left</p>
              <p className="text-3xl font-bold mt-1">
                {activeCampaign.slotsRemaining} / {activeCampaign.maxSlots}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs opacity-80">Client discount</p>
              <p className="font-semibold text-lg mt-1">
                {numberFmt(activeCampaign.discountAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-80">Vendor bonus</p>
              <p className="font-semibold text-lg mt-1">
                {numberFmt(activeCampaign.vendorBonusAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-80">Min service price</p>
              <p className="font-semibold text-lg mt-1">
                {numberFmt(activeCampaign.minServicePrice)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campaign list */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All campaigns</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading…</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No campaigns yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first promo campaign to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {campaigns.map((c) => {
              const used = c.maxSlots - c.slotsRemaining;
              const pct = c.maxSlots > 0 ? Math.round((used / c.maxSlots) * 100) : 0;
              return (
                <div
                  key={c._id}
                  className="px-6 py-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{c.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Paused'}
                      </span>
                      {c.slotsRemaining === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                          Sold out
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{c.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>
                        Discount: <strong>{numberFmt(c.discountAmount)}</strong>
                      </span>
                      <span>
                        Vendor bonus: <strong>{numberFmt(c.vendorBonusAmount)}</strong>
                      </span>
                      <span>
                        Min: <strong>{numberFmt(c.minServicePrice)}</strong>
                      </span>
                    </div>
                    <div className="mt-2 w-full max-w-md">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">
                          {used} / {c.maxSlots} used
                        </span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: PINK }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openStats(c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Stats
                    </button>
                    <button
                      onClick={() => handleTogglePause(c)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium ${
                        c.isActive
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'text-white'
                      }`}
                      style={c.isActive ? undefined : { backgroundColor: PINK }}
                    >
                      {c.isActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">New Promo Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Campaign name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="LookReal Launch Promo"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Client discount (₦)
                  </label>
                  <input
                    type="number"
                    value={form.discountAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountAmount: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vendor bonus (₦)
                  </label>
                  <input
                    type="number"
                    value={form.vendorBonusAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vendorBonusAmount: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min service price (₦)
                  </label>
                  <input
                    type="number"
                    value={form.minServicePrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minServicePrice: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max slots
                  </label>
                  <input
                    type="number"
                    value={form.maxSlots}
                    onChange={(e) => setForm((f) => ({ ...f, maxSlots: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Uses per client
                  </label>
                  <input
                    type="number"
                    value={form.maxUsesPerUser}
                    min={1}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxUsesPerUser: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Applies to
                  </label>
                  <select
                    value={form.appliesTo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, appliesTo: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="ALL">All bookings</option>
                    <option value="HOME_SERVICE">Home service only</option>
                    <option value="IN_SHOP">In-shop only</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-pink-50 border border-pink-100 p-3 text-xs text-pink-900">
                Platform cost per redemption:{' '}
                <strong>
                  {numberFmt(form.discountAmount + form.vendorBonusAmount)}
                </strong>{' '}
                · Max total exposure:{' '}
                <strong>
                  {numberFmt((form.discountAmount + form.vendorBonusAmount) * form.maxSlots)}
                </strong>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={creating || !form.name.trim()}
                onClick={handleCreate}
                className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: PINK }}
              >
                {creating ? 'Creating…' : 'Create campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Campaign stats</h3>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setStatsFor(null);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {statsLoading || !statsFor ? (
                <div className="text-center text-gray-500 text-sm py-8">Loading…</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500 tracking-wider">
                      {statsFor.campaign.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatTile
                      icon={<Users className="w-4 h-4" />}
                      label="Redemptions (active)"
                      value={statsFor.stats.activeRedemptions.toString()}
                    />
                    <StatTile
                      icon={<RefreshCw className="w-4 h-4" />}
                      label="Refunded"
                      value={statsFor.stats.refundedRedemptions.toString()}
                    />
                    <StatTile
                      icon={<Percent className="w-4 h-4" />}
                      label="Slots used"
                      value={`${statsFor.campaign.slotsUsed} / ${statsFor.campaign.maxSlots}`}
                    />
                    <StatTile
                      icon={<TrendingUp className="w-4 h-4" />}
                      label="Slots remaining"
                      value={statsFor.campaign.slotsRemaining.toString()}
                    />
                    <StatTile
                      icon={<DollarSign className="w-4 h-4" />}
                      label="Total client discount"
                      value={numberFmt(statsFor.stats.totalClientDiscount)}
                    />
                    <StatTile
                      icon={<Gift className="w-4 h-4" />}
                      label="Total vendor bonus"
                      value={numberFmt(statsFor.stats.totalVendorBonusCommitted)}
                    />
                    <div className="col-span-2">
                      <StatTile
                        icon={<Wallet className="w-4 h-4" />}
                        label="Total platform spend"
                        value={numberFmt(statsFor.stats.totalPlatformSpend)}
                        highlight
                      />
                    </div>
                  </div>

                  {statsFor.redemptions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Recent redemptions
                      </h4>
                      <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                        {statsFor.redemptions.slice(0, 30).map((r) => {
                          const user: { firstName?: string; lastName?: string } =
                            typeof r.user === 'string' ? { firstName: r.user } : r.user;
                          const displayName =
                            (user.firstName || '') +
                              (user.lastName ? ' ' + user.lastName : '') || 'Unknown';
                          return (
                            <div
                              key={r._id}
                              className="px-3 py-2 text-xs flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-gray-800">{displayName}</p>
                                <p className="text-gray-500">
                                  {new Date(r.redeemedAt).toLocaleString()}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${
                                  r.refundedAt
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-green-50 text-green-700'
                                }`}
                              >
                                {r.refundedAt ? 'Refunded' : 'Active'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div
    className={`rounded-lg p-3 border ${
      highlight ? 'border-pink-200 bg-pink-50' : 'border-gray-100 bg-white'
    }`}
  >
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className={`font-bold text-lg ${highlight ? 'text-pink-700' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

export default PromoPage;
