import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { Gradient } from '../components/ui/Gradient';
import type { RootStackParamList } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { createAgency, cities } = useGame();
  const [agencyName, setAgencyName] = useState('Starlight Entertainment');
  const [ceoName, setCeoName] = useState('Park J.');
  const [city, setCity] = useState(cities[0].id);
  const picked = cities.find(c => c.id === city) ?? cities[0];

  const handleCreateAgency = () => {
    if (!agencyName.trim()) {
      Alert.alert('Agency name required', 'Please enter your agency name before continuing.');
      return;
    }
    if (!ceoName.trim()) {
      Alert.alert('CEO name required', 'Please enter your CEO name before continuing.');
      return;
    }

    createAgency({
      agencyName,
      ceoName,
      cityId: city,
    });
    navigation.navigate('AgencyDashboard');
  };

  return (
    <AppShell title="New Agency" subtitle="Build your idol empire">
      <Card glow="teal">
        <Text style={styles.sectionLabel}>IDENTITY</Text>
        <View style={styles.fields}>
          <Field label="Agency name" placeholder="STARLIGHT ENTERTAINMENT" value={agencyName} onChangeText={setAgencyName} />
          <Field label="CEO name" placeholder="Your name" value={ceoName} onChangeText={setCeoName} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>STARTING CITY</Text>
        <View style={styles.cityGrid}>
          {cities.map(c => {
            const active = city === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCity(c.id)}
                style={[styles.cityCard, active ? styles.cityActive : styles.cityIdle]}
                activeOpacity={0.85}>
                <View style={styles.rowBetween}>
                  <View style={styles.cityNameRow}>
                    <Text style={styles.cityFlag}>{c.flag}</Text>
                    <Text style={styles.cityName} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </View>
                  <View style={styles.diffBadge}>
                    <Text style={styles.diffText}>{c.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.cityDesc}>{c.desc}</Text>
                <View style={styles.tagRow}>
                  <Tag k="Fan" v={`x${c.fan}`} />
                  <Tag k="Cost" v={`x${c.cost}`} />
                  <Tag k="Rev" v={`x${c.revenue}`} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card glow="violet">
        <Text style={styles.sectionLabel}>PREVIEW · {picked.name.toUpperCase()}</Text>
        <View style={styles.previewRow}>
          <P k="Budget" v={picked.budget} />
          <P k="Reputation" v="50" />
          <P k="Difficulty" v={picked.difficulty} />
          <P k="Competition" v={`${picked.competition}%`} />
        </View>
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

function Tag({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagK}>
        {k} <Text style={styles.tagV}>{v}</Text>
      </Text>
    </View>
  );
}

function P({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.preview}>
      <Text style={styles.tinyMuted}>{k}</Text>
      <Text style={styles.previewVal}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tinyMuted: { fontSize: 10, color: colors.mutedForeground },
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
  tagRow: { marginTop: spacing.sm, flexDirection: 'row', gap: 4 },
  tag: { flex: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, paddingHorizontal: 6, paddingVertical: 4 },
  tagK: { fontSize: 10, color: colors.mutedForeground },
  tagV: { fontWeight: '700', color: colors.foreground },

  previewRow: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preview: { flexGrow: 1, flexBasis: '46%', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.whiteA05, padding: 10 },
  previewVal: { fontSize: 14, fontWeight: '700', color: colors.foreground },

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
