// src/utils/notificationTransform.js

/**
 * The 7 filter categories requested, in the requested order. `icon` and
 * `color`/`bg` for each (except "all") live in NotificationsScreen's
 * TYPE_CONFIG, keyed by the same `id` used here — this keeps the single
 * source of truth for "what a category looks like" in one place.
 */
export const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'campaign', label: 'Campaigns' },
  { id: 'donation', label: 'Donations' },
  { id: 'withdrawal', label: 'Withdrawals' },
  { id: 'security', label: 'Security' },
  { id: 'promotional', label: 'Promotions' },
  { id: 'system', label: 'System' },
];

/**
 * Maps backend notificationType strings to one of the 7 categories
 * above.
 *
 * IMPORTANT: this uses SUBSTRING matching (not exact equality) — an
 * exact-match lookup table was too fragile: a real backend value like
 * "CAMPAIGN_SUBMITTED_FOR_REVIEW" wouldn't match a key literally named
 * "CAMPAIGN_SUBMITTED", silently falling through to the wrong category
 * (which is exactly what caused "Campaign Submitted" notifications to
 * show the wrong icon AND get filtered out of the Campaigns tab).
 * Checking whether the type CONTAINS a keyword is far more resilient to
 * whatever exact enum naming the backend uses.
 */
export const mapNotificationType = (notificationType) => {
  const type = String(notificationType || '').toUpperCase();

  if (type.includes('CAMPAIGN')) return 'campaign';
  if (type.includes('WITHDRAW')) return 'withdrawal';
  if (type.includes('DONAT') || type.includes('TRANSACTION')) return 'donation';
  if (
    type.includes('LOGIN') ||
    type.includes('CNIC') ||
    type.includes('PASSWORD') ||
    type.includes('SECURITY')
  ) {
    return 'security';
  }
  if (type.includes('PROMO') || type.includes('OFFER')) return 'promotional';

  // Genuinely unrecognized — falls back to "system". Logged so you can
  // tell me the exact string if a category still looks wrong; I can
  // then add a precise keyword for it above instead of guessing.
  if (__DEV__) {
    console.warn(
      `[notificationTransform] Unrecognized notificationType "${notificationType}" — defaulted to "system".`,
    );
  }
  return 'system';
};

/**
 * Status-based icon/color OVERRIDE — independent of category. A
 * campaign (or withdrawal) notification that was APPROVED, REJECTED, or
 * SUBMITTED/PENDING gets its own distinct icon+color reflecting that
 * specific outcome, rather than every notification in a category
 * sharing one generic icon. Returns null if the type doesn't indicate
 * a specific status, in which case the screen falls back to the
 * category's default icon (see TYPE_CONFIG in NotificationsScreen).
 */
export const getStatusVisual = (notificationType) => {
  const type = String(notificationType || '').toUpperCase();

  if (type.includes('REJECT') || type.includes('DECLIN')) {
    return { icon: 'x-circle', color: '#EF4444', bg: '#FEF2F2' };
  }
  if (type.includes('APPROV')) {
    return { icon: 'check-circle', color: '#16A34A', bg: '#F0FDF4' };
  }
  if (type.includes('SUBMIT') || type.includes('PENDING')) {
    return { icon: 'clock', color: '#F59E0B', bg: '#FFFBEB' };
  }

  return null;
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