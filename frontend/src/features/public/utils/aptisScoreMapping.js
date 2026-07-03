export const getAptisSkillCefr = (score) => {
  if (score == null) return 'A0';
  const s = Number(score);
  if (s >= 46) return 'C';
  if (s >= 38) return 'B2';
  if (s >= 28) return 'B1';
  if (s >= 18) return 'A2';
  if (s >= 8)  return 'A1';
  return 'A0';
};

export const getCefrHeightPercent = (cefrStr) => {
  const mapping = {
    'A0': 10,
    'A1': 28,
    'A2': 46,
    'B1': 64,
    'B2': 82,
    'C': 100
  };
  return mapping[cefrStr?.toUpperCase()] || 10;
};
