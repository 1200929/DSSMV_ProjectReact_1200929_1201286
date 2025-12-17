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
import Geolocation from 'react-native-geolocation-service';

export const AddReportScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);


  const dispatch = useDispatch<any>();

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permissão de GPS Necessária",
            message: "Esta aplicação precisa de acesso ao GPS.",
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

  const getLocation = useCallback(async () => {
    setLoadingLocation(true);
    setGpsError(null);

    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setGpsError('Permissão de GPS negada.');
      setLoadingLocation(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        setGpsError(`Erro GPS: ${error.code}`);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Erro", "Preencha o título e a descrição.");
      return;
    }

    if (!location) {
      Alert.alert("A aguardar GPS", "É necessário aguardar pela localização.");
      return;
    }

    dispatch(addReport({
      id: '',
      title,
      description,
      timestamp: new Date().toISOString(),
      latitude: location.latitude,
      longitude: location.longitude
    })).unwrap()
      .then(() => {
        Alert.alert("Sucesso", "Ocorrência guardada na Cloud!");
        setTitle('');
        setDescription('');
        Keyboard.dismiss();
      })
      .catch((error: any) => {
        Alert.alert("Erro", "Falha ao enviar: " + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Nova Ocorrência</Text>

      <TouchableOpacity style={styles.gpsContainer} onPress={getLocation} activeOpacity={0.7}>
        {loadingLocation ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#6200ee" style={{marginRight: 10}} />
            <Text style={styles.gpsText}>A procurar sinal GPS...</Text>
          </View>
        ) : gpsError ? (
          <Text style={[styles.gpsText, styles.errorText]}>{gpsError}</Text>
        ) : location ? (
          <View>
            <Text style={styles.gpsLabel}>Localização Detetada:</Text>
            <Text style={[styles.gpsText, styles.successText]}>
              Lat: {location.latitude.toFixed(5)}, Long: {location.longitude.toFixed(5)}
            </Text>
          </View>
        ) : (
          <Text style={styles.gpsText}>Toque para iniciar GPS</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} placeholder="Ex: Buraco na via" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Detalhes..." value={description} onChangeText={setDescription} multiline textAlignVertical="top" />

      <TouchableOpacity
        style={[styles.btn, (!location) && styles.btnDisabled]}
        onPress={handleSave}
        disabled={!location}
      >
        <Text style={styles.btnText}>Guardar na Cloud</Text>
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