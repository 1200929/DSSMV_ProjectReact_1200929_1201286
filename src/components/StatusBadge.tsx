import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const isResolved = status === 'RESOLVIDO';

  return (
    <View style={[styles.badge, isResolved ? styles.green : styles.red]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginLeft: 8 },
  green: { backgroundColor: '#2e7d32' },
  red: { backgroundColor: '#d32f2f' },
  text: { fontSize: 10, color: '#fff', fontWeight: 'bold' }
});