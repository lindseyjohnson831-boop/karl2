import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Image, PanResponder, Animated, ScrollView, Pressable, Linking,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { KARL_HOODS, KARL_STATUS, cityVerdict, Hood } from '../data/hoods';
import { REGION_PATHS, REGION_PTS, MAP_W, MAP_H, hoodAt } from '../data/regions';
import WeatherIcon from '../components/WeatherIcon';
import KarlScore from '../components/KarlScore';
import { colors } from '../theme';

const { width: SW, height: SH } = Dimensions.get('window');

const BADGE_IDS = ['sunset', 'richmond', 'golden-gate-park', 'twin-peaks', 'marina', 'mission', 'bernal', 'fidi'];

export default function MapScreen() {
  const [selId, setSelId] = useState<string | null>(null);
  const selHood = KARL_HOODS.find(h => h.id === selId) ?? null;
  const verdict = cityVerdict(KARL_HOODS);

  // Pan/zoom state
  const scale = useRef(SW / MAP_W);
  const tx = useRef(0);
  const ty = useRef(0);
  const [viewVer, setViewVer] = useState(0); // version counter to force re-render
  const lastTap = useRef(0);

  const minScale = SW / MAP_W;
  const maxScale = minScale * 8;

  const clampTx = (t: number, s: number) => {
    const w = MAP_W * s;
    if (w <= SW) return (SW - w) / 2;
    return Math.max(SW - w, Math.min(0, t));
  };
  const clampTy = (t: number, s: number) => {
    const h = MAP_H * s;
    if (h <= SH) return (SH - h) / 2;
    return Math.max(SH - h, Math.min(0, t));
  };

  // Pan responder
  const lastPos = useRef({ x: 0, y: 0 });
  const pinchRef = useRef<{ startDist: number; startScale: number; midX: number; midY: number } | null>(null);
  const moved = useRef(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      moved.current = false;
      if (e.nativeEvent.touches.length === 1) {
        lastPos.current = { x: e.nativeEvent.touches[0].pageX, y: e.nativeEvent.touches[0].pageY };
      }
    },
    onPanResponderMove: (e) => {
      const touches = e.nativeEvent.touches;
      if (touches.length === 2) {
        moved.current = true;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const dist = Math.hypot(dx, dy);
        const midX = (touches[0].pageX + touches[1].pageX) / 2;
        const midY = (touches[0].pageY + touches[1].pageY) / 2;
        if (!pinchRef.current) {
          pinchRef.current = { startDist: dist, startScale: scale.current, midX, midY };
        } else {
          const ns = Math.max(minScale, Math.min(maxScale, pinchRef.current.startScale * dist / pinchRef.current.startDist));
          const ix = (midX - tx.current) / scale.current;
          const iy = (midY - ty.current) / scale.current;
          scale.current = ns;
          tx.current = clampTx(midX - ix * ns, ns);
          ty.current = clampTy(midY - iy * ns, ns);
          setViewVer(v => v + 1);
        }
      } else if (touches.length === 1 && !pinchRef.current) {
        const dx = touches[0].pageX - lastPos.current.x;
        const dy = touches[0].pageY - lastPos.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
        tx.current = clampTx(tx.current + dx, scale.current);
        ty.current = clampTy(ty.current + dy, scale.current);
        lastPos.current = { x: touches[0].pageX, y: touches[0].pageY };
        setViewVer(v => v + 1);
      }
    },
    onPanResponderRelease: (e) => {
      pinchRef.current = null;
      if (!moved.current && e.nativeEvent.touches.length === 0) {
        const mx = (e.nativeEvent.locationX - tx.current) / scale.current;
        const my = (e.nativeEvent.locationY - ty.current) / scale.current;
        const id = hoodAt(mx, my);
        setSelId(id);
      }
      moved.current = false;
    },
  });

  const zoom = (factor: number) => {
    const ns = Math.max(minScale, Math.min(maxScale, scale.current * factor));
    const cx = SW / 2, cy = SH / 2;
    const mx = (cx - tx.current) / scale.current;
    const my = (cy - ty.current) / scale.current;
    scale.current = ns;
    tx.current = clampTx(cx - mx * ns, ns);
    ty.current = clampTy(cy - my * ns, ns);
    setViewVer(v => v + 1);
  };

  const screenX = (h: Hood) => tx.current + (h.x / 100) * MAP_W * scale.current;
  const screenY = (h: Hood) => ty.current + (h.y / 100) * MAP_H * scale.current;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>KarlCheck</Text>
          <Text style={styles.verdict}>{verdict.head}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer} {...panResponder.panHandlers}>
        {/* Base map image */}
        <View style={{
          position: 'absolute',
          transform: [{ translateX: tx.current }, { translateY: ty.current }, { scale: scale.current }],
          transformOrigin: '0 0',
          width: MAP_W,
          height: MAP_H,
        }}>
          <Image
            source={require('../../project/assets/sf-map-new.png')}
            style={{ width: MAP_W, height: MAP_H }}
            resizeMode="contain"
          />
          {/* SVG overlay for selected neighborhood */}
          <Svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            width={MAP_W}
            height={MAP_H}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {KARL_HOODS.map(h => {
              const d = REGION_PATHS[h.id];
              if (!d) return null;
              const sel = h.id === selId;
              // Convert + separated path to space separated
              const svgD = d.replace(/\+/g, ' ');
              return (
                <Path
                  key={h.id}
                  d={svgD}
                  fill={sel ? `${colors.accent}33` : 'transparent'}
                  stroke={sel ? colors.accent : 'transparent'}
                  strokeWidth={sel ? 3 : 0}
                  strokeLinejoin="round"
                />
              );
            })}
          </Svg>
        </View>

        {/* Neighborhood badges */}
        {BADGE_IDS.map(id => {
          const h = KARL_HOODS.find(hd => hd.id === id);
          if (!h) return null;
          const x = screenX(h);
          const y = screenY(h);
          if (x < -60 || x > SW + 60 || y < -60 || y > SH + 60) return null;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelId(id)}
              style={[styles.badge, {
                left: x,
                top: y - 20,
                backgroundColor: selId === id ? colors.accent : colors.card,
              }]}
            >
              <WeatherIcon status={h.status} size={16} color={selId === id ? colors.card : colors.accent} />
              <Text style={[styles.badgeTemp, { color: selId === id ? colors.card : colors.ink }]}>
                {h.temp}°
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Selected hood label */}
        {selHood && (() => {
          const x = screenX(selHood);
          const y = screenY(selHood);
          return (
            <View style={[styles.selLabel, { left: x, top: y - 52 }]}>
              <Text style={styles.selLabelText}>{selHood.name}</Text>
            </View>
          );
        })()}

        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(1.5)}>
            <Text style={styles.zoomBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(1 / 1.5)}>
            <Text style={styles.zoomBtnText}>−</Text>
          </TouchableOpacity>
        </View>

        {/* Tap hint */}
        {!selId && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>tap a neighborhood</Text>
          </View>
        )}
      </View>

      {/* Bottom sheet */}
      {selHood && (
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHead}>
            <WeatherIcon status={selHood.status} size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sheetName}>{selHood.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Text style={styles.sheetStatus}>{KARL_STATUS[selHood.status].label.toUpperCase()}</Text>
                <Text style={styles.sheetVibe}>{KARL_STATUS[selHood.status].vibe}</Text>
              </View>
            </View>
            <Text style={styles.sheetTemp}>{selHood.temp}°</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{selHood.wind}<Text style={styles.statUnit}>mph</Text></Text>
              <Text style={styles.statLbl}>WIND</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{selHood.vis}<Text style={styles.statUnit}>mi</Text></Text>
              <Text style={styles.statLbl}>VIS</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{selHood.cams}</Text>
              <Text style={styles.statLbl}>CAMS</Text>
            </View>
          </View>

          <KarlScore score={selHood.score} />

          {/* Karl says */}
          <View style={styles.quote}>
            <Text style={styles.quoteLabel}>KARL SAYS</Text>
            <Text style={styles.quoteText}>"{selHood.blurb}"</Text>
          </View>

          {/* Live cam link */}
          {selHood.liveUrl && (
            <TouchableOpacity
              style={styles.camBtn}
              onPress={() => Linking.openURL(selHood.liveUrl!)}
            >
              <Text style={styles.camBtnText}>Watch Live Cam ↗</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setSelId(null)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10,
    backgroundColor: colors.paper,
  },
  appTitle: { fontSize: 26, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  verdict: { fontSize: 13, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand', marginTop: 1 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${colors.accent}1a`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  liveDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#e0445b' },
  liveText: { fontSize: 10, fontWeight: '600', color: colors.accent, letterSpacing: 1, fontFamily: 'DM Mono' },
  mapContainer: { flex: 1, backgroundColor: '#f4f1e9', overflow: 'hidden', position: 'relative' },
  badge: {
    position: 'absolute',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1.5, borderColor: `${colors.ink}22`,
    transform: [{ translateX: -30 }],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4,
    elevation: 3,
  },
  badgeTemp: { fontSize: 13, fontWeight: '700', fontFamily: 'Patrick Hand' },
  selLabel: {
    position: 'absolute',
    transform: [{ translateX: -50 }],
    backgroundColor: colors.ink,
    paddingHorizontal: 11, paddingVertical: 3,
    borderRadius: 999,
  },
  selLabelText: { color: colors.paper, fontSize: 13, fontWeight: '700', fontFamily: 'Patrick Hand', whiteSpace: 'nowrap' as any },
  zoomControls: { position: 'absolute', right: 12, bottom: 16, gap: 7, flexDirection: 'column' },
  zoomBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: `${colors.ink}22`,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  zoomBtnText: { fontSize: 22, color: colors.ink, fontWeight: '600', lineHeight: 26 },
  hint: {
    position: 'absolute', bottom: 16, alignSelf: 'center',
    backgroundColor: `${colors.card}b0`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999,
  },
  hintText: { fontSize: 11, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand' },
  sheet: {
    backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 18, paddingBottom: 34, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
    gap: 14,
  },
  sheetHandle: { width: 38, height: 5, borderRadius: 9, backgroundColor: `${colors.ink}33`, alignSelf: 'center', marginBottom: 6 },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  sheetName: { fontSize: 24, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  sheetStatus: { fontSize: 11, fontWeight: '600', color: colors.accent, letterSpacing: 1, fontFamily: 'DM Mono' },
  sheetVibe: { fontSize: 12, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand' },
  sheetTemp: { fontSize: 30, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand', marginLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1, backgroundColor: `${colors.ink}0f`, borderRadius: 12,
    paddingVertical: 10, alignItems: 'center',
  },
  statVal: { fontSize: 20, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  statUnit: { fontSize: 11, opacity: 0.55 },
  statLbl: { fontSize: 9, letterSpacing: 0.8, color: colors.ink, opacity: 0.5, fontFamily: 'DM Mono', marginTop: 3 },
  quote: {
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1.5, borderColor: `${colors.accent}33`,
    borderRadius: 14, padding: 13,
  },
  quoteLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: colors.accent, fontFamily: 'DM Mono', marginBottom: 3 },
  quoteText: { fontSize: 15, lineHeight: 21, color: colors.ink, fontFamily: 'Patrick Hand' },
  camBtn: {
    backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  camBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Patrick Hand' },
  closeBtn: { alignItems: 'center', paddingVertical: 6 },
  closeBtnText: { fontSize: 14, color: colors.ink, opacity: 0.5, fontFamily: 'Patrick Hand' },
  ink: colors.ink,
});
