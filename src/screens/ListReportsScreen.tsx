import React, { useEffect, useCallback, useState, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback
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

  // ESTADOS DOS FILTROS
  const [filterArea, setFilterArea] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // ESTADOS DO Dropdown
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<'AREA' | 'CATEGORY' | null>(null);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddReport')}
          style={{ padding: 5 }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff700', backgroundColor: '#e3e2d3',
          padding: 5, borderRadius: 10}}>+ NEW</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


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

  // LÓGICA DE DADOS

  // Obter opções para os Dropdowns
  const uniqueAreas = useMemo(() => {
    const areas = items.map(i => i.area).filter((a): a is string => !!a);
    return ['All', ...new Set(areas)];
  }, [items]);

  const uniqueCategories = useMemo(() => {
    const cats = items.map(i => (i as any).category).filter((c): c is string => !!c);
    return ['All', ...new Set(cats)];
  }, [items]);

  // Processar a Lista
  const processedItems = useMemo(() => {
    let result = [...items];

    // Filtro de Área
    if (filterArea !== 'All') {
      result = result.filter(i => i.area === filterArea);
    }

    // Filtro de Categoria
    if (filterCategory !== 'All') {
      result = result.filter(i => (i as any).category === filterCategory);
    }

    // Ordenação por Data
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, filterArea, filterCategory, sortOrder]);


  // AÇÕES
  const handleToggleStatus = (item: any) => {
    const newState = item.state === 'RESOLVED' ? 'UNDER RESOLUTION' : 'RESOLVED';
    const idToUpdate = item._id || item.id;
    if (idToUpdate) dispatch(updateReport({ id: idToUpdate, updates: { state: newState } }));
  };

  const handleDelete = (id?: string) => {
    if (!id) { Alert.alert("Error", "Delete unavailable."); return; }
    Alert.alert("Confirm", "Delete this report?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteReport(id)) }
    ]);
  };

  // FUNÇÕES DO DROPDOWN
  const openFilterModal = (type: 'AREA' | 'CATEGORY') => {
    setActiveFilterType(type);
    setModalVisible(true);
  };

  const handleSelectOption = (option: string) => {
    if (activeFilterType === 'AREA') setFilterArea(option);
    if (activeFilterType === 'CATEGORY') setFilterCategory(option);
    setModalVisible(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

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
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text style={{marginTop: 10}}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* BARRA DE FILTROS */}
      <View style={styles.filterBar}>

        {/* Botão LOCATION */}
        <TouchableOpacity style={styles.filterBtn} onPress={() => openFilterModal('AREA')}>
          <Text style={styles.filterLabel}>LOCATION</Text>
          <Text style={styles.filterValue} numberOfLines={1}>{filterArea}</Text>
          <Text style={styles.filterIcon} />
        </TouchableOpacity>

        {/* Botão CATEGORY */}
        <TouchableOpacity style={styles.filterBtn} onPress={() => openFilterModal('CATEGORY')}>
          <Text style={styles.filterLabel}>CATEGORY</Text>
          <Text style={styles.filterValue} numberOfLines={1}>{filterCategory}</Text>
          <Text style={styles.filterIcon} />
        </TouchableOpacity>

        {/* Botão DATE (Toggle) */}
        <TouchableOpacity style={[styles.filterBtn, styles.dateBtn]} onPress={toggleSortOrder}>
          <Text style={styles.filterLabel}>DATE</Text>
          <Text style={styles.sortIcon}>{sortOrder === 'desc' ? 'New' : 'Old'}</Text>
        </TouchableOpacity>

      </View>

      {/* LISTA */}
      {status === 'failed' && <Text style={styles.errorText}>Error: {error}</Text>}

      <FlatList
        data={processedItems}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff8c00']} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No reports found.{filterArea !== 'All' ? '\nTry clearing filters.' : ''}
          </Text>
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* MODAL (DROPDOWN) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {activeFilterType === 'AREA' ? 'Location' : 'Category'}
              </Text>

              <FlatList
                data={activeFilterType === 'AREA' ? uniqueAreas : uniqueCategories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectOption(item)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      (activeFilterType === 'AREA' ? filterArea : filterCategory) === item && styles.modalItemActive
                    ]}>
                      {item}
                    </Text>

                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* BOTÃO FLUTUANTE "MAP" */}
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          style={styles.mapPill}
          onPress={() => navigation.navigate('MapScreen')}
          activeOpacity={0.8}
        >
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Map</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

// @ts-ignore
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ff0008', textAlign: 'center', marginBottom: 10 },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
  },

  // BARRA DE FILTROS
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  filterBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBtn: {
    flex: 0.6,
    backgroundColor: '#f8f9fa',
    borderColor: '#ddd',
  },
  filterLabel: {
    fontSize: 9,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  filterValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff8c00',
  },
  filterIcon: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  sortIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff8c00',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '50%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalItemText: {
    fontSize: 16,
    color: '#555',
  },
  modalItemActive: {
    color: '#ff8c00',
    fontWeight: 'bold',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999, // Garante que fica por cima da lista
  },
  mapPill: {
    flexDirection: 'row',
    backgroundColor: '#ff8c00',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
  },
});