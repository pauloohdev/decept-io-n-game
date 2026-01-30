export type Role = 'forensic' | 'murderer' | 'accomplice' | 'investigator';

export type CardType = 'method' | 'evidence';

export type ClueCategory = 'location' | 'time' | 'weather' | 'condition' | 'relationship' | 'other';

export type GamePhase = 'lobby' | 'murderer_selection' | 'playing' | 'game_over';

export interface Card {
  id: string;
  type: CardType;
  name: string;
}

export interface ClueCard {
  id: string;
  category: ClueCategory;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  isHost: boolean;
  hasCredential: boolean;
}

export interface ClueMarker {
  category: ClueCategory;
  cardName: string;
  turnNumber: number;
}

export interface Guess {
  playerId: string;
  playerName: string;
  suspectId: string;
  suspectName: string;
  methodCard: string;
  evidenceCard: string;
  timestamp: number;
  correct: boolean;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  
  tableMethods: Card[];
  tableEvidences: Card[];
  
  murdererChoice: {
    methodId: string | null;
    evidenceId: string | null;
  };
  
  currentTurn: number;
  cluesThisTurn: number;
  cluesRequired: number;
  
  forensicClues: ClueMarker[];
  guesses: Guess[];
  
  winner: 'investigators' | 'murderer' | null;
  createdAt: number;
}
