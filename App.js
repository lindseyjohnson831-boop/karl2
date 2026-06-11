import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Linking, Share } from 'react-native';
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

const EXTERNAL_URL = /^(https?|mailto|sms|tel):/i;

// Messages posted by the page (see the "Native bridge" script in karlcheck.html):
// - open-url: open external links in Safari / Mail / Messages instead of the WebView
// - share: present the native share sheet
function handleWebViewMessage(event) {
  let msg;
  try {
    msg = JSON.parse(event.nativeEvent.data);
  } catch (e) {
    return;
  }
  if (msg.type === 'open-url' && typeof msg.url === 'string' && EXTERNAL_URL.test(msg.url)) {
    Linking.openURL(msg.url).catch(() => {});
  } else if (msg.type === 'share') {
    const message = [msg.text, msg.url].filter(Boolean).join(' ');
    Share.share({ message, url: msg.url, title: msg.title }).catch(() => {});
  }
}

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
  const injectedJS = `window.__KC_NATIVE__=true;window.__KC_SHARE_URL__="https://karlcheck.app/get";window.__KC_BASE__=${JSON.stringify(assetBase)};true;`;

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
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onMessage={handleWebViewMessage}
        // window.open / target=_blank popups (e.g. from cam embeds) bypass
        // onShouldStartLoadWithRequest — route them to Safari so the WebView
        // never leaves the app.
        onOpenWindow={({ nativeEvent }) => {
          const url = nativeEvent.targetUrl;
          if (url && /^https?:/i.test(url)) Linking.openURL(url).catch(() => {});
        }}
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
