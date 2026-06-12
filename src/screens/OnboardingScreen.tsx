import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import { InfoTag } from '../components/ui/InfoTag';
import { MetricCard } from '../components/ui/MetricCard';
import { MetricGrid } from '../components/ui/MetricGrid';
import { selectOnboardingCityData } from '../features/economy';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { createAgency, cities, isAgencyCreated } = useGame();
  const [agencyName, setAgencyName] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [city, setCity] = useState(cities[0].id);
  const onboardingData = selectOnboardingCityData(cities, city);

  useFocusEffect(
    useCallback(() => {
      if (!isAgencyCreated) {
        setAgencyName('');
        setCeoName('');
        setCity(cities[0].id);
      }
    }, [cities, isAgencyCreated]),
  );

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
    });
    if (created) {
      navigation.navigate('AgencyDashboard');
    }
  };

  return (
    <AppShell title="New Agency" subtitle="Build your idol empire" showMoreNavRow={false}>
      <Card glow="teal">
        <Text style={styles.sectionLabel}>IDENTITY</Text>
        <View style={styles.fields}>
          <Field label="Agency name" placeholder="Your agency name" value={agencyName} onChangeText={setAgencyName} />
          <Field label="CEO name" placeholder="Your name" value={ceoName} onChangeText={setCeoName} />
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
                <MetricGrid style={styles.tagRow}>
                  {cityCard.tags.map(tag => (
                    <InfoTag key={`${cityCard.id}-${tag.label}`} label={tag.label} value={tag.value} />
                  ))}
                </MetricGrid>
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
    </AppShell>
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
  tagRow: { marginTop: spacing.sm, justifyContent: 'space-between', rowGap: 4 },

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
});
