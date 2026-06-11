import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Home: undefined;
  Idols: undefined;
  IdolProfile: { id: string };
  Groups: undefined;
  Training: undefined;
  Schedule: undefined;
  Market: undefined;
  Rivals: undefined;
  Finance: undefined;
  Settings: undefined;
  Onboarding: undefined;
  Recruit: undefined;
  Release: undefined;
};

export type MainTabParamList = RootStackParamList;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  BottomTabScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
