import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { fetchReports, deleteReport, updateReport } from '../store/slices/reportsSlice';
import { Report } from '../models/Report';

export const ListReportsScreen = ({ navigation }: any) => {
  const { items, status, error } = useSelector((state: RootState) => state.reports);
  const dispatch = useDispatch<any>();
  const [refreshing, setRefreshing] = useState(false);

  // CARREGAR DADOS AO ABRIR O ECRÃ
  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // FUNÇÃO PARA "PULL TO REFRESH"
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchReports());
    setRefreshing(false);
  }, [dispatch]);

  // LÓGICA DE CORES (Vermelho vs Verde)
  const getStatusColor = (state: string) => {
    return state === 'RESOLVIDO' ? '#2e7d32' : '#d32f2f'; // Verde : Vermelho
  };

  // ALTERAR ESTADO (Update)
  const handleToggleStatus = (item: any) => {
    const newState = item.state === 'RESOLVIDO' ? 'EM RESOLUÇÃO' : 'RESOLVIDO';
    const idToUpdate = item._id || item.id;

    if (idToUpdate) {
      dispatch(updateReport({ id: idToUpdate, updates: { state: newState } }));
    }
  };

  // APAGAR (Delete)
  const handleDelete = (id?: string) => {
    if (!id) {
      Alert.alert("Erro", "Item sem ID, não é possível apagar.");
      return;
    }

    Alert.alert(
      "Confirmar",
      "Tens a certeza que queres apagar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => dispatch(deleteReport(id))
        }
      ]
    );
  };

  // DEFINIÇÃO DO RENDER ITEM
  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ReportDetails', { report: item })} // Navegação
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>

          {/* Badge de Estado */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.state || 'EM RESOLUÇÃO') }]}>
            <Text style={styles.badgeText}>{item.state || 'EM RESOLUÇÃO'}</Text>
          </View>
        </View>

        {/* Badge da Área */}
        {item.area ? (
          <View style={styles.areaContainer}>
            <Text style={styles.areaText}>{item.area}</Text>
          </View>
        ) : null}


        <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>

        {/* Botões de Ação (Resolver / Apagar) */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(item)}
          >
            <Text style={{color: '#6200ee', fontWeight: 'bold'}}>
              {item.state === 'RESOLVIDO' ? 'Reabrir' : 'Resolver'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item._id || item.id)}
          >
            <Text style={styles.delete}>Apagar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // LOADING SCREEN
  if (status === 'loading' && items.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{marginTop: 10}}>A carregar ocorrências...</Text>
      </View>
    );
  }

  // RENDER FINAL
  return (
    <View style={styles.container}>

      {status === 'failed' && (
        <Text style={styles.errorText}>Erro: {error}</Text>
      )}

      <FlatList
        data={items}
        // Fallback de ID
        keyExtractor={(item, index) => item._id || item.id || index.toString()}

        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
        }

        ListEmptyComponent={
          <Text style={styles.emptyText}>Sem ocorrências registadas.</Text>
        }

        renderItem={renderItem}

        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 10, color: '#333' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },

  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },

  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  areaContainer: { marginBottom: 8 },
  areaText: { fontSize: 12, color: '#666', fontWeight: '600' },

  date: { fontSize: 10, color: '#999', marginTop: 10, textAlign: 'right' },

  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  actionButton: { marginLeft: 20, padding: 5 },
  delete: { color: '#d32f2f', fontWeight: 'bold' }
});