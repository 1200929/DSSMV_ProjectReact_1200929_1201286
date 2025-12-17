import React, { useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { AddReportScreen } from './src/screens/AddReportScreen';
import { ListReportsScreen } from './src/screens/ListReportsScreen';

export default function App() {
  const [screen, setScreen] = useState<'list' | 'add'>('list');

  return (
    <Provider store={store}>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, paddingBottom: 60}}>
          {screen === 'list' ? <ListReportsScreen /> : <AddReportScreen />}
        </View>
        <View style={styles.nav}>
          <TouchableOpacity style={styles.btn} onPress={() => setScreen('list')}><Text>List</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => setScreen('add')}><Text>Add</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  nav: { position: 'absolute', bottom: 0, width: '100%', height: 60, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  btn: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});