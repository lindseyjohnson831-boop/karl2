import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function KarlScore({ score }: { score: number }) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>KARL SCORE</Text>
        <Text style={styles.value}>{score}<Text style={styles.outOf}>/100</Text></Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${score}%` as any }]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.hint}>clear</Text>
        <Text style={styles.hint}>full Karl</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  label: { fontSize: 10, letterSpacing: 1, color: colors.ink, opacity: 0.6, fontFamily: 'DM Mono' },
  value: { fontSize: 16, fontWeight: '700', color: colors.accent, fontFamily: 'Patrick Hand' },
  outOf: { fontSize: 10, opacity: 0.5 },
  track: { height: 8, borderRadius: 999, backgroundColor: `${colors.ink}22`, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.accent },
  hint: { fontSize: 9, color: colors.ink, opacity: 0.45, fontFamily: 'DM Mono', marginTop: 2 },
});
