import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface InfoWidgetProps {
  label: string;           // Ex: "METEOROLOGIA"
  value: string | null;    // Ex: "15ºC" ou null se vazio
  subValue?: string;       // Ex: "Céu limpo"
  extra?: string;          // Ex: "Vento: 3m/s"
  buttonText: string;      // Ex: "Obter Tempo"
  isLoading: boolean;
  onPress: () => void;
}

export const InfoWidget = ({
                             label, value, subValue, extra, buttonText, isLoading, onPress
                           }: InfoWidgetProps) => {
  return (
    <View style={styles.box}>
      {isLoading ? (
        <ActivityIndicator color="#ff8c00" />
      ) : value ? (
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.mainValue}>{value}</Text>
          {subValue && <Text style={styles.subText} numberOfLines={2}>{subValue}</Text>}
          {extra && <Text style={styles.badge}>{extra}</Text>}
        </View>
      ) : (
        <TouchableOpacity onPress={onPress} style={styles.btnSmall}>
          <Text style={styles.btnText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '48%',
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 10,
    minHeight: 110,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff'
  },
  label: { fontSize: 10, fontWeight: 'bold', color: '#ff8c00', marginBottom: 5, textTransform: 'uppercase' },
  mainValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  subText: { fontSize: 12, color: '#444', marginBottom: 2 },
  badge: { fontSize: 10, color: '#444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 5 },
  btnSmall: { backgroundColor: '#fff', padding: 10, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#c7c7c7', width: '100%' },
  btnText: { color: '#ff8c00', fontWeight: 'bold', fontSize: 12 },
});