import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, ImagePlus, Sparkles } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/AppShell';
import { AgencyLogoMark } from '../components/ui/AgencyLogoMark';
import { Gradient } from '../components/ui/Gradient';
import { InfoTag } from '../components/ui/InfoTag';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricGrid } from '../components/ui/MetricGrid';
import { agencyLogoPresets } from '../features/agency';
import { selectOnboardingCityData } from '../features/economy';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import type { AgencyLogo } from '../types';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const LOGO_CELL_SIZE = 60;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { createAgency, cities, isAgencyCreated } = useGame();
  const [agencyName, setAgencyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [city, setCity] = useState(cities[0].id);
  const [logo, setLogo] = useState<AgencyLogo>(() => ({
    kind: 'preset',
    preset: agencyLogoPresets[0].id,
  }));
  const onboardingData = selectOnboardingCityData(cities, city);

  useFocusEffect(
    useCallback(() => {
      if (!isAgencyCreated) {
        setAgencyName('');
        setCeoName('');
        setCity(cities[0].id);
        setLogo({ kind: 'preset', preset: agencyLogoPresets[0].id });
      }
    }, [cities, isAgencyCreated]),
  );

  const handleImportLogo = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: true,
      quality: 0.9,
    });

    if (result.didCancel) {
      return;
    }
    const asset = result.assets?.[0];
    const uri = asset?.base64
      ? `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`
      : asset?.uri;
    if (!uri) {
      Alert.alert('Import failed', 'Could not load this image. Please try another file.');
      return;
    }
    setLogo({ kind: 'custom', uri });
  };

  const handleCreateAgency = () => {
    if (!agencyName.trim()) {
      Alert.alert('Agency name required', 'Please enter your agency name before continuing.');
      return;
    }
    if (!ceoName.trim()) {
      Alert.alert('CEO name required', 'Please enter your CEO name before continuing.');
      return;
    }

    const created = createAgency({
      agencyName,
      ceoName,
      cityId: city,
      logo,
    });
    if (created) {
      navigation.navigate('AgencyDashboard');
    }
  };

  return (
    <Gradient colors={[colors.bgTop, colors.bgBottom]} direction="to-b" style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>New Agency</Text>
          <Text style={styles.pageSubtitle}>Build your idol empire</Text>
        </View>

        <Card glow="teal">
          <Text style={styles.sectionLabel}>IDENTITY</Text>
          <View style={styles.fields}>
            <Field label="Agency name" placeholder="Your agency name" value={agencyName} onChangeText={setAgencyName} />
            <Field label="CEO name" placeholder="Your name" value={ceoName} onChangeText={setCeoName} />
          </View>
        </Card>

        <Card>
          <View style={styles.logoHeader}>
            <Text style={styles.sectionLabel}>AGENCY LOGO</Text>
            <TouchableOpacity
              onPress={handleImportLogo}
              style={[
                styles.importLogoButton,
                logo.kind === 'custom' ? styles.logoPresetActive : styles.logoPresetIdle,
              ]}
              activeOpacity={0.85}>
              {logo.kind === 'custom' ? (
                <Image source={{ uri: logo.uri }} resizeMode="cover" style={styles.importLogoPreview} />
              ) : (
                <ImagePlus size={16} color={colors.tealBright} />
              )}
              <Text style={styles.importLogoTitle}>Import Image</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logoGrid}>
          {agencyLogoPresets.map(preset => {
            const active = logo.kind === 'preset' && logo.preset === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => setLogo({ kind: 'preset', preset: preset.id })}
                style={[styles.logoPreset, active ? styles.logoPresetActive : styles.logoPresetIdle]}
                activeOpacity={0.85}>
                <AgencyLogoMark preset={preset.id} size={58} />
              </TouchableOpacity>
            );
          })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>STARTING CITY</Text>
          <View style={styles.cityGrid}>
            {onboardingData.cityCards.map(cityCard => {
              const active = onboardingData.selectedCityId === cityCard.id;
              return (
                <TouchableOpacity
                  key={cityCard.id}
                  onPress={() => setCity(cityCard.id)}
                  style={[styles.cityCard, active ? styles.cityActive : styles.cityIdle]}
                  activeOpacity={0.85}>
                  <View style={styles.rowBetween}>
                    <View style={styles.cityNameRow}>
                      <Text style={styles.cityFlag}>{cityCard.flag}</Text>
                      <Text style={styles.cityName} numberOfLines={1}>
                        {cityCard.name}
                      </Text>
                    </View>
                    <View style={styles.diffBadge}>
                      <Text style={styles.diffText}>{cityCard.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={styles.cityDesc}>{cityCard.description}</Text>
                  <View style={styles.tagGrid}>
                    {[0, 2].map(startIndex => (
                      <View key={`${cityCard.id}-tag-row-${startIndex}`} style={styles.tagGridRow}>
                        {cityCard.tags.slice(startIndex, startIndex + 2).map(tag => (
                          <InfoTag
                            key={`${cityCard.id}-${tag.label}`}
                            label={tag.label}
                            value={tag.value}
                            style={styles.cityTag}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card glow="violet">
          <Text style={styles.sectionLabel}>PREVIEW · {onboardingData.selectedCityName.toUpperCase()}</Text>
          <MetricGrid style={styles.previewRow}>
            {onboardingData.previewMetrics.map(metric => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </MetricGrid>
          <TouchableOpacity onPress={handleCreateAgency} activeOpacity={0.85}>
            <Gradient colors={[colors.teal, colors.violet]} direction="to-r" style={styles.createBtn}>
              <Sparkles size={16} color={colors.slate900} />
              <Text style={styles.createText}> Create Agency </Text>
              <ChevronRight size={16} color={colors.slate900} />
            </Gradient>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </Gradient>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, gap: spacing.xl },
  pageHeader: { paddingHorizontal: spacing.xs },
  pageTitle: {
    color: colors.tealBright,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pageSubtitle: { marginTop: 2, fontSize: 12, color: colors.mutedForeground },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: colors.foreground },

  fields: { marginTop: spacing.md, gap: spacing.md },
  fieldLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.mutedForeground },
  fieldInput: {
    marginTop: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
  },

  cityGrid: { marginTop: spacing.md, gap: spacing.sm },
  cityCard: { borderRadius: radius['2xl'], borderWidth: 1, padding: spacing.md },
  cityIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  cityActive: { borderColor: 'rgba(34,211,238,0.6)', backgroundColor: 'rgba(34,211,238,0.06)' },
  cityNameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, gap: 6 },
  cityFlag: { fontSize: 18 },
  cityName: { fontSize: 18, fontWeight: '700', color: colors.foreground, flexShrink: 1 },
  diffBadge: { borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  diffText: { fontSize: 10, color: colors.foreground },
  cityDesc: { marginTop: 4, fontSize: 11, color: colors.mutedForeground },
  tagGrid: { marginTop: spacing.sm, gap: 6 },
  tagGridRow: { flexDirection: 'row', gap: 6 },
  cityTag: { flex: 1, width: undefined },

  previewRow: { marginTop: spacing.md },

  createBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  createText: { fontSize: 14, fontWeight: '700', color: colors.slate900 },
  logoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  logoGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logoPreset: {
    width: LOGO_CELL_SIZE,
    height: LOGO_CELL_SIZE,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoPresetIdle: { borderColor: colors.border, backgroundColor: colors.whiteA05 },
  logoPresetActive: {
    borderColor: 'rgba(34,211,238,0.6)',
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  importLogoButton: {
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.whiteA05,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  importLogoPreview: { width: 18, height: 18, borderRadius: radius.sm },
  importLogoTitle: { fontSize: 11, color: colors.foreground, fontWeight: '700' },
});
