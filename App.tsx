import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import MapScreen from './src/screens/MapScreen';
import CameraScreen from './src/screens/CameraScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme';

type Tab = 'map' | 'camera' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('map');

  const [fontsLoaded] = useFonts({
    'Patrick Hand': PatrickHand_400Regular,
    'DM Mono': DMMono_400Regular,
    'DM Mono Medium': DMMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.ink, opacity: 0.5 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.screen}>
          {tab === 'map' && <MapScreen />}
          {tab === 'camera' && <CameraScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </View>
        <SafeAreaView style={styles.tabBar}>
          <TabBtn label="Map" emoji="🗺️" active={tab === 'map'} onPress={() => setTab('map')} />
          <TabBtn label="Contribute" emoji="📷" active={tab === 'camera'} onPress={() => setTab('camera')} />
          <TabBtn label="Settings" emoji="⚙️" active={tab === 'settings'} onPress={() => setTab('settings')} />
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

function TabBtn({ label, emoji, active, onPress }: { label: string; emoji: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabBtn}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: `${colors.ink}14`,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, color: colors.ink, opacity: 0.4, fontFamily: 'DM Mono', letterSpacing: 0.3 },
  tabLabelActive: { opacity: 1, color: colors.accent },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 1 },
});
