import type { Agency, City, Group, Idol } from '../../types';
import { clamp, primaryGroup, selectPromotionOptions, selectSoloPromotionOptions } from './selectors';
import type { RunPromotionPayload, RunPromotionResult } from './types';

export function runPromotionAction(
  cities: City[],
  agency: Agency,
  idols: Idol[],
  groups: Group[],
  payload: RunPromotionPayload,
): RunPromotionResult {
  // ── Solo idol path ──────────────────────────────────────────────────────
  if (payload.idolId) {
    const idol = idols.find(i => i.id === payload.idolId);
    if (!idol) return { ok: false, reason: 'IDOL_NOT_FOUND' };

    const options = selectSoloPromotionOptions(cities, agency, idol);
    const option = options.find(o => o.id === payload.promotionId);
    if (!option) return { ok: false, reason: 'PROMOTION_NOT_FOUND' };
    if (option.lockedReason) return { ok: false, reason: 'PROMOTION_LOCKED' };
    if (agency.energy < option.energyCost) return { ok: false, reason: 'INSUFFICIENT_ENERGY' };
    if (agency.money < option.cost) return { ok: false, reason: 'INSUFFICIENT_FUNDS' };

    const readinessFactor = clamp(
      (idol.energy * 0.55 + idol.morale * 0.45) / 100,
      0.55,
      1.15,
    );
    const fansGained = Math.max(500, Math.round(option.fansGain * readinessFactor));
    const reputationGained = Math.max(
      1,
      Math.round(option.reputationGain * (0.75 + readinessFactor * 0.25)),
    );
    const revenueGained = Math.round(option.expectedRevenue * (0.65 + readinessFactor * 0.5));
    const popularityBoost = Math.max(1, Math.round(fansGained / 9_000));
    const moraleDelta = Math.max(1, Math.round(option.fatigueGain * 0.55));
    const energyDelta = Math.max(1, Math.round(option.fatigueGain * 0.9));

    const updatedIdols = idols.map(i =>
      i.id === idol.id
        ? {
            ...i,
            popularity: clamp(i.popularity + popularityBoost, 0, 100),
            morale: clamp(i.morale - moraleDelta, 0, 100),
            energy: clamp(i.energy - energyDelta, 0, 100),
            status: 'Promoting' as const,
          }
        : i,
    );

    return {
      ok: true,
      promotionName: option.name,
      groupId: undefined,
      groupName: idol.stageName,
      updatedGroup: undefined,
      updatedIdols,
      idolId: idol.id,
      totalCost: option.cost,
      revenueGained,
      netDelta: revenueGained - option.cost,
      fansGained,
      reputationGained,
      fatigueApplied: option.fatigueGain,
      energySpent: option.energyCost,
      performanceFactor: readinessFactor,
    };
  }

  // ── Group path ──────────────────────────────────────────────────────────
  const targetGroup = payload.groupId
    ? (groups.find(g => g.id === payload.groupId) ?? null)
    : primaryGroup(groups);

  if (!targetGroup) {
    return { ok: false, reason: 'GROUP_NOT_FOUND' };
  }

  const options = selectPromotionOptions(cities, agency, idols, [targetGroup]);
  const option = options.find(item => item.id === payload.promotionId);
  if (!option) {
    return { ok: false, reason: 'PROMOTION_NOT_FOUND' };
  }
  if (option.lockedReason) {
    return { ok: false, reason: 'PROMOTION_LOCKED' };
  }
  if (agency.energy < option.energyCost) {
    return { ok: false, reason: 'INSUFFICIENT_ENERGY' };
  }
  if (agency.money < option.cost) {
    return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
  }

  const popularityBoost = Math.max(1, Math.round(option.fansGain / 5_800));
  const members = idols.filter(idol => targetGroup.memberIds.includes(idol.id));
  const avgEnergy =
    members.reduce((sum, m) => sum + m.energy, 0) / Math.max(members.length, 1);
  const avgMorale =
    members.reduce((sum, m) => sum + m.morale, 0) / Math.max(members.length, 1);
  const readinessFactor = clamp((avgEnergy * 0.55 + avgMorale * 0.45) / 100, 0.55, 1.15);
  const saturationFactor = clamp(
    1 - targetGroup.popularity / 180 - (targetGroup.releases?.length ?? 0) * 0.03,
    0.55,
    1,
  );
  const performanceFactor = clamp(readinessFactor * saturationFactor, 0.45, 1.2);
  const fansGained = Math.max(900, Math.round(option.fansGain * performanceFactor));
  const reputationGained = Math.max(
    1,
    Math.round(option.reputationGain * (0.75 + readinessFactor * 0.25)),
  );
  const revenueGained = Math.round(option.expectedRevenue * (0.65 + performanceFactor * 0.5));
  const memberPopularityBoost = Math.max(1, Math.round(fansGained / 8_400));
  const memberMoraleDelta = Math.max(
    1,
    Math.round(option.fatigueGain * (0.45 + (1.1 - readinessFactor))),
  );
  const memberEnergyDelta = Math.max(
    1,
    Math.round(option.fatigueGain * (0.8 + (1.05 - readinessFactor))),
  );
  const groupPopularityBoost = Math.max(1, Math.round(fansGained / 7_200));

  const updatedIdols = idols.map(idol =>
    targetGroup.memberIds.includes(idol.id)
      ? {
          ...idol,
          popularity: clamp(idol.popularity + memberPopularityBoost, 0, 100),
          morale: clamp(idol.morale - memberMoraleDelta, 0, 100),
          energy: clamp(idol.energy - memberEnergyDelta, 0, 100),
          status: 'Promoting' as const,
        }
      : idol,
  );

  const updatedGroup: Group = {
    ...targetGroup,
    popularity: clamp(
      targetGroup.popularity + Math.max(popularityBoost, groupPopularityBoost),
      0,
      100,
    ),
    monthlyRevenue: Math.max(
      0,
      Math.round(targetGroup.monthlyRevenue + revenueGained / 2),
    ),
  };

  return {
    ok: true,
    promotionName: option.name,
    groupId: targetGroup.id,
    groupName: targetGroup.name,
    updatedGroup,
    updatedIdols,
    totalCost: option.cost,
    revenueGained,
    netDelta: revenueGained - option.cost,
    fansGained,
    reputationGained,
    fatigueApplied: option.fatigueGain,
    energySpent: option.energyCost,
    performanceFactor,
  };
}
