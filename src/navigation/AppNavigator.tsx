import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AgencyDashboardScreen } from '../screens/AgencyDashboardScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { GroupProfileScreen } from '../screens/GroupProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { IdolProfileScreen } from '../screens/IdolProfileScreen';
import { IdolsScreen } from '../screens/IdolsScreen';
import { MarketScreen } from '../screens/MarketScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RecruitScreen } from '../screens/RecruitScreen';
import { ReleaseScreen } from '../screens/ReleaseScreen';
import { RivalsScreen } from '../screens/RivalsScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TrainingScreen } from '../screens/TrainingScreen';
import type { RootStackParamList } from './types';

const Tab = createBottomTabNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      backBehavior="history"
      screenOptions={{
        headerTitleAlign: 'center',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 13,
        },
        // Keep the router/tab structure, but hide default tabs because
        // the project already renders its own in-app navigation bar.
        tabBarStyle: { display: 'none' },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MainMenu" component={MainMenuScreen} />
      <Tab.Screen name="AgencyDashboard" component={AgencyDashboardScreen} />
      <Tab.Screen name="Idols" component={IdolsScreen} />
      <Tab.Screen name="IdolProfile" component={IdolProfileScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="GroupProfile" component={GroupProfileScreen} />
      <Tab.Screen name="Training" component={TrainingScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Rivals" component={RivalsScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Onboarding" component={OnboardingScreen} />
      <Tab.Screen name="Recruit" component={RecruitScreen} />
      <Tab.Screen name="Release" component={ReleaseScreen} />
    </Tab.Navigator>
  );
}

export default AppNavigator;
