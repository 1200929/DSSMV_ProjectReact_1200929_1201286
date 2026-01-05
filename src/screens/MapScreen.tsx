import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Report } from '../models/Report';

export const MapScreen = ({ navigation }: any) => {
  const { items } = useSelector((state: RootState) => state.reports);

  // Usa Google Maps no Android, Apple Maps no iOS
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

  const initialRegion = {
    latitude: 41.1579,
    longitude: -8.6291,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={mapProvider}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {items.map((report: Report) => (
          <Marker
            key={report._id || report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            pinColor={report.state === 'RESOLVED' ? 'green' : 'red'}
          >
            <Callout onPress={() => navigation.navigate('ReportDetails', { report })}>
              <View style={styles.callout}>
                <Text style={styles.title}>{report.title}</Text>
                <Text style={styles.status}>{report.state}</Text>
                <Text style={styles.link}>Ver Detalhes</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  callout: { width: 160, padding: 5 },
  title: { fontWeight: 'bold', fontSize: 14, marginBottom: 2, color: '#333' },
  status: { fontSize: 10, fontWeight: 'bold', color: '#e8c100' },
  link: { fontSize: 10, color: '#22d602', marginTop: 5 }
});