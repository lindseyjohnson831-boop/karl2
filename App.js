import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';

// All local assets the HTML references, mapped to the relative path it uses
const ASSET_MAP = [
  {
    module: require('./assets/karlcheck.html'),
    dest: 'karlcheck/index.html',
  },
  {
    module: require('./assets/project/assets/sf-map-new.png'),
    dest: 'karlcheck/project/assets/sf-map-new.png',
  },
  {
    module: require('./assets/project/assets/karlcheck-logo.png'),
    dest: 'karlcheck/project/assets/karlcheck-logo.png',
  },
  {
    module: require('./assets/project/assets/fishermans-cam.png'),
    dest: 'karlcheck/project/assets/fishermans-cam.png',
  },
];

const HTML_URI = FileSystem.documentDirectory + 'karlcheck/index.html';

async function ensureAssets() {
  await FileSystem.makeDirectoryAsync(
    FileSystem.documentDirectory + 'karlcheck/project/assets',
    { intermediates: true }
  );

  for (const item of ASSET_MAP) {
    const destPath = FileSystem.documentDirectory + item.dest;

    const asset = Asset.fromModule(item.module);
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error(`Could not resolve asset: ${item.dest}`);
    }

    await FileSystem.deleteAsync(destPath, { idempotent: true });
    await FileSystem.copyAsync({ from: asset.localUri, to: destPath });
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    ensureAssets()
      .then(() => setReady(true))
      .catch((e) => {
        console.error('Asset setup failed:', e);
        setError(e.message);
      });
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load app:{'\n'}{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#863a5c" />
        <Text style={styles.loadingText}>Loading KarlCheck…</Text>
      </View>
    );
  }

  const assetBase = FileSystem.documentDirectory + 'karlcheck/';
  const injectedJS = `window.__KC_NATIVE__=true;window.__KC_SHARE_URL__="https://karlcheck.app";window.__KC_BASE__=${JSON.stringify(assetBase)};true;`;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        source={{ uri: HTML_URI }}
        allowingReadAccessToURL={assetBase}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        scrollEnabled={false}
        bounces={true}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onShouldStartLoadWithRequest={(req) => {
          if (!req.isTopFrame) return true;
          return req.url.startsWith('file://') || req.url === 'about:blank';
        }}
        style={styles.webview}
        onError={(e) => console.error('WebView error:', e.nativeEvent)}
        onHttpError={(e) => console.error('HTTP error:', e.nativeEvent.statusCode)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eae8e4',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eae8e4',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontFamily: 'System',
    fontSize: 15,
    color: '#863a5c',
  },
  errorText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#c8324b',
    textAlign: 'center',
    lineHeight: 22,
  },
  webview: {
    flex: 1,
  },
});
