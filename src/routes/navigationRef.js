// src/routes/navigationRef.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingRoute = null;

const parseMaybeJson = (value) => {
  if (value == null) return value;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '';
};

const parseBool = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null || value === '') return false;
  const s = String(value).toLowerCase().trim();
  return s === 'true' || s === '1' || s === 'yes';
};

// FCM delivers everything as strings, so "25" must become 25.
const parsePositiveId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const parseNotificationPayload = (input) => {
  if (!input) {
    return {
      userId: null,
      status: '',
      rejectionReason: '',
      stepNumber: NaN,
      notificationType: '',
      email: '',
      title: '',
      body: '',
      cnicResubmitted: false,
      donationId: null,
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
    ...(input.donationId ? { donationId: input.donationId } : {}),
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
  ).toUpperCase();

  let status = String(
    pickFirst(
      merged.status,
      merged.userStatus,
      merged.accountStatus,
      merged.registrationStatus,
      merged.verificationStatus,
    ),
  ).toUpperCase();

  if (!status && /REJECT/.test(type)) {
    status = 'REJECTED';
  }

  const stepNumber = Number(
    pickFirst(
      merged.stepNumber,
      merged.step,
      merged.rejectedStep,
      merged.step_number,
      merged.rejected_step,
    ),
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
    notificationType: type || status,
    email: String(
      pickFirst(merged.email, merged.userEmail, merged.user_email, input.email),
    ),
    title: String(pickFirst(merged.title, input.title)),
    body: String(pickFirst(merged.body, input.body)),
    cnicResubmitted: parseBool(
      pickFirst(
        merged.cnicResubmitted,
        merged.cnic_resubmitted,
        merged.resubmitted,
        input.cnicResubmitted,
      ),
    ),

    // ── Donation receipt deep-link ────────────────────────────
    // Both IDs feed GET /donation/{donationId}/user/{userId}.
    // donationUserId comes from the PAYLOAD, not the session, because
    // the backend returns a different projection per user (donor view
    // vs creator view) for the very same donation.
    donationId: parsePositiveId(
      pickFirst(
        merged.donationId,
        merged.donation_id,
        merged.donationID,
        merged.referenceId,
        merged.reference_id,
      ),
    ),
    donationUserId: parsePositiveId(
      pickFirst(
        merged.userId,
        merged.user_id,
        merged.recipientUserId,
        merged.recipient_user_id,
      ),
    ),
    role: String(pickFirst(merged.role, merged.userRole)).toLowerCase(),
  };
};

export const isSuccessNotification = (payload) => {
  const status = payload?.status || '';
  const type = payload?.notificationType || '';

  if (status === 'REJECTED' || /REJECT/.test(type)) {
    return false;
  }

  return (
    ['APPROVED', 'SUCCESS', 'ACCEPTED', 'COMPLETED', 'VERIFIED'].includes(
      status,
    ) || /APPROVED|SUCCESS|ACCEPTED|VERIFIED|COMPLETED/.test(type)
  );
};

export const isDonationNotification = (payload) => {
  if (!payload) return false;
  return !!payload.donationId;
};

export const isCnicRejection = (payload) => {
  if (!payload) return false;

  const status = payload.status || '';
  const type = payload.notificationType || '';
  const reason = `${payload.rejectionReason || ''} ${payload.title || ''} ${payload.body || ''}`.toUpperCase();
  const rejected =
    status === 'REJECTED' || /REJECT/.test(type) || /REJECT/.test(reason);
  const cnicRelated =
    payload.stepNumber === 2 ||
    /CNIC|NIC|IDENTITY|STEP\s*2/.test(type) ||
    /CNIC|NIC|IDENTITY/.test(reason);

  return rejected && cnicRelated;
};

/**
 * ORDER MATTERS.
 *
 * The donation check runs FIRST and deliberately bypasses the
 * isSuccessNotification() guard below it: a donation notification
 * carries status SUCCESS, so the success guard would otherwise swallow
 * it and the card would appear "dead" — read but never navigating.
 */
export const resolveNotificationRoute = (input) => {
  const payload = parseNotificationPayload(input);

  // 1) Donation → receipt
  if (payload.donationId) {
    return {
      name: 'DonationReceiptScreen',
      params: {
        donationId: payload.donationId,
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

  // 2) Other success notifications are informational only
  if (isSuccessNotification(payload)) return null;

  // 3) CNIC already resubmitted — nothing left to action
  if (payload.cnicResubmitted) return null;

  // 4) CNIC rejection → re-upload
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

export const navigateFromNotification = (input) => {
  const route = resolveNotificationRoute(input);
  if (!route) return false;

  if (navigationRef.isReady()) {
    navigationRef.navigate(route.name, route.params);
    return true;
  }

  pendingRoute = route;
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