import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { addReport } from '../store/slices/reportsSlice';

export const AddReportScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return;

    dispatch(addReport({
      id: Date.now().toString(),
      title,
      description,
      timestamp: new Date().toISOString(),
      latitude: 0,
      longitude: 0
    }));

    Alert.alert("Success", "Report saved!");
    setTitle('');
    setDescription('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Report</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={[styles.input, {height: 100}]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TouchableOpacity style={styles.btn} onPress={handleSave}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15 },
  btn: { backgroundColor: '#6200ee', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});