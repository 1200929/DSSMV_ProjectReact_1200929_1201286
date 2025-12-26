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

// COMPONENTES
import { InfoWidget } from '../components/InfoWidget';
import { PhotoWidget } from '../components/PhotoWidget';

const API_KEY = '51ca6243f7msh9902b1a86759ef4p18db50jsn69065123cb41';

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

  // GPS
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          { title: "GPS", message: "Nedded for the app.", buttonNeutral: "After", buttonNegative: "No", buttonPositive: "Yes" }
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
    if (!hasPermission) { Alert.alert("Error", "NO GPS"); setLoadingLocation(false); return; }

    Geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoadingLocation(false);
      },
      (err) => { Alert.alert("Error GPS", err.message); setLoadingLocation(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  // MORADA
  const fetchAddress = async () => {
    if (!location) return;
    setLoadingAddress(true);
    try {
      const res = await fetch(`https://trueway-geocoding.p.rapidapi.com/ReverseGeocode?location=${location.latitude}%2C${location.longitude}&language=en`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'trueway-geocoding.p.rapidapi.com' }
      });
      const json = await res.json();
      if (json.results?.[0]) setAddressInfo({ address: json.results[0].address, area: json.results[0].area });
    } catch { Alert.alert("Error", "Failed obtaining address."); }
    finally { setLoadingAddress(false); }
  };

  // METEO
  const fetchWeather = async () => {
    if (!location) return;
    setLoadingWeather(true);
    try {
      const res = await fetch(`https://open-weather13.p.rapidapi.com/latlon?latitude=${location.latitude}&longitude=${location.longitude}&lang=pt`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'open-weather13.p.rapidapi.com' }
      });
      const json = await res.json();
      if (json.main) {
        setWeatherInfo({
          temp: `${(json.main.temp - 273.15).toFixed(1)}ºC`,
          description: json.weather[0].description,
          wind: `${json.wind.speed} m/s`
        });
      }
    } catch { Alert.alert("Error", "Failed obtaining weather."); }
    finally { setLoadingWeather(false); }
  };

  // FOTO
  const handleSelectPhoto = () => {
    const opts: ImagePicker.CameraOptions = { mediaType: 'photo', quality: 0.6, maxWidth: 640, maxHeight: 480, includeBase64: true };
    Alert.alert("Photo", "From:", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: () => ImagePicker.launchCamera(opts, processImage) },
      { text: "Gallery", onPress: () => ImagePicker.launchImageLibrary(opts, processImage) }
    ]);
  };

  const processImage = (res: ImagePicker.ImagePickerResponse) => {
    setLoadingPhoto(true);
    if (res.assets?.[0]) {
      setPhotoUri(res.assets[0].uri || null);
      if (res.assets[0].base64) setPhotoData(`data:${res.assets[0].type};base64,${res.assets[0].base64}`);
    }
    setLoadingPhoto(false);
  };


  // SUBMETER (IA + DB)
  const handleSave = async () => {
    // Validações Básicas
    if (!location) { Alert.alert("ALERT", "WAIT for GPS."); return; }
    if (!photoData) { Alert.alert("ALERT", "Photo is MANDATORY."); return; }

    setIsSubmitting(true);

    try {
      // A) CHAMADA À IA
      let aiTitle = "Report";
      let aiDescription = "Unavailable";
      let aiCategory = "Geral";

      try {
        const cleanBase64 = photoData.replace(/^data:image\/[a-z]+;base64,/, "");
        const aiRes = await fetch('https://image-tagging-and-classification.p.rapidapi.com/analyze', {
          method: 'POST',
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'image-tagging-and-classification.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input_image: cleanBase64,
            input_type: "base64",
            max_description_length: 500,
            min_keywords_count: 3,
            max_keywords_count: 5,
            custom_categories: {}
          })
        });
        const aiJson = await aiRes.json();

        if (aiJson.data) {
          aiTitle = aiJson.data.title || "Report Detected";
          const keywords = aiJson.data.keywords ? aiJson.data.keywords.join(", ") : "";
          aiCategory = aiJson.data.category || "Geral";
          aiDescription = `${aiJson.data.description}\n\n[IA Tags]: ${keywords}\n[Categoria]: ${aiCategory}`;
        }
      } catch (aiError) {
        console.log("AI failed", aiError);
      }

      // B) ENVIAR PARA BASE DE DADOS (Redux)
      await dispatch(addReport({
        title: aiTitle,
        description: aiDescription,
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: addressInfo?.address,
        area: addressInfo?.area,
        weather: weatherInfo || undefined,
        photoBase64: photoData
      })).unwrap();


      setPhotoUri(null);
      setPhotoData(null);
      setAddressInfo(null);
      setWeatherInfo(null);

      Alert.alert("Success", "Report recorded!", [
        { text: "OK", onPress: () => { getLocation(); navigation.goBack(); } }
      ]);

    } catch (error: any) {
      Alert.alert("Error", "Fail recording on DB: " + error.message);
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
            <Text>Tracking...</Text>
          </View>
        ) : location ? (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.gpsLabel}>Location</Text>
            <Text style={styles.gpsCoords}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
          </View>
        ) : (
          <Text>Touch to retrieve GPS coordinates </Text>
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
            buttonText="Obtain Address"
            isLoading={loadingAddress}
            onPress={fetchAddress}
          />
          <InfoWidget
            label="WEATHER"
            value={weatherInfo?.temp || null}
            subValue={weatherInfo?.description}
            extra={weatherInfo ? weatherInfo.wind : undefined}
            buttonText="Obtain Weather"
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
              <Text style={styles.btnText}>A Analisar & Guardar...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Register Report</Text>
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