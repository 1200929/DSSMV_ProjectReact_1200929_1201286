import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Report } from '../models/Report';
import { StatusBadge } from './StatusBadge';

interface ReportCardProps {
  report: Report;
  onPress: () => void;
  onToggleStatus: (report: Report) => void;
  onDelete: (id: string) => void;
}

export const ReportCard = ({ report, onPress, onToggleStatus, onDelete }: ReportCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.card}>

        {/* Header do Cartão */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{report.title}</Text>
          </View>
          <StatusBadge status={report.state} />
        </View>

        {/* Área */}
        {report.area && (
          <View style={styles.areaContainer}>
            <Text style={styles.areaText}>{report.area}</Text>
          </View>
        )}


        <Text style={styles.date}>{new Date(report.timestamp).toLocaleDateString()}</Text>

        {/* Botões de Ação */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onToggleStatus(report)}
          >
            <Text style={styles.btnAction}>
              {report.state === 'RESOLVIDO' ? 'Reabrir' : 'Resolver'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(report._id || report.id || '')}
          >
            <Text style={styles.btnDelete}>Apagar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  areaContainer: { marginBottom: 8 },
  areaText: { fontSize: 12, color: '#666', fontWeight: '600' },
  weatherText: { fontSize: 12, color: '#666', marginTop: 5 },
  date: { fontSize: 10, color: '#999', marginTop: 10, textAlign: 'right' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  actionButton: { marginLeft: 20, padding: 5 },
  btnAction: { color: '#6200ee', fontWeight: 'bold' },
  btnDelete: { color: '#d32f2f', fontWeight: 'bold' }
});