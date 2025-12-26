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
import { Report } from './src/models/Report';

// Definir quais ecrãs existem e que dados recebem
export type RootStackParamList = {
  ListReports: undefined;
  AddReport: undefined;
  ReportDetails: { report: Report };
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
              title: 'Urban Reports',
              headerStyle: { backgroundColor: '#6200ee' },
              headerTintColor: '#fff',
              // Botão "+ Novo" no canto superior direito
              headerRight: () => (
                <TouchableOpacity
                  style={styles.headerBtn}
                  onPress={() => navigation.navigate('AddReport')}
                >
                  <Text style={styles.headerBtnText}>+ Novo</Text>
                </TouchableOpacity>
              )
            })}
          />

          {/* ECRÃ 2: ADICIONAR */}
          <Stack.Screen
            name="AddReport"
            component={AddReportScreen}
            options={{
              title: 'Nova Ocorrência',
              headerStyle: { backgroundColor: '#6200ee' },
              headerTintColor: '#fff',
            }}
          />

          {/* ECRÃ 3: DETALHES */}
          <Stack.Screen
            name="ReportDetails"
            component={ReportDetailsScreen}
            options={{
              title: 'Detalhes',
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#6200ee',
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginRight: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  headerBtnText: {
    color: '#6200ee',
    fontWeight: 'bold',
    fontSize: 14
  }
});