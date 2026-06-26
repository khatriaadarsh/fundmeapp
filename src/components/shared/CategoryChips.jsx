// // src/components/shared/CategoryChips.jsx
// import React, { memo } from 'react';
// import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { P, sp } from '../../theme/theme';
// import { CATEGORIES } from '../../constants/mockData'; // Make sure path is correct

// const CategoryChips = memo(({ active, onChange, showIcons = false }) => (
//   <ScrollView
//     horizontal
//     showsHorizontalScrollIndicator={false}
//     contentContainerStyle={styles.list}
//   >
//     {CATEGORIES.map(cat => {
//       const isActive = active === cat.id;
//       return (
//         <TouchableOpacity
//           key={cat.id}
//           style={[styles.chip, isActive && styles.chipActive]}
//           onPress={() => onChange(cat.id)}
//           activeOpacity={0.8}
//         >
//           {/* ✅ DYNAMIC ICON: Only render if showIcons is true AND icon exists */}
//           {showIcons && cat.icon && (
//             <Text style={styles.icon}>{cat.icon}</Text>
//           )}
//           <Text style={[styles.label, isActive && styles.labelActive]}>
//             {cat.label}
//           </Text>
//         </TouchableOpacity>
//       );
//     })}
//   </ScrollView>
// ));

// const styles = StyleSheet.create({
//   list: { 
//     paddingHorizontal: sp(16), 
//     paddingVertical: sp(8), // Slight vertical padding prevents sticking to borders
//     gap: sp(8) 
//   },
//   chip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: sp(14),
//     paddingVertical: sp(7),
//     borderRadius: sp(20),
//     borderWidth: 1.5,
//     borderColor: P.border,
//     backgroundColor: P.white,
//     marginRight: sp(8),
//     gap: sp(5),
//   },
//   chipActive: {
//     backgroundColor: P.darkOcean,
//     borderColor: P.darkOcean,
//   },
//   icon: { fontSize: sp(13) },
//   label: { fontSize: sp(13), fontWeight: '600', color: P.gray },
//   labelActive: { color: P.white },
// });

// export default CategoryChips;


// src/components/shared/CategoryChips.jsx

import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { P, sp } from '../../theme/theme';

const DEFAULT_CATEGORIES = [
  {
    id: 'all',
    name: 'All',
    label: 'All',
  },
];

const CategoryChips = memo(({
  active,
  onChange,
  categories = DEFAULT_CATEGORIES,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
    >
      {categories.map((cat) => {
        const id = cat.id || cat.name;
        const label = cat.label || cat.name;
        const isActive = active === id;

        return (
          <TouchableOpacity
            key={id}
            activeOpacity={0.85}
            onPress={() => onChange?.(id)}
            style={[styles.chip, isActive && styles.activeChip]}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: sp(16),
    paddingBottom: sp(12),
    gap: sp(8),
  },
  chip: {
    paddingHorizontal: sp(14),
    paddingVertical: sp(8),
    borderRadius: sp(18),
    backgroundColor: P.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: P.border,
  },
  activeChip: {
    backgroundColor: P.teal,
    borderColor: P.teal,
  },
  text: {
    color: P.gray,
    fontSize: sp(12),
    fontWeight: '700',
  },
  activeText: {
    color: P.white,
  },
});

export default CategoryChips;