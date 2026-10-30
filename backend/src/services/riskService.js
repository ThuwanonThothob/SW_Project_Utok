export function normalizeRiskLevel(score) {
  if (score >= 80) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export function calculateRiskScore({ rainfallMm, riverDistanceKm, elevationM }) {
  const rainScore = Math.min(100, Math.max(0, Number(rainfallMm) || 0) / 1.5);
  const riverScore = Math.max(0, 100 - (Number(riverDistanceKm) || 0) * 18);
  const elevationScore = Math.max(0, 100 - (Number(elevationM) || 0) * 2.2);
  const score = Math.round(rainScore * 0.5 + riverScore * 0.3 + elevationScore * 0.2);
  return { score: Math.min(100, Math.max(0, score)), level: normalizeRiskLevel(score) };
}
