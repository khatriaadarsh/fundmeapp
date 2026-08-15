// src/utils/shareReceipt.js
//
// Isolated so the receipt screen never crashes at import time when a
// native module is missing, and so the FAILING STAGE is reportable
// instead of silently degrading to a text-only share.

let ViewShotModule = null;
let viewShotLoadError = null;
try {
  // eslint-disable-next-line global-require
  ViewShotModule = require('react-native-view-shot');
} catch (e) {
  ViewShotModule = null;
  viewShotLoadError = e?.message || 'require failed';
}

let RNShare = null;
let shareLoadError = null;
try {
  // eslint-disable-next-line global-require
  const mod = require('react-native-share');
  RNShare = mod?.default || mod || null;
} catch (e) {
  RNShare = null;
  shareLoadError = e?.message || 'require failed';
}

export const ViewShot = ViewShotModule?.default || null;

export const SHARE_MODULES_READY =
  !!ViewShot && typeof RNShare?.open === 'function';

/**
 * Names exactly which dependency is unusable, because
 * "sharing unavailable" alone is indistinguishable from a code bug.
 */
export const getShareDiagnostics = () => {
  const problems = [];

  if (!ViewShotModule) {
    problems.push(`react-native-view-shot not loaded (${viewShotLoadError})`);
  } else if (!ViewShot) {
    problems.push('react-native-view-shot loaded but has no default export');
  }

  if (!RNShare) {
    problems.push(`react-native-share not loaded (${shareLoadError})`);
  } else if (typeof RNShare.open !== 'function') {
    problems.push('react-native-share loaded but open() is missing');
  }

  return problems.length ? problems.join(' | ') : 'OK';
};

const makeError = (message, step) => {
  const e = new Error(message);
  e.step = step;
  return e;
};

/**
 * Capture is attempted three ways because the one that works depends on
 * the architecture: on Fabric the <ViewShot> instance method is the only
 * reliable path, on the old architecture captureRef also works, and
 * captureScreen is the last resort when neither can measure the node —
 * which is what otherwise produces a silent, empty snapshot.
 */
const captureBase64 = async shotRef => {
  const options = { format: 'png', quality: 1, result: 'base64' };
  const attempts = [];

  if (shotRef?.current?.capture) {
    attempts.push({
      name: 'instance',
      run: () => shotRef.current.capture(options),
    });
  }
  if (ViewShotModule?.captureRef && shotRef?.current) {
    attempts.push({
      name: 'captureRef',
      run: () => ViewShotModule.captureRef(shotRef, options),
    });
  }
  if (ViewShotModule?.captureScreen) {
    attempts.push({
      name: 'captureScreen',
      run: () => ViewShotModule.captureScreen(options),
    });
  }

  if (!attempts.length) {
    throw makeError('No capture method available.', 'CAPTURE');
  }

  let lastError = null;

  for (const attempt of attempts) {
    try {
      // First pass warms the surface; the second is the one that
      // reliably contains fully-rendered content on Android.
      await attempt.run();
      const result = await attempt.run();
      if (result && String(result).length > 100) {
        return result;
      }
      lastError = new Error(`${attempt.name} returned an empty image`);
    } catch (err) {
      lastError = new Error(`${attempt.name}: ${err?.message || 'failed'}`);
    }
  }

  throw makeError(lastError?.message || 'Capture failed.', 'CAPTURE');
};

/**
 * Shares a base64 data URL rather than a file path: react-native-share
 * writes the temp file itself in that case, which sidesteps the Android
 * FileProvider setup that otherwise blocks file:// attachments and makes
 * the sheet quietly fall back to text.
 *
 * `message` is deliberately NOT sent alongside the image — several
 * targets (WhatsApp especially) drop the attachment and send only the
 * caption when both are provided.
 */
export const shareReceiptImage = async ({ shotRef, filename, title }) => {
  if (!SHARE_MODULES_READY) {
    throw makeError(getShareDiagnostics(), 'MODULES');
  }

  const base64 = await captureBase64(shotRef);

  try {
    await RNShare.open({
      title: title || 'Receipt',
      url: `data:image/png;base64,${base64}`,
      type: 'image/png',
      filename: filename || `receipt-${Date.now()}`,
      failOnCancel: false,
    });
  } catch (err) {
    const msg = String(err?.message || '').toLowerCase();
    if (
      msg.includes('cancel') ||
      msg.includes('dismiss') ||
      msg.includes('did not share')
    ) {
      return;
    }
    throw makeError(err?.message || 'Share sheet failed.', 'SHARE');
  }
};