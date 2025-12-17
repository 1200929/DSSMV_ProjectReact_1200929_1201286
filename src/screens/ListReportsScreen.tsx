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

export const ListReportsScreen = () => {
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

  if (status === 'loading' && items.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{marginTop: 10}}>A carregar ocorrências...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Ocorrências</Text>

      {status === 'failed' && (
        <Text style={styles.errorText}>Erro: {error}</Text>
      )}

      <FlatList
        data={items}
        // Usamos index como fallback
        keyExtractor={(item, index) => item._id || item.id || index.toString()}

        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
        }

        ListEmptyComponent={
          <Text style={styles.emptyText}>Sem ocorrências registadas.</Text>
        }

        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>

              {/* Badge de Estado (Cor dinâmica) */}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.state || 'EM RESOLUÇÃO') }]}>
                <Text style={styles.badgeText}>{item.state || 'EM RESOLUÇÃO'}</Text>
              </View>
            </View>

            {/* Badge da Área (Se existir) */}
            {item.area ? (
              <View style={styles.areaContainer}>
                <Text style={styles.areaText}>{item.area}</Text>
              </View>
            ) : null}


            <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>

            {/* BARRA DE AÇÕES (Botões) */}
            <View style={styles.actionsRow}>
              {/* Botão de Alternar Estado */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleToggleStatus(item)}
              >
                <Text style={{color: '#6200ee', fontWeight: 'bold'}}>
                  {item.state === 'RESOLVIDO' ? 'Reabrir' : 'Resolver'}
                </Text>
              </TouchableOpacity>

              {/* Botão de Apagar */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item._id || item.id)}
              >
                <Text style={styles.delete}>Apagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

  // Estilos das Badges
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  areaContainer: { marginBottom: 8 },
  areaText: { fontSize: 12, color: '#666', fontWeight: '600' },

  desc: { fontSize: 14, color: '#444', marginBottom: 8, lineHeight: 20 },
  address: { fontSize: 12, color: '#666', marginBottom: 5, fontStyle: 'italic' },
  date: { fontSize: 10, color: '#999', marginBottom: 10, textAlign: 'right' },

  // Estilos dos Botões
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  actionButton: { marginLeft: 20, padding: 5 },
  delete: { color: '#d32f2f', fontWeight: 'bold' }
});