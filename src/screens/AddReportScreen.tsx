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
  Platform,
  ScrollView,
  Image,
} from 'react-native';

import { WeatherData } from '../models/Weather';
import { useDispatch } from 'react-redux';
import { addReport } from '../store/slices/reportsSlice';
import Geolocation from 'react-native-geolocation-service';
import * as ImagePicker from 'react-native-image-picker';

// CONSTANTES DAS APIS
const API_KEY = '51ca6243f7msh9902b1a86759ef4p18db50jsn69065123cb41';

export const AddReportScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<any>();

  // ESTADOS DO FORMULÁRIO
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // ESTADOS FOTO
  const [photoUri, setPhotoUri] = useState<string | null>(null); // Para o preview local
  const [photoData, setPhotoData] = useState<string | null>(null); // O Base64 para enviar
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  // ESTADOS DE DADOS EXTERNOS
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);

  const [addressInfo, setAddressInfo] = useState<{ address: string; area: string } | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherData | null>(null);

  // ESTADOS DE LOADING
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // OBTER LOCALIZAÇÃO (GPS)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permissão de GPS",
            message: "Necessário para localizar a ocorrência.",
            buttonNeutral: "Depois",
            buttonNegative: "Não",
            buttonPositive: "Sim"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch { return false; }
    }
    return true;
  };

  const getLocation = useCallback(async () => {
    setLoadingLocation(true);
    // Resetar dados dependentes da localização
    setAddressInfo(null);
    setWeatherInfo(null);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert("Erro", "Sem permissão de GPS");
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
        Alert.alert("Erro GPS", error.message);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // Iniciar GPS ao abrir o ecrã
  useEffect(() => { getLocation(); }, [getLocation]);


  // OBTER MORADA (Reverse Geocoding)
  const fetchAddress = async () => {
    if (!location) return;
    setLoadingAddress(true);
    const url = `https://trueway-geocoding.p.rapidapi.com/ReverseGeocode?location=${location.latitude}%2C${location.longitude}&language=en`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'trueway-geocoding.p.rapidapi.com'
        }
      });
      const json = await response.json();

      if (json.results && json.results.length > 0) {
        setAddressInfo({
          address: json.results[0].address,
          area: json.results[0].area
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao obter morada.");
    } finally {
      setLoadingAddress(false);
    }
  };


  // OBTER METEOROLOGIA (Open Weather)
  const fetchWeather = async () => {
    if (!location) return;
    setLoadingWeather(true);

    const url = `https://open-weather13.p.rapidapi.com/latlon?latitude=${location.latitude}&longitude=${location.longitude}&lang=pt`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
        }
      });

      const json = await response.json();

      if (json.main && json.weather && json.weather.length > 0) {
        const kelvin = json.main.temp;
        const celsius = (kelvin - 273.15).toFixed(1);

        setWeatherInfo({
          temp: `${celsius}ºC`,
          description: json.weather[0].description,
          wind: `${json.wind.speed} m/s`
        });

      } else {
        Alert.alert("Aviso", "Dados de tempo indisponíveis para este local.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao obter meteorologia.");
    } finally {
      setLoadingWeather(false);
    }
  };


  // ADICIONAR FOTO
  const handleSelectPhoto = () => {
    Alert.alert(
      "Adicionar Fotografia",
      "Escolha uma opção:",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Tirar Foto", onPress: takePhoto },
        { text: "Escolher da Galeria", onPress: chooseFromLibrary }
      ]
    );
  };

  // Configurações da foto
  const pickerOptions: ImagePicker.ImageLibraryOptions & ImagePicker.CameraOptions = {
    mediaType: 'photo',
    quality: 0.7, // [0, 1]
    maxWidth: 640,
    maxHeight: 480,
    includeBase64: true,
  };

  // Callback para processar o resultado da imagem
  const processImageResult = (response: ImagePicker.ImagePickerResponse) => {
    setLoadingPhoto(true);
    if (response.didCancel) {
      console.log('Utilizador cancelou');
    } else if (response.errorMessage) {
      Alert.alert("Erro", response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];

      // Guarda a URI local para o preview
      setPhotoUri(asset.uri || null);

      // Guardar Base64
      if (asset.base64 && asset.type) {
        setPhotoData(`data:${asset.type};base64,${asset.base64}`);
      } else {
        Alert.alert("Erro", "Não foi possível obter os dados da imagem.");
        setPhotoUri(null);
        setPhotoData(null);
      }
    }
    setLoadingPhoto(false);
  };

  // Lógica para a Câmara
  const takePhoto = () => {
    ImagePicker.launchCamera(pickerOptions, processImageResult);
  };

  // Lógica para a Galeria
  const chooseFromLibrary = () => {
    ImagePicker.launchImageLibrary(pickerOptions, processImageResult);
  };

  // Remover foto selecionada
  const removePhoto = () => {
    setPhotoUri(null);
    setPhotoData(null);
  }


// GUARDAR REPORT (Atualizado com a foto)
  const handleSave = () => {
    if (!title.trim() || !description.trim() || !location) {
      Alert.alert("Erro", "Preencha Título, Descrição e aguarde o GPS.");
      return;
    }

    dispatch(addReport({
      title,
      description,
      timestamp: new Date().toISOString(),
      latitude: location.latitude,
      longitude: location.longitude,
      address: addressInfo?.address,
      area: addressInfo?.area,
      weather: weatherInfo || undefined,

      // ENVIAR DADOS DA FOTO
      photoBase64: photoData || undefined
    })).unwrap()
      .then(() => {
        // Limpar formulário
        setTitle('');
        setDescription('');
        setAddressInfo(null);
        setWeatherInfo(null);

        // LIMPAR FOTO
        removePhoto();

        Keyboard.dismiss();

        Alert.alert(
          "Sucesso",
          "Ocorrência enviada com sucesso!",
          [
            {
              text: "OK",
              onPress: () => {
                getLocation();
                navigation.goBack();
              }
            }
          ]
        );
      })
      .catch((err: any) => Alert.alert("Erro", "Falha ao enviar: " + err.message));
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">


      {/* INPUTS */}
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Buraco na estrada"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descreva a ocorrência..."
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />


      {/* BOX GPS */}
      <TouchableOpacity style={styles.gpsContainer} onPress={getLocation}>
        {loadingLocation ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#6200ee" style={{marginRight:10}}/>
            <Text style={styles.gpsText}>A localizar...</Text>
          </View>
        ) : location ? (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.gpsLabel}>Localização Atual</Text>
            <Text style={styles.gpsCoords}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
          </View>
        ) : (
          <Text style={styles.gpsText}>Toque para ativar GPS</Text>
        )}
      </TouchableOpacity>

      {/* SECÇÃO DA FOTOGRAFIA */}
      <Text style={styles.label}>Fotografia</Text>
      <View style={styles.photoSection}>
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity style={styles.btnRemovePhoto} onPress={removePhoto}>
              <Text style={styles.btnRemovePhotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoPlaceholder} onPress={handleSelectPhoto} disabled={loadingPhoto}>
            {loadingPhoto ? (
              <ActivityIndicator color="#6200ee" />
            ) : (
              <Text style={styles.photoPlaceholderText}>Adicionar Fotografia</Text>
            )}
          </TouchableOpacity>
        )}
      </View>


      {/* BOXES DE INFO EXTRA (LADO A LADO) */}
      {location && !loadingLocation && (
        <View style={styles.extrasRow}>

          {/* Esquerda: Morada */}
          <View style={styles.extraBox}>
            {loadingAddress ? <ActivityIndicator color="#6200ee"/> :
              addressInfo ? (
                <View>
                  <Text style={styles.infoLabel}>Morada:</Text>
                  <Text style={styles.infoValue} numberOfLines={3}>{addressInfo.address}</Text>
                  <Text style={styles.areaBadge}>{addressInfo.area}</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={fetchAddress} style={styles.btnSmall}>
                  <Text style={styles.btnSmallText}>Obter Morada</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Direita: Meteorologia */}
          <View style={styles.extraBox}>
            {loadingWeather ? <ActivityIndicator color="#6200ee"/> :
              weatherInfo ? (
                <View>
                  <Text style={styles.infoLabel}>Meteorologia:</Text>
                  <Text style={styles.weatherTemp}>{weatherInfo.temp}</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{weatherInfo.description}</Text>
                  <Text style={styles.infoValue}>💨 {weatherInfo.wind}</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={fetchWeather} style={styles.btnSmall}>
                  <Text style={styles.btnSmallText}>Obter Tempo</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      )}



      {/* BOTÃO GUARDAR */}
      <TouchableOpacity
        style={[styles.btn, (!location) && styles.btnDisabled]}
        onPress={handleSave}
        disabled={!location}
      >
        <Text style={styles.btnText}>Submeter Report</Text>
      </TouchableOpacity>

      <View style={{height: 50}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  // GPS
  gpsContainer: { padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#e9ecef' },
  gpsLabel: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginBottom: 2 },
  gpsCoords: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  gpsText: { color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center' },

  // --- ESTILOS FOTO (NOVO) ---
  photoSection: { marginBottom: 20 },
  photoPlaceholder: { height: 150, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  photoPlaceholderText: { color: '#6200ee', fontWeight: 'bold', fontSize: 16 },

  photoContainer: { position: 'relative' },
  photoPreview: { height: 200, width: '100%', borderRadius: 10, backgroundColor: '#000' },

  btnRemovePhoto: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnRemovePhotoText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: -2 },

  // Extras
  extrasRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  extraBox: { width: '48%', backgroundColor: '#eef2ff', padding: 12, borderRadius: 10, minHeight: 100, justifyContent: 'center', borderWidth: 1, borderColor: '#e0e7ff' },
  infoLabel: { fontSize: 11, fontWeight: 'bold', color: '#6200ee', marginBottom: 5, textTransform: 'uppercase' },
  infoValue: { fontSize: 13, color: '#444', marginBottom: 2 },
  weatherTemp: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  areaBadge: { fontSize: 10, color: '#fff', backgroundColor: '#6200ee', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 5 },
  btnSmall: { backgroundColor: '#fff', padding: 10, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#c7c7c7', width: '100%' },
  btnSmallText: { color: '#6200ee', fontWeight: 'bold', fontSize: 12 },

  // Inputs
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#fff' },
  textArea: { height: 100 },
  btn: { backgroundColor: '#6200ee', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 2 },
  btnDisabled: { backgroundColor: '#adb5bd', elevation: 0 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});