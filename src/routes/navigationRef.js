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
      pickFirst(
        merged.email,
        merged.userEmail,
        merged.user_email,
        input.email,
      ),
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

export const resolveNotificationRoute = (input) => {
  const payload = parseNotificationPayload(input);

  if (isSuccessNotification(payload)) return null;

  // Already resubmitted CNIC — not clickable
  if (payload.cnicResubmitted) return null;

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