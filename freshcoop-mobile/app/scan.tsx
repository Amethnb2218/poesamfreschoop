import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { store } = useSession();

  function onScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);

    // Heuristique: le QR peut être un ID produit, un ID lot ou une URL
    const raw = String(data || '').trim();
    const idPart = raw.includes('/') ? raw.split('/').pop() || raw : raw;

    const product = (store.products || []).find(
      (p: any) => p.id === idPart || p.reference === idPart,
    );
    if (product) {
      router.replace({ pathname: '/product/[id]', params: { id: product.id } });
      return;
    }
    const lot = (store.lots || []).find(
      (l: any) => l.id === idPart || l.reference === idPart,
    );
    if (lot) {
      // pas d'écran détail lot — on redirige vers la liste pour l'instant
      router.replace('/(tabs)/lots');
      return;
    }
    const order = (store.orders || []).find(
      (o: any) => o.id === idPart || o.reference === idPart,
    );
    if (order) {
      router.replace({ pathname: '/order/[id]', params: { id: order.id } });
      return;
    }

    // Rien trouvé
    setTimeout(() => setScanned(false), 1500);
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="qr-code-outline" size={64} color={Palette.green700} />
          <Text style={styles.title}>Autoriser la caméra</Text>
          <Text style={styles.text}>
            Nous utilisons la caméra pour scanner les QR codes des lots, produits et commandes.
          </Text>
          <Button label="Autoriser" onPress={requestPermission} />
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : onScanned}
      />
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.reticle} />
        <Text style={styles.hint}>Scannez un QR code FresCoop</Text>
      </View>
      <Pressable onPress={() => router.back()} style={styles.close} hitSlop={14}>
        <Ionicons name="close" size={24} color="#ffffff" />
      </Pressable>
      {scanned ? (
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Code non reconnu…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  title: { fontSize: 20, fontWeight: '900', color: Palette.ink },
  text: { color: Palette.muted, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  reticle: {
    width: 240,
    height: 240,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  hint: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  close: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: Palette.coral600,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  notFoundText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
});
