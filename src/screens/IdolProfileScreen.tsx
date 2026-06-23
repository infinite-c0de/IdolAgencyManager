import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppShell, Card } from '../components/AppShell';
import { ProfileHero } from '../components/profile/ProfileHero';
import { ProfileTab } from '../components/profile/ProfileTab';
import { ProfileTabBar, ProfileTabKey } from '../components/profile/ProfileTabBar';
import { ScheduleTab } from '../components/profile/ScheduleTab';
import { SkillsTab } from '../components/profile/SkillsTab';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';
import { useGame } from '../state/GameContext';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function IdolProfileScreen({ route }: RootStackScreenProps<'IdolProfile'>) {
  const navigation = useNavigation<Nav>();
  const { idols, groups, trainingTypes, trainingPlans } = useGame();
  const idol = idols.find(x => x.id === route.params.id);
  const idolGroup = idol?.group ? groups.find(g => g.name === idol.group) : undefined;
  const [tab, setTab] = useState<ProfileTabKey>('profile');

  if (!idol) {
    return (
      <AppShell title="Not found">
        <Card>
          <Text style={styles.notFound}>This idol isn't on the roster.</Text>
        </Card>
      </AppShell>
    );
  }

  const groupLogoPreset =
    idolGroup?.logo?.kind === 'preset' ? idolGroup.logo.preset : undefined;

  const backBtn = (
    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
      <ChevronLeft size={14} color={colors.foreground} />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );

  return (
    <AppShell title={idol.stageName} action={backBtn}>

      <ProfileHero
        image={idol.image}
        stageName={idol.stageName}
        role={idol.role}
        status={idol.status}
        flag={idol.flag}
        health={idol.health}
        morale={idol.morale}
        energy={idol.energy}
        groupName={idolGroup?.name}
        groupLogoPreset={groupLogoPreset}
      />

      <ProfileTabBar tab={tab} onChange={setTab} />

      <View style={styles.tabContent}>
        {tab === 'profile' && (
          <ProfileTab
            idol={idol}
            idolGroup={idolGroup}
            onGroupPress={() => idolGroup && navigation.navigate('GroupProfile', { groupId: idolGroup.id })}
          />
        )}
        {tab === 'skills' && <SkillsTab idol={idol} />}
        {tab === 'schedule' && (
          <ScheduleTab
            idol={idol}
            idolGroup={idolGroup}
            trainingPlans={trainingPlans}
            trainingTypes={trainingTypes}
          />
        )}
      </View>

    </AppShell>
  );
}

const styles = StyleSheet.create({
  notFound: {
    fontSize: 14,
    color: colors.foreground,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.whiteA05,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backText: {
    fontSize: 11,
    color: colors.foreground,
  },
  tabContent: {
    marginTop: spacing.sm,
  },
});
