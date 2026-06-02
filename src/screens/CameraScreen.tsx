import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KARL_HOODS } from '../data/hoods';
import WeatherIcon from '../components/WeatherIcon';
import { colors } from '../theme';

interface Photo { id: string; uri: string; hoodId: string; hoodName: string; ts: string }

export default function CameraScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selHoodId, setSelHoodId] = useState<string | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem('kc-photos-v2').then(v => {
      if (v) setPhotos(JSON.parse(v));
    });
  }, []);

  const save = async (next: Photo[]) => {
    setPhotos(next);
    await AsyncStorage.setItem('kc-photos-v2', JSON.stringify(next));
  };

  const pickImage = async (hoodId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const hood = KARL_HOODS.find(h => h.id === hoodId)!;
      const photo: Photo = {
        id: `p_${Date.now()}`, uri: result.assets[0].uri,
        hoodId, hoodName: hood.name, ts: new Date().toISOString(),
      };
      await save([photo, ...photos]);
    }
  };

  const takePhoto = async (hoodId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const hood = KARL_HOODS.find(h => h.id === hoodId)!;
      const photo: Photo = {
        id: `p_${Date.now()}`, uri: result.assets[0].uri,
        hoodId, hoodName: hood.name, ts: new Date().toISOString(),
      };
      await save([photo, ...photos]);
    }
  };

  const deletePhoto = (id: string) => {
    Alert.alert('Delete photo?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => save(photos.filter(p => p.id !== id)) },
    ]);
  };

  const foggyHoods = KARL_HOODS.filter(h => h.score >= 40).slice(0, 8);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Community Fog Watch</Text>
      <Text style={styles.sub}>Share what Karl looks like from your block</Text>

      {/* My photos */}
      {photos.length > 0 && (
        <View>
          <Text style={styles.sectionLabel}>YOUR CONTRIBUTIONS</Text>
          {photos.map(p => (
            <View key={p.id} style={styles.photoRow}>
              <Image source={{ uri: p.uri }} style={styles.photoThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.photoHood}>{p.hoodName}</Text>
                <Text style={styles.photoTime}>{new Date(p.ts).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => deletePhoto(p.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add photo for a neighborhood */}
      <Text style={styles.sectionLabel}>FOGGY NEIGHBORHOODS</Text>
      <Text style={styles.sectionSub}>Tap a neighborhood to add your view</Text>
      {foggyHoods.map(h => (
        <View key={h.id} style={styles.hoodCard}>
          <View style={styles.hoodCardLeft}>
            <WeatherIcon status={h.status} size={28} />
            <View>
              <Text style={styles.hoodName}>{h.name}</Text>
              <Text style={styles.hoodScore}>Karl Score: {h.score}/100</Text>
            </View>
          </View>
          <View style={styles.hoodBtns}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => takePhoto(h.id)}>
              <Text style={styles.photoBtnText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(h.id)}>
              <Text style={styles.photoBtnText}>🖼️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 14 },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  sub: { fontSize: 14, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand', marginTop: -8 },
  sectionLabel: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase',
    color: colors.ink, opacity: 0.42, fontFamily: 'DM Mono',
  },
  sectionSub: { fontSize: 12, color: colors.ink, opacity: 0.5, fontFamily: 'Patrick Hand', marginTop: -8 },
  photoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: `${colors.ink}18`, padding: 9,
  },
  photoThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.ink },
  photoHood: { fontSize: 15, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  photoTime: { fontSize: 11, color: colors.ink, opacity: 0.55, fontFamily: 'Patrick Hand', marginTop: 3 },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#c8324b1a',
  },
  deleteBtnText: { color: '#c8324b', fontSize: 13, fontWeight: '700' },
  hoodCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: 14, padding: 13,
    borderWidth: 1.5, borderColor: `${colors.ink}18`,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  hoodCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hoodName: { fontSize: 15, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  hoodScore: { fontSize: 11, color: colors.ink, opacity: 0.55, fontFamily: 'DM Mono', letterSpacing: 0.4, marginTop: 2 },
  hoodBtns: { flexDirection: 'row', gap: 8 },
  photoBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: `${colors.accent}18`,
    alignItems: 'center', justifyContent: 'center',
  },
  photoBtnText: { fontSize: 20 },
});
