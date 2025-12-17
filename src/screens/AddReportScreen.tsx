import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  ActivityIndicator,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addReport } from '../store/slices/reportsSlice';
// Biblioteca GPS
import Geolocation from 'react-native-geolocation-service';

export const AddReportScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Estados do GPS
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const dispatch = useDispatch();

  // Função Auxiliar: Pedir Permissão ao Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permissão de GPS Necessária",
            message: "Esta aplicação precisa de acesso ao GPS para registar a localização da ocorrência.",
            buttonNeutral: "Perguntar Depois",
            buttonNegative: "Cancelar",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Função Principal: Obter a Localização
  const getLocation = useCallback(async () => {
    setLoadingLocation(true);
    setGpsError(null);

    // Pedir permissão
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setGpsError('Permissão de GPS negada.');
      setLoadingLocation(false);
      return;
    }

    // Obter coordenadas
    Geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS Sucesso:", position);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.log("GPS Erro:", error);
        setGpsError(`Erro ao obter GPS (Cód: ${error.code})`);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // Ciclo de Vida: Ao abrir o ecrã
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Função de Guardar
  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos em falta", "Por favor preencha o título e a descrição.");
      return;
    }

    if (!location) {
      Alert.alert("A aguardar GPS", "É necessário aguardar pela localização GPS.");
      return;
    }

    dispatch(addReport({
      id: Date.now().toString(),
      title,
      description,
      timestamp: new Date().toISOString(),
      latitude: location.latitude,
      longitude: location.longitude
    }));

    Alert.alert("Sucesso", "Ocorrência registada!");
    setTitle('');
    setDescription('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Nova Ocorrência</Text>

      {/* --- Painel de Status do GPS --- */}
      <TouchableOpacity style={styles.gpsContainer} onPress={getLocation} activeOpacity={0.7}>
        {loadingLocation ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#6200ee" style={{marginRight: 10}} />
            <Text style={styles.gpsText}>A procurar sinal GPS...</Text>
          </View>
        ) : gpsError ? (
          <Text style={[styles.gpsText, styles.errorText]}>⚠️ {gpsError}{'\n'}(Toque aqui para tentar novamente)</Text>
        ) : location ? (
          <View>
            <Text style={styles.gpsLabel}>Localização Detetada:</Text>
            <Text style={[styles.gpsText, styles.successText]}>
              Lat: {location.latitude.toFixed(5)}{'\n'}
              Long: {location.longitude.toFixed(5)}
            </Text>
          </View>
        ) : (
          <Text style={styles.gpsText}>Toque para iniciar GPS</Text>
        )}
      </TouchableOpacity>

      {/* --- Formulário --- */}
      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} placeholder="Ex: Buraco na via" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Detalhes da ocorrência..." value={description} onChangeText={setDescription} multiline textAlignVertical="top" />

      <TouchableOpacity
        style={[styles.btn, (!location) && styles.btnDisabled]}
        onPress={handleSave}
        disabled={!location}
      >
        <Text style={styles.btnText}>Guardar Relatório</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 20 },
  gpsContainer: { padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef' },
  row: { flexDirection: 'row', alignItems: 'center' },
  gpsText: { fontSize: 14, color: '#555', textAlign: 'center' },
  gpsLabel: { fontSize: 12, color: '#777', marginBottom: 4, fontWeight: 'bold' },
  successText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#c62828' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#fff' },
  textArea: { height: 100 },
  btn: { backgroundColor: '#6200ee', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 2 },
  btnDisabled: { backgroundColor: '#adb5bd', elevation: 0 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});