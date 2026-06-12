import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

export function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tag}>
      <View style={styles.tagInner}>
        <Text style={styles.tagLabel}>{label}</Text>
        <Text style={styles.tagValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    width: '49%',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  tagInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagLabel: { fontSize: 10, color: colors.mutedForeground },
  tagValue: { fontSize: 10, fontWeight: '700', color: colors.foreground },
});
