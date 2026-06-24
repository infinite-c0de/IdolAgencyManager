import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { idols, groups, trainingTypes, trainingPlans, renewContract, currentWeek } = useGame();
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
            currentWeek={currentWeek}
            onGroupPress={() => idolGroup && navigation.navigate('GroupProfile', { groupId: idolGroup.id })}
            onRenewContract={() => {
              const cost = Math.max(5_000_000, Math.min(50_000_000, Math.round(idol.popularity * 500_000)));
              Alert.alert(
                'Renew Contract',
                `Renew ${idol.stageName}'s contract for 1 year?\nCost: ₩${(cost / 1_000_000).toFixed(1)}M`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Renew',
                    onPress: () => {
                      const result = renewContract(idol.id);
                      if (!result.ok) {
                        Alert.alert(
                          'Cannot Renew',
                          result.reason === 'INSUFFICIENT_FUNDS'
                            ? 'Insufficient funds to renew this contract.'
                            : 'Something went wrong.',
                        );
                      }
                    },
                  },
                ],
              );
            }}
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
