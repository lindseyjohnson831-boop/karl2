import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

const LEVEL_TIERS = [
  { name: 'Misty Novice',     emoji: '🌫️', min: 1,  max: 5,        blurb: 'Just rolled in. Keep the pics coming.' },
  { name: 'Jacket Wearer',    emoji: '🧥', min: 6,  max: 10,       blurb: "You've learned. You bring layers now." },
  { name: "Karl's Paparazzi", emoji: '📸', min: 11, max: 20,       blurb: "Karl can't make a move without you." },
  { name: 'The Fog Overlord', emoji: '👑', min: 21, max: Infinity, blurb: 'The fog answers to you now.' },
];

function tierForLevel(level: number) {
  if (level < 1) return null;
  return LEVEL_TIERS.find(t => level >= t.min && level <= t.max) ?? LEVEL_TIERS[LEVEL_TIERS.length - 1];
}

interface Account { username: string; email: string; level: number }

export default function SettingsScreen() {
  const [view, setView] = useState<'menu' | 'account' | 'trophies'>('menu');
  const [account, setAccount] = useState<Account | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  React.useEffect(() => {
    AsyncStorage.getItem('kc-account').then(v => {
      if (v) setAccount(JSON.parse(v));
    });
  }, []);

  const saveAccount = async () => {
    if (!username.trim()) return setErr('Pick a username.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email.');
    if (pw.length < 4) return setErr('Password needs 4+ characters.');
    const acct = { username: username.trim(), email: email.trim(), level: 0 };
    await AsyncStorage.setItem('kc-account', JSON.stringify(acct));
    setAccount(acct);
    setView('menu');
  };

  const logout = async () => {
    await AsyncStorage.removeItem('kc-account');
    setAccount(null);
  };

  if (view === 'account') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('menu')} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{account ? 'Account' : 'Create Account'}</Text>
          <View style={{ width: 60 }} />
        </View>

        {account ? (
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{account.username[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{account.username}</Text>
            <Text style={styles.profileEmail}>{account.email}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{account.level}</Text>
                <Text style={styles.statLbl}>Level</Text>
              </View>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Join the fog watch</Text>
            <Text style={styles.formSub}>Create an account to post photos under your name and earn trophies.</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>USERNAME</Text>
              <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="foggymcfogface" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <TextInput style={styles.input} value={pw} onChangeText={setPw} placeholder="••••••" secureTextEntry />
            </View>
            {!!err && <Text style={styles.err}>{err}</Text>}
            <TouchableOpacity style={styles.submitBtn} onPress={saveAccount}>
              <Text style={styles.submitText}>Create account</Text>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>Demo only — stored on this device, never sent anywhere.</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  if (view === 'trophies') {
    const level = account?.level ?? 0;
    const tier = tierForLevel(level);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('menu')} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Trophies</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.trophyHero}>
          <Text style={{ fontSize: 56 }}>{tier ? tier.emoji : '🌥️'}</Text>
          <Text style={styles.trophyName}>{tier ? tier.name : 'Fogless'}</Text>
          <Text style={styles.trophyBlurb}>{tier ? tier.blurb : 'Share your first photo to reach Level 1.'}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>LEVEL {level}</Text>
          </View>
        </View>
        {LEVEL_TIERS.map(t => {
          const reached = level >= t.min;
          const current = tier === t;
          return (
            <View key={t.name} style={[styles.tierRow, current && styles.tierRowActive, !reached && styles.tierRowDim]}>
              <Text style={{ fontSize: 26 }}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tierName}>{t.name}</Text>
                <Text style={styles.tierRange}>Level {t.min}{t.max === Infinity ? '+' : `–${t.max}`}</Text>
              </View>
              {current && <Text style={styles.youBadge}>YOU</Text>}
              {reached && !current && <Text style={{ color: '#2f8f5e', fontSize: 16, fontWeight: '700' }}>✓</Text>}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // Main menu
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { marginBottom: 16 }]}>Settings</Text>

      {/* Identity strip */}
      <TouchableOpacity onPress={() => setView('account')} style={styles.identityCard}>
        <View style={styles.avatar}>
          {account
            ? <Text style={styles.avatarLetter}>{account.username[0].toUpperCase()}</Text>
            : <Text style={styles.avatarLetter}>?</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.identityName}>{account ? account.username : 'Create an account'}</Text>
          <Text style={styles.identitySub}>{account ? `Level ${account.level} · post under your name` : 'Post photos & track contributions'}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Your fog</Text>
      <MenuRow label="My Trophies" sub="Your fog-spotting rank" emoji="🏆" onPress={() => setView('trophies')} />

      <Text style={styles.sectionLabel}>Get involved</Text>
      <MenuRow label="Host a Neighborhood Cam" sub="Stream your window — $ earned" emoji="📹"
        onPress={() => Linking.openURL('mailto:contactsfbaysics@gmail.com?subject=Interested%20in%20hosting%20a%20neighborhood%20cam')} />
      <MenuRow label="Interested in Ad Space" sub="Reach the whole foggy city" emoji="📣"
        onPress={() => Linking.openURL('mailto:contactsfbaysics@gmail.com?subject=Ad%20space%20interest')} />
      <MenuRow label="Submit Feedback" sub="Tell us what's broken or brilliant" emoji="✉️"
        onPress={() => Linking.openURL('mailto:contactsfbaysics@gmail.com?subject=feedback')} />

      <Text style={styles.footer}>KarlCheck · fog, verified by your neighbors</Text>
    </ScrollView>
  );
}

function MenuRow({ label, sub, emoji, onPress }: { label: string; sub: string; emoji: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuRow}>
      <View style={styles.menuIcon}><Text style={{ fontSize: 18 }}>{emoji}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingTop: 56, paddingBottom: 40, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 60 },
  backText: { fontSize: 17, color: colors.accent, fontFamily: 'Patrick Hand' },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand', textAlign: 'center' },
  identityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: `${colors.accent}33`,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Patrick Hand' },
  identityName: { fontSize: 16, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  identitySub: { fontSize: 12, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand', marginTop: 1 },
  chevron: { fontSize: 20, color: colors.ink, opacity: 0.35 },
  sectionLabel: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase',
    color: colors.ink, opacity: 0.42, fontFamily: 'DM Mono', marginTop: 10, marginBottom: 2,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, borderRadius: 14, padding: 13,
    borderWidth: 1.5, borderColor: `${colors.ink}18`,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 11, backgroundColor: `${colors.accent}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  menuSub: { fontSize: 11, color: colors.ink, opacity: 0.55, fontFamily: 'Patrick Hand', marginTop: 1 },
  footer: { textAlign: 'center', fontSize: 11, color: colors.ink, opacity: 0.35, fontFamily: 'DM Mono', marginTop: 16 },
  // Account form
  profileSection: { alignItems: 'center', gap: 10, paddingTop: 10 },
  profileName: { fontSize: 22, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  profileEmail: { fontSize: 13, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  statBox: {
    flex: 1, backgroundColor: colors.card, borderRadius: 13,
    borderWidth: 1.5, borderColor: `${colors.ink}18`, padding: 13, alignItems: 'center',
  },
  statNum: { fontSize: 26, fontWeight: '800', color: colors.ink, fontFamily: 'Patrick Hand' },
  statLbl: { fontSize: 11, color: colors.ink, opacity: 0.55, fontFamily: 'Patrick Hand', marginTop: 2 },
  logoutBtn: {
    marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: `${colors.ink}22`,
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  form: { gap: 14, paddingTop: 8 },
  formTitle: { fontSize: 19, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand', textAlign: 'center' },
  formSub: { fontSize: 13, lineHeight: 19, color: colors.ink, opacity: 0.6, fontFamily: 'Patrick Hand', textAlign: 'center' },
  field: { gap: 5 },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: colors.ink, opacity: 0.5, fontFamily: 'DM Mono' },
  input: {
    fontSize: 15, color: colors.ink, backgroundColor: colors.card,
    borderWidth: 1.5, borderColor: `${colors.ink}22`, borderRadius: 12, padding: 12,
    fontFamily: 'Patrick Hand',
  },
  err: { fontSize: 12, color: '#c8324b', textAlign: 'center' },
  submitBtn: {
    backgroundColor: colors.accent, borderRadius: 13, padding: 14, alignItems: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Patrick Hand' },
  disclaimer: { fontSize: 10, color: colors.ink, opacity: 0.4, textAlign: 'center', fontFamily: 'DM Mono', letterSpacing: 0.2 },
  // Trophies
  trophyHero: {
    backgroundColor: colors.card, borderRadius: 20, padding: 22, alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#d6973a44', marginBottom: 6,
  },
  trophyName: { fontSize: 22, fontWeight: '800', color: colors.ink, fontFamily: 'Patrick Hand' },
  trophyBlurb: { fontSize: 13, color: colors.ink, opacity: 0.62, textAlign: 'center', fontFamily: 'Patrick Hand' },
  levelBadge: { backgroundColor: colors.ink, paddingHorizontal: 13, paddingVertical: 5, borderRadius: 999, marginTop: 6 },
  levelBadgeText: { color: colors.paper, fontSize: 12, fontWeight: '700', fontFamily: 'DM Mono', letterSpacing: 1 },
  tierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: '11px 13px' as any,
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: `${colors.ink}18`,
    paddingHorizontal: 13, paddingVertical: 11,
  },
  tierRowActive: { backgroundColor: '#d6973a22', borderColor: '#d6973a55' },
  tierRowDim: { opacity: 0.5 },
  tierName: { fontSize: 15, fontWeight: '700', color: colors.ink, fontFamily: 'Patrick Hand' },
  tierRange: { fontSize: 11, color: colors.ink, opacity: 0.5, fontFamily: 'DM Mono', letterSpacing: 0.4 },
  youBadge: {
    fontSize: 10, fontWeight: '700', color: '#c07e22', fontFamily: 'DM Mono', letterSpacing: 1,
    backgroundColor: '#d6973a33', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999,
  },
});
