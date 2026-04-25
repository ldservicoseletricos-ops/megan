function computeEvalSnapshot({
  currentMemory,
  reflection,
  action,
  route,
  weather,
}) {
  const previous = currentMemory?.evals || {};
  const totals = previous.totals || {};

  const totalRuns = Number(totals.totalRuns || 0) + 1;
  const totalSuccesses =
    Number(totals.totalSuccesses || 0) +
    (reflection?.utilityScore >= 70 ? 1 : 0);
  const totalNavigationSuccesses =
    Number(totals.totalNavigationSuccesses || 0) + (route ? 1 : 0);
  const totalWeatherSuccesses =
    Number(totals.totalWeatherSuccesses || 0) + (weather?.temperature != null ? 1 : 0);
  const totalClarifications =
    Number(totals.totalClarifications || 0) +
    (action?.requiresDestination || action?.requiresLocation ? 1 : 0);

  const rates = {
    taskSuccessRate: percent(totalSuccesses, totalRuns),
    navigationSuccessRate: percent(totalNavigationSuccesses, totalRuns),
    weatherSuccessRate: percent(totalWeatherSuccesses, totalRuns),
    clarificationRate: percent(totalClarifications, totalRuns),
    averageUtilityScore: rolling(previous?.rates?.averageUtilityScore, totalRuns - 1, reflection?.utilityScore),
    averageFrictionScore: rolling(previous?.rates?.averageFrictionScore, totalRuns - 1, reflection?.frictionScore),
  };

  return {
    totals: {
      totalRuns,
      totalSuccesses,
      totalNavigationSuccesses,
      totalWeatherSuccesses,
      totalClarifications,
    },
    rates,
    updatedAt: new Date().toISOString(),
  };
}

function percent(part, total) {
  const safeTotal = Number(total);
  if (!Number.isFinite(safeTotal) || safeTotal <= 0) return 0;
  return Number(((Number(part || 0) / safeTotal) * 100).toFixed(2));
}

function rolling(previousAverage, previousCount, nextValue) {
  const safeNext = Number(nextValue);
  const safePrevAverage = Number(previousAverage);
  const safePrevCount = Number(previousCount);

  if (!Number.isFinite(safeNext)) {
    return Number.isFinite(safePrevAverage) ? safePrevAverage : null;
  }

  if (!Number.isFinite(safePrevAverage) || !Number.isFinite(safePrevCount) || safePrevCount <= 0) {
    return safeNext;
  }

  return Number((((safePrevAverage * safePrevCount) + safeNext) / (safePrevCount + 1)).toFixed(2));
}

export { computeEvalSnapshot };
