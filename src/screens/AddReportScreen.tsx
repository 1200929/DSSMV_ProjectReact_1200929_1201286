import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';

import { WeatherData } from '../models/Weather';
import { useDispatch } from 'react-redux';
import { addReport } from '../store/slices/reportsSlice';
import Geolocation from 'react-native-geolocation-service';
import * as ImagePicker from 'react-native-image-picker';

// SERVIÇOS
import { getWeatherByCoords } from '../services/weatherService';
import { getAddressByCoords } from '../services/locationService';
import { analyzeImage } from '../services/aiService';

// COMPONENTES
import { InfoWidget } from '../components/InfoWidget';
import { PhotoWidget } from '../components/PhotoWidget';

export const AddReportScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<any>();

  // DADOS FOTO
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  // DADOS EXTERNOS
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [addressInfo, setAddressInfo] = useState<{ address: string; area: string } | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherData | null>(null);

  // LOADING STATES
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Estado para saber se estamos a submeter (IA + DB)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- GPS ---
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "GPS Permission",
            message: "Needed for the app to locate the report.",
            buttonNeutral: "Later",
            buttonNegative: "No",
            buttonPositive: "Yes"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch { return false; }
    }
    return true;
  };

  const getLocation = useCallback(async () => {
    setLoadingLocation(true);
    setAddressInfo(null);
    setWeatherInfo(null);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) { Alert.alert("Error", "No GPS Permission"); setLoadingLocation(false); return; }

    Geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoadingLocation(false);
      },
      (err) => { Alert.alert("GPS Error", err.message); setLoadingLocation(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  // MORADA
  const fetchAddress = async () => {
    if (!location) return;
    setLoadingAddress(true);
    try {
      const data = await getAddressByCoords(location.latitude, location.longitude);
      setAddressInfo(data);
    } catch {
      Alert.alert("Error", "Failed to get address.");
    } finally {
      setLoadingAddress(false);
    }
  };

  // METEO
  const fetchWeather = async () => {
    if (!location) return;
    setLoadingWeather(true);
    try {
      const data = await getWeatherByCoords(location.latitude, location.longitude);
      setWeatherInfo(data);
    } catch {
      Alert.alert("Error", "Failed to get weather.");
    } finally {
      setLoadingWeather(false);
    }
  };

  // FOTO
  const pickerOptions: ImagePicker.CameraOptions = {
    mediaType: 'photo',
    quality: 0.6,
    maxWidth: 640,
    maxHeight: 480,
    includeBase64: true,
  };

  const processImage = (res: ImagePicker.ImagePickerResponse) => {
    setLoadingPhoto(true);
    if (res.assets && res.assets.length > 0) {
      const asset = res.assets[0];
      setPhotoUri(asset.uri || null);
      if (asset.base64 && asset.type) {
        setPhotoData(`data:${asset.type};base64,${asset.base64}`);
      }
    }
    setLoadingPhoto(false);
  };

  const handleSelectPhoto = () => {
    Alert.alert("Add Photo", "Choose an option:", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: () => ImagePicker.launchCamera(pickerOptions, processImage) },
      { text: "Gallery", onPress: () => ImagePicker.launchImageLibrary(pickerOptions, processImage) }
    ]);
  };

  // SUBMETER
  const handleSave = async () => {
    if (!location) { Alert.alert("Warning", "Wait for GPS location."); return; }
    if (!photoData) { Alert.alert("Warning", "Photo is required."); return; }

    setIsSubmitting(true);

    try {
      // A) CHAMADA À IA
      let aiResult = {
        title: "Incident Report",
        description: "Analysis unavailable",
        category: "General"
      };

      try {
        aiResult = await analyzeImage(photoData);
      } catch (aiError) {
        console.log("AI failed, using defaults", aiError);
      }

      // B) ENVIAR PARA BASE DE DADOS (Redux)
      await dispatch(addReport({
        title: aiResult.title,
        description: aiResult.description,
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: addressInfo?.address,
        area: addressInfo?.area,
        weather: weatherInfo || undefined,
        photoBase64: photoData
      })).unwrap();

      // C) LIMPEZA
      setPhotoUri(null);
      setPhotoData(null);
      setAddressInfo(null);
      setWeatherInfo(null);

      Alert.alert("Success", "Report registered!", [
        { text: "OK", onPress: () => { getLocation(); navigation.goBack(); } }
      ]);

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* GPS */}
      <TouchableOpacity style={styles.gpsContainer} onPress={getLocation}>
        {loadingLocation ? (
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <ActivityIndicator size="small" color="#6200ee" style={{marginRight:10}}/>
            <Text>Tracking location...</Text>
          </View>
        ) : location ? (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.gpsLabel}>Location</Text>
            <Text style={styles.gpsCoords}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
          </View>
        ) : (
          <Text>Touch to activate GPS</Text>
        )}
      </TouchableOpacity>

      {/* FOTO */}
      <PhotoWidget
        photoUri={photoUri}
        onTakePhoto={handleSelectPhoto}
        onRemovePhoto={() => { setPhotoUri(null); setPhotoData(null); }}
        isLoadingPhoto={loadingPhoto}
      />

      {/* WIDGETS EXTRAS */}
      {location && !loadingLocation && (
        <View style={styles.extrasRow}>
          <InfoWidget
            label="ADDRESS"
            value={addressInfo?.address || null}
            subValue={addressInfo?.area}
            buttonText="Get Address"
            isLoading={loadingAddress}
            onPress={fetchAddress}
          />
          <InfoWidget
            label="WEATHER"
            value={weatherInfo?.temp || null}
            subValue={weatherInfo?.description}
            extra={weatherInfo ? weatherInfo.wind : undefined}
            buttonText="Get Weather"
            isLoading={loadingWeather}
            onPress={fetchWeather}
          />
        </View>
      )}

      {/* BOTÃO SUBMETER */}
      <View style={{marginTop: 20}}>

        <TouchableOpacity
          style={[styles.btn, (!location || !photoData || isSubmitting) && styles.btnDisabled]}
          onPress={handleSave}
          disabled={!location || !photoData || isSubmitting}
        >
          {isSubmitting ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActivityIndicator color="#fff" style={{marginRight: 10}}/>
              <Text style={styles.btnText}>Analyzing & Saving...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{height: 50}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  gpsContainer: { padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#e9ecef' },
  gpsLabel: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginBottom: 2 },
  gpsCoords: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  extrasRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },

  infoText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },

  btn: { backgroundColor: '#6200ee', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 5, elevation: 3 },
  btnDisabled: { backgroundColor: '#adb5bd', elevation: 0 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});