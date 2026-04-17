// src/components/ProgressBar.jsx
// ─────────────────────────────────────────────────────────────
//  Reusable ProgressBar
//  Props:
//    pct   — number 0–100
//    color — hex string (optional, defaults to P.teal)
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { P } from '../theme/theme';

const ProgressBar = memo(({ pct, color }) => {
  // ── FIX 1: Parse pct to number — if it arrives as a string
  //    ("65") the comparison operators still work, BUT
  //    template literal `${pct}%` would be fine either way.
  //    Explicit conversion removes any ambiguity.
  const safePct = Math.min(100, Math.max(0, Number(pct) || 0));

  return (
    <View style={pbSt.bg}>
      <View
        style={[
          pbSt.fill,
          {
            width: `${safePct}%`,
            backgroundColor: color || P.teal,
          },
        ]}
      />
    </View>
  );
});

const pbSt = StyleSheet.create({
  bg: {
    height: 4,
    backgroundColor: P.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});

export default ProgressBar;