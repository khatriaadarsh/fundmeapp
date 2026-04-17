// src/components/explore/SearchBarHeader.jsx
import React, { useState, useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';

const SearchBarHeader = memo(({ query, onQueryChange, onCancel, onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  const mountAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(sp(16))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [mountAnim, slideAnim]);

  const handleCancelPress = () => {
    onCancel();
    inputRef.current?.blur();
  };

  return (
    <Animated.View style={[styles.animatedWrapper, { opacity: mountAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.searchRow}>
        <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
          <Icons name="search" size={sp(16)} color={isFocused ? P.teal : P.light} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search campaigns..."
            placeholderTextColor={P.light}
            value={query}
            onChangeText={onQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={() => onSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => onQueryChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.clearBtn}>
              <Icons name="x-circle" size={sp(16)} color={P.light} />
            </TouchableOpacity>
          )}
        </View>

        {(isFocused || query.length > 0) && (
          <TouchableOpacity onPress={handleCancelPress} activeOpacity={0.7} style={styles.cancelBtn}>
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  animatedWrapper: { backgroundColor: P.white },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sp(14),
    paddingTop: sp(10),
    paddingBottom: sp(10),
    gap: sp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.bg,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: P.bg,
    paddingHorizontal: sp(10),
    height: sp(42),
  },
  inputWrapFocused: { borderColor: P.teal, backgroundColor: P.white },
  searchIcon: { marginRight: sp(7) },
  input: { flex: 1, fontSize: sp(14), color: P.dark, paddingVertical: 0 },
  clearBtn: { padding: sp(2) },
  cancelBtn: { paddingVertical: sp(6) },
  cancelTxt: { fontSize: sp(14), fontWeight: '600', color: P.teal },
});

export default SearchBarHeader;