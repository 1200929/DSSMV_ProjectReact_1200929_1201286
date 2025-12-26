import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { fetchReports, deleteReport, updateReport } from '../store/slices/reportsSlice';
import { Report } from '../models/Report';
import { ReportCard } from '../components/ReportCard';

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

  // ALTERAR ESTADO
  const handleToggleStatus = (item: any) => {
    const newState = item.state === 'RESOLVED' ? 'UNDER RESOLUTION' : 'RESOLVED';
    const idToUpdate = item._id || item.id;

    if (idToUpdate) {
      dispatch(updateReport({ id: idToUpdate, updates: { state: newState } }));
    }
  };

  // APAGAR
  const handleDelete = (id?: string) => {
    if (!id) {
      Alert.alert("Error", "Delete report not available.");
      return;
    }

    Alert.alert(
      "Confirm",
      "Sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteReport(id))
        }
      ]
    );
  };

  // RENDER ITEM
  const renderItem = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onPress={() => navigation.navigate('ReportDetails', { report: item })}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  );

  // LOADING SCREEN
  if (status === 'loading' && items.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{marginTop: 10}}>Loading reports...</Text>
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
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reports available.</Text>
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
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});