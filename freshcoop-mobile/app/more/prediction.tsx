import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import {
  City,
  CountryGroup,
  Crop,
  MONTH_NAMES,
  Prediction,
  RiskAssessment,
  YieldPrediction,
  fetchCities,
  fetchCrops,
  fetchPrediction,
  fetchRisk,
  fetchYield,
  riskLabel,
  scoreTone,
} from '@/lib/agro';

const TONE_COLORS: Record<string, string> = {
  green: Palette.green700,
  blue: Palette.blue700,
  gold: Palette.gold600,
  coral: Palette.coral600,
};

export default function PredictionScreen() {
  const { user } = useSession();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [countries, setCountries] = useState<CountryGroup[]>([]);
  const [crop, setCrop] = useState('arachide');
  const [city, setCity] = useState('kaolack');

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [yieldData, setYieldData] = useState<YieldPrediction | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [picker, setPicker] = useState<'crop' | 'city' | null>(null);

  // Référentiels : le sélecteur est construit depuis l'API, donc toute option
  // proposée est calculable par le moteur.
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCrops(), fetchCities()])
      .then(([c, z]) => {
        if (cancelled) return;
        setCrops(c.data);
        setCountries(z.data);
      })
      .catch(() => {
        if (!cancelled) setError('Référentiels indisponibles. Vérifiez votre connexion.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Présélection de la zone depuis la région du compte.
  const didPreselect = useRef(false);
  useEffect(() => {
    if (didPreselect.current) return;
    const match = findCityForRegion(countries, user?.region);
    if (match) setCity(match);
    if (countries.length) didPreselect.current = true;
  }, [countries, user?.region]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setOffline(false);
    try {
      const p = await fetchPrediction(crop, city);
      setPrediction(p.data);
      let cached = p.fromCache;

      // Rendement et risque sont secondaires : leur échec ne doit pas masquer
      // la fenêtre de semis, qui est l'information principale de l'écran.
      const month = p.data.optimal?.month || new Date().getMonth() + 1;
      const [yRes, rRes] = await Promise.allSettled([
        fetchYield(crop, city, month),
        fetchRisk(crop, city, month),
      ]);
      const y = settled(yRes);
      const r = settled(rRes);
      setYieldData(y.data);
      setRisk(r.data);
      setOffline(cached || y.fromCache || r.fromCache);
    } catch (e: any) {
      setError(e?.message || 'Calcul impossible.');
      setPrediction(null);
      setYieldData(null);
      setRisk(null);
    } finally {
      setLoading(false);
    }
  }, [crop, city]);

  useEffect(() => {
    load();
  }, [load]);

  const cityLabel = useMemo(() => {
    for (const g of countries) {
      const f = g.cities.find((c) => c.id === city);
      if (f) return `${f.name} — ${f.area}`;
    }
    return city;
  }, [countries, city]);

  const cropLabel = crops.find((c) => c.id === crop)?.name || crop;

  const bars = (prediction?.timeline || []).map((t) => ({
    label: (t.monthName || '').slice(0, 4),
    value: t.score,
    color: t.month === prediction?.optimal?.month ? Palette.green700 : Palette.lineStrong,
  }));

  const ensemble = yieldData?.ensemble;
  const tons = ensemble ? (ensemble.predicted_yield_kg / 1000).toFixed(2) : null;
  const water = prediction?.optimal?.waterAnalysis;
  const waterPct = water ? Math.min(100, Math.round((water.expected / (water.needed || 1)) * 100)) : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Prédiction' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[Palette.green700, Palette.green850]} style={styles.hero}>
          <Text style={styles.kicker}>AIDE À LA DÉCISION</Text>
          <Text style={styles.heroTitle}>Quand semer ?</Text>
          <Text style={styles.heroSub}>
            Fenêtre de semis, bilan hydrique, risque et rendement estimé pour votre zone.
          </Text>
        </LinearGradient>

        <Card>
          <Text style={styles.sectionTitle}>Culture et zone</Text>
          <Pressable style={styles.select} onPress={() => setPicker('crop')}>
            <Ionicons name="leaf-outline" size={18} color={Palette.green700} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectLabel}>Culture</Text>
              <Text style={styles.selectValue}>{cropLabel}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={Palette.muted} />
          </Pressable>
          <Pressable style={styles.select} onPress={() => setPicker('city')}>
            <Ionicons name="location-outline" size={18} color={Palette.blue700} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectLabel}>Zone de production</Text>
              <Text style={styles.selectValue}>{cityLabel}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={Palette.muted} />
          </Pressable>

          {offline && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline-outline" size={15} color={Palette.gold600} />
              <Text style={styles.offlineText}>
                Données en cache — dernière analyse enregistrée sur cet appareil.
              </Text>
            </View>
          )}
        </Card>

        {loading && (
          <Card>
            <View style={styles.center}>
              <ActivityIndicator color={Palette.green700} />
              <Text style={styles.hint}>Calcul en cours…</Text>
            </View>
          </Card>
        )}

        {!loading && !!error && (
          <Card>
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={26} color={Palette.coral600} />
              <Text style={styles.errorTitle}>Calcul indisponible</Text>
              <Text style={styles.hint}>{error}</Text>
              <Pressable style={styles.retry} onPress={load}>
                <Ionicons name="refresh" size={16} color="#ffffff" />
                <Text style={styles.retryText}>Réessayer</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {!loading && !error && prediction && (
          <>
            <View style={styles.kpiRow}>
              <Kpi
                icon="calendar-outline"
                tint={Palette.green700}
                label="Meilleur mois"
                value={prediction.optimal?.monthName || '—'}
              />
              <Kpi
                icon="speedometer-outline"
                tint={TONE_COLORS[scoreTone(prediction.optimal?.score ?? 0)]}
                label="Score conditions"
                value={`${prediction.optimal?.score ?? 0}/100`}
              />
            </View>
            <View style={styles.kpiRow}>
              <Kpi
                icon="water-outline"
                tint={Palette.blue700}
                label="Besoin en eau"
                value={`${prediction.cropInfo?.waterNeeds ?? 0} mm`}
              />
              <Kpi
                icon="thermometer-outline"
                tint={Palette.gold600}
                label="Temp. optimale"
                value={`${prediction.cropInfo?.optimalTemp ?? 0} °C`}
              />
            </View>

            <Card>
              <Text style={styles.sectionTitle}>Fenêtre de semis sur 6 mois</Text>
              <Text style={styles.hint}>
                {cropLabel} à {cityLabel} — zone {prediction.zone}. Plus le score est haut, plus les
                conditions sont favorables.
              </Text>
              <View style={{ marginTop: 14 }}>
                <BarChart bars={bars} max={100} height={150} />
              </View>
              <View style={{ gap: 8, marginTop: 8 }}>
                {(prediction.timeline || []).map((t) => (
                  <View
                    key={t.month}
                    style={[styles.monthRow, t.month === prediction.optimal?.month && styles.monthBest]}>
                    <Text style={styles.monthName}>{t.monthName}</Text>
                    <View
                      style={[
                        styles.scorePill,
                        { backgroundColor: TONE_COLORS[scoreTone(t.score)] },
                      ]}>
                      <Text style={styles.scorePillText}>{t.score}</Text>
                    </View>
                    <Text style={styles.monthAdvice} numberOfLines={2}>
                      {t.recommendation?.text}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            {water && (
              <Card>
                <Text style={styles.sectionTitle}>Bilan hydrique</Text>
                <View style={styles.meterHead}>
                  <Text style={styles.hint}>
                    {water.expected} mm attendus sur {water.needed} mm nécessaires
                  </Text>
                  <Text style={styles.meterPct}>{waterPct}%</Text>
                </View>
                <View style={styles.meterTrack}>
                  <View
                    style={[
                      styles.meterFill,
                      {
                        width: `${waterPct}%`,
                        backgroundColor: water.irrigationNeeded ? Palette.gold600 : Palette.green700,
                      },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.notice,
                    {
                      backgroundColor: water.irrigationNeeded ? Palette.gold100 : Palette.green100,
                    },
                  ]}>
                  <Ionicons
                    name={water.irrigationNeeded ? 'water' : 'rainy-outline'}
                    size={18}
                    color={water.irrigationNeeded ? Palette.gold600 : Palette.green700}
                  />
                  <Text style={styles.noticeText}>
                    {water.irrigationNeeded
                      ? `Irrigation nécessaire : ${water.deficit} mm manquants. Prévoyez un appoint ou une variété à cycle plus court.`
                      : 'La pluie attendue couvre les besoins du cycle. Surveillez les poches de sécheresse.'}
                  </Text>
                </View>
              </Card>
            )}

            <Card>
              <Text style={styles.sectionTitle}>Risques identifiés</Text>
              <View style={{ gap: 8, marginTop: 4 }}>
                {(prediction.optimal?.risks || []).length ? (
                  prediction.optimal.risks.map((r) => (
                    <View
                      key={r.type}
                      style={[
                        styles.risk,
                        {
                          borderLeftColor:
                            r.severity === 'high' ? Palette.coral600 : Palette.gold600,
                          backgroundColor:
                            r.severity === 'high' ? Palette.coral100 : Palette.gold100,
                        },
                      ]}>
                      <Text style={styles.riskTitle}>{riskLabel(r.type)}</Text>
                      <Text style={styles.riskDetail}>{r.detail}</Text>
                    </View>
                  ))
                ) : (
                  <View
                    style={[
                      styles.risk,
                      { borderLeftColor: Palette.green700, backgroundColor: Palette.green100 },
                    ]}>
                    <Text style={styles.riskTitle}>Aucun risque majeur</Text>
                    <Text style={styles.riskDetail}>
                      Les conditions du mois optimal restent dans les tolérances de la culture.
                    </Text>
                  </View>
                )}
              </View>

              {risk && (
                <View style={styles.bayes}>
                  <Text style={styles.subTitle}>
                    Réseau bayésien — sécurité {risk.safetyScore}/100
                  </Text>
                  <Text style={styles.hint}>{risk.recommendation}</Text>
                  <View style={styles.factorGrid}>
                    <Factor label="Sécheresse" value={risk.factors?.drought_probability} />
                    <Factor label="Stress thermique" value={risk.factors?.heat_stress_probability} />
                    <Factor label="Ravageurs" value={risk.factors?.pest_pressure_probability} />
                    <Factor label="Inondation" value={risk.factors?.flood_risk_probability} />
                  </View>
                </View>
              )}
            </Card>

            <Card>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Rendement estimé</Text>
                {!!ensemble && (
                  <Pressable onPress={() => setShowModel((v) => !v)}>
                    <Text style={styles.link}>{showModel ? 'Masquer' : 'Détail modèle'}</Text>
                  </Pressable>
                )}
              </View>

              {ensemble ? (
                <>
                  <Text style={styles.yieldValue}>{tons} t/ha</Text>
                  <Text style={styles.hint}>
                    Semis en {MONTH_NAMES[yieldData!.sowMonth] || '—'}.{' '}
                    {ensemble.confidence_interval
                      ? `Intervalle 90% : ${ensemble.confidence_interval.low} – ${ensemble.confidence_interval.high} kg.`
                      : ''}{' '}
                    Précision validée {ensemble.accuracy} sur {ensemble.training_samples}{' '}
                    observations.
                  </Text>
                  <View style={styles.badgeRow}>
                    <Badge
                      icon={
                        yieldData!.weather_source === 'openweathermap' ? 'partly-sunny' : 'analytics'
                      }
                      text={
                        yieldData!.weather_source === 'openweathermap'
                          ? 'Météo temps réel'
                          : 'Moyennes climatiques'
                      }
                    />
                    <Badge icon="git-compare-outline" text={`Accord ${ensemble.model_agreement}`} />
                  </View>

                  {showModel && (
                    <View style={styles.modelBox}>
                      <ModelRow
                        label="Régression ridge"
                        value={`${yieldData!.regression?.predicted_yield_kg ?? '—'} kg/ha`}
                      />
                      <ModelRow label="R² ajusté" value={yieldData!.regression?.adj_r_squared ?? '—'} />
                      <ModelRow label="RMSE" value={`${yieldData!.regression?.rmse ?? '—'} kg`} />
                      <ModelRow
                        label={`KNN (k=${yieldData!.knn?.k ?? '—'})`}
                        value={`${yieldData!.knn?.predicted_yield_kg ?? '—'} kg/ha`}
                      />
                      <ModelRow label="Confiance KNN" value={yieldData!.knn?.confidence ?? '—'} />
                      <ModelRow label="Erreur croisée" value={ensemble.cv_mape} />
                      <Text style={[styles.hint, { marginTop: 8 }]}>
                        {ensemble.method}. {ensemble.scope}.
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.hint}>
                  Le modèle n&apos;a pas assez d&apos;observations pour cette combinaison culture / zone.
                </Text>
              )}
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>Variétés recommandées</Text>
              <View style={{ gap: 10, marginTop: 4 }}>
                {(prediction.recommendedVarieties || []).map((v) => (
                  <View key={v.name} style={styles.variety}>
                    <View style={styles.varietyIcon}>
                      <Ionicons name="nutrition-outline" size={16} color={Palette.green700} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.varietyName}>{v.name}</Text>
                      <Text style={styles.varietyMeta}>
                        Cycle {v.cycle} j · {v.yield} · zone {v.zone}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={[styles.hint, { marginTop: 12 }]}>
                Cycle de la culture : {prediction.cropInfo?.cycleDays} jours. Vérifiez la
                disponibilité des semences certifiées ISRA auprès de votre coopérative.
              </Text>
            </Card>
          </>
        )}
      </ScrollView>

      <PickerModal
        visible={picker === 'crop'}
        title="Choisir une culture"
        onClose={() => setPicker(null)}
        options={crops.map((c) => ({ id: c.id, label: c.name, sub: `Cycle ${c.cycleDays} jours` }))}
        selected={crop}
        onSelect={(id) => {
          setCrop(id);
          setPicker(null);
        }}
      />
      <PickerModal
        visible={picker === 'city'}
        title="Choisir une zone"
        onClose={() => setPicker(null)}
        groups={countries}
        selected={city}
        onSelect={(id) => {
          setCity(id);
          setPicker(null);
        }}
      />
    </>
  );
}

function Kpi({
  icon,
  tint,
  label,
  value,
}: Readonly<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
  label: string;
  value: string;
}>) {
  return (
    <Card style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </Card>
  );
}

function Factor({ label, value }: Readonly<{ label: string; value?: string }>) {
  return (
    <View style={styles.factor}>
      <Text style={styles.factorLabel}>{label}</Text>
      <Text style={styles.factorValue}>{value || '—'}</Text>
    </View>
  );
}

function Badge({
  icon,
  text,
}: Readonly<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
}>) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={13} color={Palette.green850} />
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function ModelRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.modelRow}>
      <Text style={styles.modelLabel}>{label}</Text>
      <Text style={styles.modelValue}>{value}</Text>
    </View>
  );
}

function PickerModal({
  visible,
  title,
  onClose,
  options,
  groups,
  selected,
  onSelect,
}: Readonly<{
  visible: boolean;
  title: string;
  onClose: () => void;
  options?: { id: string; label: string; sub?: string }[];
  groups?: CountryGroup[];
  selected: string;
  onSelect: (id: string) => void;
}>) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={Palette.muted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {options?.map((o) => (
            <Option
              key={o.id}
              label={o.label}
              sub={o.sub}
              active={o.id === selected}
              onPress={() => onSelect(o.id)}
            />
          ))}
          {groups?.map((g) => (
            <View key={g.country}>
              <Text style={styles.groupTitle}>{g.label}</Text>
              {g.cities.map((c: City) => (
                <Option
                  key={c.id}
                  label={c.name}
                  sub={c.area}
                  active={c.id === selected}
                  onPress={() => onSelect(c.id)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Option({
  label,
  sub,
  active,
  onPress,
}: Readonly<{
  label: string;
  sub?: string;
  active: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable style={[styles.option, active && styles.optionActive]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, active && { color: Palette.green850 }]}>{label}</Text>
        {!!sub && <Text style={styles.optionSub}>{sub}</Text>}
      </View>
      {active && <Ionicons name="checkmark-circle" size={20} color={Palette.green700} />}
    </Pressable>
  );
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function settled<T>(
  result: PromiseSettledResult<{ data: T; fromCache: boolean }>,
): { data: T | null; fromCache: boolean } {
  if (result.status === 'fulfilled') {
    return { data: result.value.data, fromCache: result.value.fromCache };
  }
  return { data: null, fromCache: false };
}

/** Rapproche la région déclarée du compte d'une zone du référentiel. */
function findCityForRegion(countries: CountryGroup[], region?: string): string | null {
  if (!countries.length || !region) return null;
  const target = normalize(String(region));
  const match = countries
    .flatMap((g) => g.cities)
    .find((c) => normalize(c.name) === target || target.includes(normalize(c.name)));
  return match?.id ?? null;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  hero: { padding: 22, borderRadius: Radius.lg, gap: 4 },
  kicker: { color: Palette.gold600, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heroTitle: { color: '#ffffff', fontSize: 30, fontWeight: '900', letterSpacing: -0.6, marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },

  sectionTitle: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginBottom: 10 },
  subTitle: { fontSize: 13, fontWeight: '900', color: Palette.ink, marginBottom: 6 },
  hint: { color: Palette.muted, fontSize: 12, lineHeight: 17 },
  link: { color: Palette.green700, fontWeight: '900', fontSize: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center', gap: 8, paddingVertical: 10 },
  errorTitle: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.green700,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    marginTop: 6,
  },
  retryText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },

  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Palette.line,
    borderRadius: Radius.md,
    backgroundColor: Palette.paper,
    marginBottom: 10,
  },
  selectLabel: {
    fontSize: 10,
    color: Palette.muted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectValue: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginTop: 2 },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.gold100,
    padding: 10,
    borderRadius: Radius.sm,
  },
  offlineText: { flex: 1, fontSize: 11, color: Palette.ink2, fontWeight: '700', lineHeight: 15 },

  kpiRow: { flexDirection: 'row', gap: 12 },
  kpi: { flex: 1, gap: 4 },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: { fontSize: 10, color: Palette.muted, fontWeight: '800', textTransform: 'uppercase' },
  kpiValue: { fontSize: 17, fontWeight: '900', color: Palette.ink, letterSpacing: -0.3 },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    backgroundColor: Palette.paper,
  },
  monthBest: { backgroundColor: Palette.green100 },
  monthName: { width: 76, fontSize: 12, fontWeight: '900', color: Palette.ink },
  scorePill: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999, minWidth: 34, alignItems: 'center' },
  scorePillText: { color: '#ffffff', fontWeight: '900', fontSize: 11 },
  monthAdvice: { flex: 1, fontSize: 10, color: Palette.muted, fontWeight: '700', lineHeight: 14 },

  meterHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  meterPct: { fontWeight: '900', color: Palette.ink, fontSize: 14 },
  meterTrack: {
    height: 10,
    backgroundColor: Palette.wash,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  meterFill: { height: '100%', borderRadius: 999 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  noticeText: { flex: 1, fontSize: 12, color: Palette.ink2, lineHeight: 17, fontWeight: '600' },

  risk: { borderLeftWidth: 4, padding: 10, borderRadius: Radius.sm, gap: 2 },
  riskTitle: { fontSize: 12, fontWeight: '900', color: Palette.ink },
  riskDetail: { fontSize: 11, color: Palette.muted, lineHeight: 15 },

  bayes: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: Palette.line },
  factorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  factor: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: Palette.paper,
    padding: 10,
    borderRadius: Radius.sm,
  },
  factorLabel: { fontSize: 10, color: Palette.muted, fontWeight: '800' },
  factorValue: { fontSize: 14, fontWeight: '900', color: Palette.ink, marginTop: 2 },

  yieldValue: {
    fontSize: 34,
    fontWeight: '900',
    color: Palette.green850,
    letterSpacing: -1,
    marginBottom: 4,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Palette.green100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: Palette.green850 },
  modelBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.line,
    borderStyle: 'dashed',
    gap: 6,
  },
  modelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modelLabel: { fontSize: 11, color: Palette.muted, fontWeight: '700' },
  modelValue: { fontSize: 11, color: Palette.ink, fontWeight: '900' },

  variety: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  varietyIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  varietyName: { fontSize: 13, fontWeight: '900', color: Palette.ink },
  varietyMeta: { fontSize: 11, color: Palette.muted, marginTop: 1 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(7,27,20,0.45)' },
  modalSheet: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '72%',
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '900', color: Palette.ink },
  groupTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
  },
  optionActive: { backgroundColor: Palette.green100 },
  optionLabel: { fontSize: 14, fontWeight: '800', color: Palette.ink },
  optionSub: { fontSize: 11, color: Palette.muted, marginTop: 1 },
});
