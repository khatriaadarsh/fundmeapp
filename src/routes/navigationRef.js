// src/routes/navigationRef.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingRoute = null;

/**
 * ONLY these two notification types open the donation receipt.
 */
export const DONATION_RECEIPT_TYPES = ['DONATION_SUCCESS', 'DONATION_RECEIVED'];

/**
 * ONLY these types open the campaign detail screen.
 */
export const CAMPAIGN_DETAIL_TYPES = ['CAMPAIGN_APPROVED', 'PROMOTIONAL'];

/**
 * ONLY this type reopens the campaign creation flow for a fix-up.
 */
export const CAMPAIGN_REJECTED_TYPES = ['CAMPAIGN_REJECTED'];

/**
 * Rejected step -> the screen that owns that step's fields.
 *
 * Deliberately 1-3 only: those are the steps with a resubmit endpoint.
 * A rejectedStep outside this range has nowhere to go, so the card stays
 * inert rather than dumping the creator on an unrelated screen.
 */
export const CAMPAIGN_STEP_SCREENS = {
  1: 'CreateCampaign',
  2: 'CampaignDetails',
  3: 'PhotosDocuments',
};

const parseMaybeJson = value => {
  if (value == null) return value;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};

const parseBool = value => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null || value === '') {
    return false;
  }
  const s = String(value).toLowerCase().trim();
  return s === 'true' || s === '1' || s === 'yes';
};

/**
 * Tri-state parse: true / false / null.
 *
 * null must stay distinguishable from false. The backend leaves
 * isClickable null on every legacy notification type, and collapsing
 * that into false would silently kill donation, approval and CNIC
 * routing across the whole app.
 */
const parseTriStateBool = value => {
  if (value === true) return true;
  if (value === false) return false;
  if (value === null || value === undefined || value === '') return null;

  const s = String(value).toLowerCase().trim();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return null;
};

const parsePositiveId = value => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Finds ONE key anywhere in the payload, case-insensitively.
 *
 * Kept single-key on purpose: searching a whole key list at each level
 * meant whichever key appeared first in object iteration order won, so a
 * row containing both `id` (the notification id) and `referenceId` (the
 * entity id) resolved to the wrong one. Callers now drive priority.
 */
const findKey = (source, key, depth = 0) => {
  if (!source || depth > 5) return null;

  const obj = parseMaybeJson(source);
  if (!obj || typeof obj !== 'object') return null;

  const wanted = String(key).toLowerCase();

  if (Array.isArray(obj)) {
    for (const entry of obj) {
      const found = findKey(entry, key, depth + 1);
      if (found !== null && found !== undefined && found !== '') return found;
    }
    return null;
  }

  for (const [k, v] of Object.entries(obj)) {
    if (
      String(k).toLowerCase() === wanted &&
      v !== undefined &&
      v !== null &&
      v !== ''
    ) {
      return v;
    }
  }

  for (const v of Object.values(obj)) {
    if (v && (typeof v === 'object' || typeof v === 'string')) {
      const found = findKey(v, key, depth + 1);
      if (found !== null && found !== undefined && found !== '') return found;
    }
  }

  return null;
};

/** Tries each key IN ORDER; the first one present anywhere wins. */
const deepFind = (source, keys) => {
  for (const key of keys) {
    const found = findKey(source, key);
    if (found !== null && found !== undefined && found !== '') return found;
  }
  return null;
};

/**
 * Flattens every key present anywhere in the payload.
 * Diagnostics only — lets a destination screen name the fields the
 * backend actually sent when an id can't be resolved.
 */
export const listPayloadKeys = (source, depth = 0, acc = new Set()) => {
  if (!source || depth > 4) return acc;

  const obj = parseMaybeJson(source);
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return acc;

  for (const [key, value] of Object.entries(obj)) {
    acc.add(key);
    if (value && (typeof value === 'object' || typeof value === 'string')) {
      listPayloadKeys(value, depth + 1, acc);
    }
  }
  return acc;
};

export const parseNotificationPayload = input => {
  if (!input) {
    return {
      userId: null,
      status: '',
      rejectionReason: '',
      stepNumber: NaN,
      rejectedStep: null,
      notificationType: '',
      email: '',
      title: '',
      body: '',
      cnicResubmitted: false,
      isClickable: null,
      referenceType: '',
      donationId: null,
      campaignId: null,
      donationUserId: null,
      role: '',
    };
  }

  const fcmData = parseMaybeJson(
    input.data || input.notification?.data || input.detail?.notification?.data,
  );
  const listRaw = parseMaybeJson(input.raw || input);
  const nestedData = parseMaybeJson(
    fcmData?.data || listRaw?.data || input.payload || listRaw?.payload,
  );

  const merged = {
    ...(typeof listRaw === 'object' && listRaw ? listRaw : {}),
    ...(typeof fcmData === 'object' && fcmData ? fcmData : {}),
    ...(typeof nestedData === 'object' && nestedData ? nestedData : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.body ? { body: input.body } : {}),
    ...(input.email ? { email: input.email } : {}),
  };

  const type = String(
    pickFirst(
      merged.notificationType,
      merged.type,
      merged.eventType,
      merged.category,
      merged.code,
      merged.notificationCode,
    ),
  )
    .toUpperCase()
    .trim();

  let status = String(
    pickFirst(
      merged.status,
      merged.userStatus,
      merged.accountStatus,
      merged.registrationStatus,
      merged.verificationStatus,
    ),
  ).toUpperCase();

  if (!status && /REJECT/.test(type)) status = 'REJECTED';

  const stepNumber = Number(
    pickFirst(
      merged.stepNumber,
      merged.step,
      merged.rejectedStep,
      merged.step_number,
      merged.rejected_step,
    ),
  );

  // rejectedStep is authoritative for campaign fix-ups and is read
  // first: a single campaign can accumulate several rejection rows
  // (step 1 handled, step 2 open), and only this field says which
  // screen each individual row belongs to.
  const rejectedStep = parsePositiveId(
    deepFind(input, ['rejectedStep', 'rejected_step', 'stepNumber', 'step']),
  );

  // ── Entity ids ─────────────────────────────────────────────
  // The API delivers the target id as referenceId, qualified by
  // referenceType, on the SAME row that also carries notificationId.
  // `id` is deliberately never consulted — it resolves to the
  // notification, not the donation or campaign.
  const referenceType = String(
    pickFirst(deepFind(input, ['referenceType', 'reference_type'])),
  ).toUpperCase();

  const isDonationType = DONATION_RECEIPT_TYPES.includes(type);
  const isCampaignType =
    CAMPAIGN_DETAIL_TYPES.includes(type) ||
    CAMPAIGN_REJECTED_TYPES.includes(type);

  const donationKeys = ['donationId', 'donation_id', 'donationID'];
  if (isDonationType || referenceType === 'DONATION') {
    donationKeys.push('referenceId', 'reference_id');
  }
  const donationId = parsePositiveId(deepFind(input, donationKeys));

  const campaignKeys = ['campaignId', 'campaign_id', 'campaignID'];
  if (isCampaignType || referenceType === 'CAMPAIGN') {
    campaignKeys.push('referenceId', 'reference_id');
  }
  const campaignId = parsePositiveId(deepFind(input, campaignKeys));

  const donationUserId = parsePositiveId(
    deepFind(input, [
      'userId',
      'user_id',
      'userID',
      'recipientUserId',
      'recipient_user_id',
      'receiverId',
    ]),
  );

  return {
    userId: pickFirst(merged.userId, merged.user_id) || null,
    status,
    rejectionReason: String(
      pickFirst(
        merged.rejectionReason,
        merged.rejection_reason,
        merged.reason,
        merged.message,
        merged.body,
        input.body,
      ),
    ),
    stepNumber,
    rejectedStep,
    notificationType: type || status,
    email: String(
      pickFirst(merged.email, merged.userEmail, merged.user_email, input.email),
    ),
    title: String(pickFirst(merged.title, input.title)),
    body: String(pickFirst(merged.body, merged.message, input.body)),
    cnicResubmitted: parseBool(
      pickFirst(
        merged.cnicResubmitted,
        merged.cnic_resubmitted,
        merged.resubmitted,
        input.cnicResubmitted,
      ),
    ),
    isClickable: parseTriStateBool(
      deepFind(input, ['isClickable', 'is_clickable', 'clickable']),
    ),
    referenceType,
    donationId,
    campaignId,
    donationUserId,
    role: String(pickFirst(merged.role, merged.userRole)).toLowerCase(),
  };
};

export const isSuccessNotification = payload => {
  const status = payload?.status || '';
  const type = payload?.notificationType || '';
  if (status === 'REJECTED' || /REJECT/.test(type)) return false;
  return (
    ['APPROVED', 'SUCCESS', 'ACCEPTED', 'COMPLETED', 'VERIFIED'].includes(
      status,
    ) || /APPROVED|SUCCESS|ACCEPTED|VERIFIED|COMPLETED/.test(type)
  );
};

export const isDonationNotification = payload => {
  const type = String(payload?.notificationType || '')
    .toUpperCase()
    .trim();
  return DONATION_RECEIPT_TYPES.includes(type);
};

/**
 * CAMPAIGN_APPROVED / PROMOTIONAL open the campaign detail screen.
 *
 * A campaignId IS required here, unlike the donation case: without it
 * the detail screen has nothing to fetch and would only show its own
 * "missing reference" state, so an inert card is the better outcome.
 */
export const isCampaignNotification = payload => {
  const type = String(payload?.notificationType || '')
    .toUpperCase()
    .trim();
  return CAMPAIGN_DETAIL_TYPES.includes(type) && !!payload?.campaignId;
};

/** Is this row a campaign-rejection row at all, clickable or not? */
export const isCampaignRejectionType = payload => {
  const type = String(payload?.notificationType || '')
    .toUpperCase()
    .trim();
  return CAMPAIGN_REJECTED_TYPES.includes(type);
};

/**
 * Can this campaign-rejection row still be acted on?
 *
 * isClickable is compared strictly against true — null means the
 * backend hasn't stamped this row (legacy) and false means the step was
 * already resubmitted; neither should navigate. A rejectedStep outside
 * 1-3 also has no destination.
 */
export const isCampaignRejectionActionable = payload => {
  if (!isCampaignRejectionType(payload)) return false;
  if (payload?.isClickable !== true) return false;
  if (!payload?.campaignId) return false;

  return !!CAMPAIGN_STEP_SCREENS[payload?.rejectedStep];
};

export const isCnicRejection = payload => {
  if (!payload) return false;

  const status = payload.status || '';
  const type = String(payload.notificationType || '').toUpperCase();
  const referenceType = String(payload.referenceType || '').toUpperCase();

  // Campaign rejections also arrive with stepNumber === 2 AND with
  // cnicResubmitted set, which the checks below would happily claim.
  // Excluded up-front so a rejected campaign can never be routed into
  // the CNIC upload screen.
  const campaignRelated =
    isCampaignRejectionType(payload) ||
    CAMPAIGN_DETAIL_TYPES.includes(type) ||
    /CAMPAIGN/.test(type) ||
    referenceType === 'CAMPAIGN';

  if (campaignRelated) return false;

  const reason =
    `${payload.rejectionReason || ''} ${payload.title || ''} ${payload.body || ''}`.toUpperCase();

  const rejected =
    status === 'REJECTED' || /REJECT/.test(type) || /REJECT/.test(reason);
  const cnicRelated =
    payload.stepNumber === 2 ||
    /CNIC|NIC|IDENTITY|STEP\s*2/.test(type) ||
    /CNIC|NIC|IDENTITY/.test(reason);

  return rejected && cnicRelated;
};

export const resolveNotificationRoute = input => {
  const payload = parseNotificationPayload(input);

  // 1) Donation receipt — DONATION_SUCCESS / DONATION_RECEIVED only
  if (isDonationNotification(payload)) {
    return {
      name: 'DonationReceiptScreen',
      params: {
        donationId: payload.donationId || undefined,
        userId: payload.donationUserId || undefined,
        role:
          payload.role === 'creator' || payload.role === 'donor'
            ? payload.role
            : undefined,
        notificationType: payload.notificationType || '',
        notificationTitle: payload.title || '',
      },
    };
  }

  // 2) Campaign detail — CAMPAIGN_APPROVED / PROMOTIONAL
  //
  // Checked BEFORE the success guard below: CAMPAIGN_APPROVED matches
  // /APPROVED/, so leaving it after would classify it as informational
  // and the card would go dead after only marking itself read.
  if (isCampaignNotification(payload)) {
    return {
      name: 'CampaignDetail',
      params: {
        campaignId: payload.campaignId,
        notificationType: payload.notificationType || '',
        notificationTitle: payload.title || '',
      },
    };
  }

  // 3) Campaign rejection — fully self-contained.
  //
  // Returns from inside this branch either way, because these rows also
  // carry cnicResubmitted and a stepNumber of 2; falling through would
  // hand a rejected campaign to the CNIC branch below.
  if (isCampaignRejectionType(payload)) {
    if (!isCampaignRejectionActionable(payload)) return null;

    return {
      name: CAMPAIGN_STEP_SCREENS[payload.rejectedStep],
      params: {
        isRejection: true,
        campaignId: payload.campaignId,
        stepNumber: payload.rejectedStep,
        rejectedStep: payload.rejectedStep,
        rejectionReason: payload.rejectionReason,
        notificationType: payload.notificationType || '',
        notificationTitle: payload.title || '',
      },
    };
  }

  // 4) Any other success notification is informational
  if (isSuccessNotification(payload)) return null;

  // 5) CNIC already resubmitted
  if (payload.cnicResubmitted) return null;

  // 6) CNIC rejection
  if (isCnicRejection(payload)) {
    return {
      name: 'CNICUploadScreen',
      params: {
        isRejection: true,
        rejectionReason: payload.rejectionReason,
        stepNumber: payload.stepNumber || 2,
        email: payload.email,
        userStatus: payload.status || payload.notificationType || 'REJECTED',
      },
    };
  }

  return null;
};

export const navigateFromNotification = input => {
  const route = resolveNotificationRoute(input);
  if (!route) return false;

  // The original row travels along so the destination screen can
  // re-extract anything the router couldn't resolve.
  const params = {
    ...(route.params || {}),
    rawNotification: input?.raw || input || null,
  };

  if (navigationRef.isReady()) {
    navigationRef.navigate(route.name, params);
    return true;
  }

  pendingRoute = { name: route.name, params };
  return true;
};

export const onNavigationReady = () => {
  if (pendingRoute && navigationRef.isReady()) {
    navigationRef.navigate(pendingRoute.name, pendingRoute.params);
    pendingRoute = null;
  }
};

export const consumePendingNotificationRoute = () => {
  if (!pendingRoute || !navigationRef.isReady()) return;
  navigationRef.navigate(pendingRoute.name, pendingRoute.params);
  pendingRoute = null;
};