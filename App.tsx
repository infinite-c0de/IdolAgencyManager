import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GameProvider, useGame } from './src/state/GameContext';

function AppRoot() {
  const { isHydrated } = useGame();
  if (!isHydrated) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

function App() {
  return (
    <GameProvider>
      <AppRoot />
    </GameProvider>
  );
}

export default App;