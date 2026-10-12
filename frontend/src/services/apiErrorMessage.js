export function apiErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg)
      .filter((msg) => typeof msg === 'string');
    if (messages.length) return messages.join('; ');
  }

  return error?.message || fallback;
}
