// src/utils/notificationTransform.js

/**
 * Maps backend notificationType strings to the THREE existing visual
 * categories already defined in NotificationsScreen's TYPE_CONFIG
 * (donation / approved / cnic) — deliberately not introducing any new
 * colors or icon slots, per "UI/theme must remain exact same".
 * Anything unrecognized (including "LOGIN") falls back to the neutral
 * "cnic" style.
 */
const TYPE_MAP = {
  DONATION: 'donation',
  DONATION_RECEIVED: 'donation',

  CAMPAIGN_APPROVED: 'approved',
  APPROVED: 'approved',
  WITHDRAWAL_APPROVED: 'approved',

  LOGIN: 'cnic',
  CNIC_VERIFIED: 'cnic',
};

export const mapNotificationType = (notificationType) => {
  return TYPE_MAP[notificationType] ?? 'cnic';
};

/**
 * "2h ago" / "5m ago" / "Just now" style relative time for the card's
 * time label, matching the existing UI's short format.
 */
export const formatRelativeTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

/**
 * Section label for grouping — TODAY / YESTERDAY / "MONTH DAY" for
 * anything older, matching the existing UI's uppercase section headers.
 */
const getSectionLabel = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';

  const sameYear = date.getFullYear() === now.getFullYear();
  return date
    .toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: sameYear ? undefined : 'numeric',
    })
    .toUpperCase();
};

/**
 * Transforms the raw API notification list into the exact
 * {title, data: [{id, type, title, body, time, unread}]} shape the
 * existing NotificationsScreen SectionList/NotifCard UI expects.
 *
 * Since the API returns notifications newest-first, grouping via a Map
 * naturally preserves correct chronological section order (TODAY,
 * YESTERDAY, older dates...) without needing a separate sort step.
 */
export const groupNotificationsIntoSections = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];

  const map = new Map();

  list.forEach((n) => {
    const label = getSectionLabel(n.createdDate);
    if (!map.has(label)) map.set(label, []);

    map.get(label).push({
      id: String(n.notificationId),
      type: mapNotificationType(n.notificationType),
      title: n.title,
      body: n.message,
      time: formatRelativeTime(n.createdDate),
      unread: !n.read,
      raw: n, // keep original fields (screenName, referenceId, etc.) for navigation
    });
  });

  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
};