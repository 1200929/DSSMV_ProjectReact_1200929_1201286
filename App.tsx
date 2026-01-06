import 'react-native-gesture-handler';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

// NAVEGAÇÃO
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ECRÃS
import { AddReportScreen } from './src/screens/AddReportScreen';
import { ListReportsScreen } from './src/screens/ListReportsScreen';
import { ReportDetailsScreen } from './src/screens/ReportDetailScreen';
import { MapScreen } from './src/screens/MapScreen.tsx';
import { Report } from './src/models/Report';


// Definir quais ecrãs existem e que dados recebem
export type RootStackParamList = {
  ListReports: undefined;
  AddReport: undefined;
  ReportDetails: { report: Report };
  MapScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ListReports">

          {/* ECRÃ 1: LISTA (HOME) */}
          <Stack.Screen
            name="ListReports"
            component={ListReportsScreen}
            options={({ navigation }) => ({
              title: 'RoadScout',
              headerStyle: { backgroundColor: '#ff8c00' },
              headerTintColor: '#fff700',
              // Botão "+ New" no canto superior direito
              headerRight: () => (
                <TouchableOpacity
                  style={styles.headerBtn}
                  onPress={() => navigation.navigate('AddReport')}
                >
                  <Text style={styles.headerBtnText}>+ New</Text>
                </TouchableOpacity>
              )
            })}
          />

          {/* ECRÃ 2: ADICIONAR */}
          <Stack.Screen
            name="AddReport"
            component={AddReportScreen}
            options={{
              title: 'New Report',
              headerStyle: { backgroundColor: '#ff8c00' },
              headerTintColor: '#fff700',
            }}
          />

          {/* ECRÃ 3: DETALHES */}
          <Stack.Screen
            name="ReportDetails"
            component={ReportDetailsScreen}
            options={{
              title: 'Details',
              headerStyle: { backgroundColor: '#ff8c00' },
              headerTintColor: '#fff700',
            }}
          />

          {/* ECRÃ 4: MAPA */}
          <Stack.Screen
            name="MapScreen"
            component={MapScreen}
            options={{
              title: 'MAP VIEW',
              headerStyle: { backgroundColor: '#ff8c00' },
              headerTintColor: '#fff700',
            }}/>

        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginRight: 15,
    backgroundColor: '#ff0008',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  headerBtnText: {
    color: '#fff700',
    fontWeight: 'bold',
    fontSize: 14
  }
});