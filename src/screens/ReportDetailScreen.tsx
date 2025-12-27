import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Report } from '../models/Report';

interface ReportDetailsProps {
  route: { params: { report: Report } };
  navigation: any;
}

export const ReportDetailsScreen = ({ route }: ReportDetailsProps) => {
  // Recebemos o report enviado pelo ecrã anterior
  const { report } = route.params;

  // Formatar data
  const formattedDate = new Date(report.timestamp).toLocaleString('pt-PT');

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            report.state === 'RESOLVED' ? styles.badgeGreen : styles.badgeRed,
          ]}
        >
          <Text style={styles.badgeText}>{report.state}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <Text style={styles.title}>{report.title}</Text>

      <View style={styles.divider} />

      {/* DESCRIÇÃO */}
      <View style={styles.section}>
        <Text style={styles.label}>DESCRIPTION</Text>
        <Text style={styles.bodyText}>{report.description}</Text>
      </View>

      {/* LOCALIZAÇÃO */}
      <View style={styles.section}>
        <Text style={styles.label}>LOCATION</Text>
        <View style={styles.row}>
          <Text style={styles.icon}></Text>
          <View>
            <Text style={styles.bodyText}>
              {report.address || 'No available address'}
            </Text>
            <Text style={styles.subText}>
              {report.area ? `${report.area} • ` : ''}
              {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      </View>

      {/* METEOROLOGIA (Se existir) */}
      {report.weather && (
        <View style={styles.section}>
          <Text style={styles.label}>WEATHER ON LOCATION</Text>
          <View style={styles.weatherBox}>
            <Text style={styles.weatherTemp}>{report.weather.temp}</Text>
            <View>
              <Text style={styles.weatherDesc}>
                {report.weather.description}
              </Text>
              <Text style={styles.subText}>Vento: {report.weather.wind}</Text>
            </View>
          </View>
        </View>
      )}

      {/* FOTOGRAFIA */}
      {report.photoBase64 && (
        <View style={styles.section}>
          <Text style={styles.label}>PHOTO</Text>
          <Image
            source={{ uri: report.photoBase64 }}
            style={styles.photo}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  date: { color: '#888', fontSize: 12 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeRed: { backgroundColor: '#ffebee' },
  badgeGreen: { backgroundColor: '#e8f5e9' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: 'orange' },

  title: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  id: { fontSize: 10, color: '#aaa', marginBottom: 15 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },

  section: { marginBottom: 25 },
  label: { fontSize: 12, color: 'orange', fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  bodyText: { fontSize: 16, color: '#444', lineHeight: 24 },
  subText: { fontSize: 13, color: '#888', marginTop: 2 },

  row: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 20, marginRight: 10, marginTop: -2 },

  // Estilos Weather
  weatherBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e9ecef' },
  weatherTemp: { fontSize: 32, fontWeight: 'bold', color: '#333', marginRight: 15 },
  weatherDesc: { fontSize: 16, color: '#333', textTransform: 'capitalize' },

  btnBack: { marginTop: 20, padding: 15, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 },
  btnBackText: { color: '#555', fontWeight: '600' },

  // ESTILO DA FOTO
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd'
  }
});