import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { API_BASE } from '@/lib/api';
import { getMoreLinksForRole } from '@/lib/nav';
import { roleLabel } from '@/lib/roles';

export default function ProfileScreen() {
  const { user, logout, store, updateUser } = useSession();
  const [uploading, setUploading] = useState(false);
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const myOrders = (store.orders || []).filter(
    (o: any) => o.userId === user.id || o.buyerEmail === user.email,
  );

  const moreLinks = getMoreLinksForRole(user.role);

  async function pickPhoto(source: 'camera' | 'library') {
    try {
      const perm =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra/photos.');
        return;
      }
      const picker =
        source === 'camera'
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;
      const result = await picker({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]?.base64) return;
      const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setUploading(true);
      await updateUser({ avatar: dataUrl });
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de mettre à jour la photo');
    } finally {
      setUploading(false);
    }
  }

  function openAvatarMenu() {
    Alert.alert('Photo de profil', 'Choisissez une source', [
      { text: 'Prendre une photo', onPress: () => pickPhoto('camera') },
      { text: 'Depuis la galerie', onPress: () => pickPhoto('library') },
      ...(user?.avatar
        ? ([
            {
              text: 'Retirer la photo',
              style: 'destructive' as const,
              onPress: async () => {
                try {
                  setUploading(true);
                  await updateUser({ avatar: '' });
                } finally {
                  setUploading(false);
                }
              },
            },
          ])
        : []),
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  async function onLogout() {
    Alert.alert('Déconnexion', 'Quitter cette session ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Me déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Palette.green850, Palette.green700]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Pressable onPress={openAvatarMenu} style={styles.avatar} hitSlop={6}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            <View style={styles.avatarEdit}>
              {uploading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="camera" size={14} color="#ffffff" />
              )}
            </View>
          </Pressable>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={Palette.green850} />
            <Text style={styles.roleText}>{roleLabel(user.role)}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <Stat label="Commandes" value={String(myOrders.length)} />
          <Stat label="Organisation" value={user.organization || '—'} />
          <Stat label="Région" value={user.region || '—'} />
        </View>

        {moreLinks.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Mon espace {roleLabel(user.role)}</Text>
            <Card padded={false}>
              {moreLinks.map((link, i) => (
                <View key={link.key}>
                  {i > 0 ? <Divider /> : null}
                  <SettingRow
                    icon={link.icon}
                    label={link.label}
                    hint={link.description}
                    onPress={() => router.push(link.path as any)}
                  />
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Messagerie</Text>
        <Card padded={false}>
          <SettingRow
            icon="chatbubbles-outline"
            label="Messages"
            hint="Discussions avec vendeurs et acheteurs"
            onPress={() => router.push('/messages/' as any)}
          />
        </Card>

        <Text style={styles.sectionTitle}>Paramètres</Text>
        <Card padded={false}>
          <SettingRow
            icon="person-outline"
            label="Modifier mon profil"
            hint="Nom, téléphone, organisation, région"
            onPress={() => router.push('/edit-profile')}
          />
          <Divider />
          <SettingRow
            icon="qr-code-outline"
            label="Scanner un QR code"
            hint="Lot, produit ou commande"
            onPress={() => router.push('/scan')}
          />
          <Divider />
          <SettingRow
            icon="server-outline"
            label="Serveur & données"
            hint={API_BASE.replace(/^https?:\/\//, '')}
            onPress={() => router.push('/more/donnees')}
          />
        </Card>

        <Text style={styles.sectionTitle}>Aide</Text>
        <Card padded={false}>
          <SettingRow
            icon="information-circle-outline"
            label="À propos"
            hint="Équipe, partenaires, mission"
            onPress={() => router.push('/more/about')}
          />
          <Divider />
          <SettingRow
            icon="easel-outline"
            label="Mode présentation"
            hint="Cycle auto pour la démo jury"
            onPress={() => router.push('/pitch' as any)}
          />
          <Divider />
          <SettingRow
            icon="help-circle-outline"
            label="Centre d'aide"
            hint="FAQ, tutoriels, contact support"
            onPress={() => router.push('/help' as any)}
          />
          <Divider />
          <SettingRow
            icon="document-text-outline"
            label="Conditions & confidentialité"
            hint="CGU, politique de données, RGPD"
            onPress={() => router.push('/terms' as any)}
          />
        </Card>

        <Pressable onPress={onLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={18} color={Palette.coral600} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <Text style={styles.version}>FresCoop Mobile · v1.0 · POESAM 2026</Text>
        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  hint?: string;
  value?: string;
  onPress?: () => void;
}) {
  const Wrap: any = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={18} color={Palette.green850} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {hint ? <Text style={styles.settingHint}>{hint}</Text> : null}
      </View>
      {value ? (
        <Text style={styles.settingValue} numberOfLines={1}>
          {value}
        </Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={Palette.muted} />
      ) : null}
    </Wrap>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  scroll: { paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 8,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#ffffff', fontWeight: '900', fontSize: 26 },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.green700,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  email: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginTop: 6,
  },
  roleText: { color: Palette.green850, fontWeight: '900', fontSize: 12 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    padding: 12,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  statValue: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  statLabel: { fontSize: 10, fontWeight: '700', color: Palette.muted, marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, fontWeight: '700', color: Palette.ink },
  settingHint: { fontSize: 11, color: Palette.muted, marginTop: 2, fontWeight: '600' },
  settingValue: { fontSize: 12, color: Palette.muted, maxWidth: 180 },
  divider: { height: 1, backgroundColor: Palette.line, marginLeft: 60 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: Palette.coral100,
    paddingVertical: 14,
    borderRadius: Radius.pill,
  },
  logoutText: { color: Palette.coral600, fontWeight: '900', fontSize: 14 },
  version: {
    textAlign: 'center',
    color: Palette.muted,
    fontSize: 11,
    marginTop: 22,
  },
});
