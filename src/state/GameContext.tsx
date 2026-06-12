import React, { createContext, ReactNode, useContext } from 'react';
import { type GameState, type SaveSlot, useGameState } from './useGameState';

const GameContext = createContext<GameState | null>(null);

export type { SaveSlot };

export function GameProvider({ children }: { children: ReactNode }) {
  const value = useGameState();
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
