import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface PhotoWidgetProps {
  photoUri: string | null;
  onTakePhoto: () => void;
  onRemovePhoto: () => void;
  isLoadingPhoto: boolean;
}

export const PhotoWidget = ({
                              photoUri, onTakePhoto, onRemovePhoto, isLoadingPhoto
                            }: PhotoWidgetProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photo</Text>

      {photoUri ? (
        <View style={styles.imageWrapper}>
          {/* Preview da Imagem */}
          <Image source={{ uri: photoUri }} style={styles.preview} />

          {/* Botão de Remover */}
          <TouchableOpacity style={styles.btnRemove} onPress={onRemovePhoto}>
            <Text style={styles.btnRemoveText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Placeholder (Botão de Adicionar) */
        <TouchableOpacity
          style={styles.placeholder}
          onPress={onTakePhoto}
          disabled={isLoadingPhoto}
        >
          {isLoadingPhoto ? (
            <ActivityIndicator color="#ff8c00" size="large" />
          ) : (
            <Text style={styles.placeholderText}>Add Photo</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#444' },
  placeholder: { height: 180, backgroundColor: '#eef2ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  placeholderText: { color: '#ff8c00', fontWeight: 'bold', fontSize: 16 },
  imageWrapper: { position: 'relative' },
  preview: { height: 220, width: '100%', borderRadius: 10, backgroundColor: '#000' },
  btnRemove: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  btnRemoveText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: -2 }
});