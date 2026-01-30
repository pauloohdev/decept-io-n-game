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
  hasCredential: boolean; // Sistema de credenciais
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
  
  // Cartas visíveis a todos
  tableMethods: Card[]; // 4 cartas de método (assassino escolhe 1)
  tableEvidences: Card[]; // 4 cartas de evidência (assassino escolhe 1)
  
  // Escolha secreta do assassino
  murdererChoice: {
    methodId: string | null;
    evidenceId: string | null;
  };
  
  // Sistema de turnos
  currentTurn: number;
  cluesThisTurn: number; // Quantas pistas o perito deu neste turno
  cluesRequired: number; // Quantas pistas são obrigatórias neste turno (2 no turno 1, 1 depois)
  
  // Pistas do perito
  forensicClues: ClueMarker[];
  
  // Palpites dos jogadores
  guesses: Guess[];
  
  winner: 'investigators' | 'murderer' | null;
  createdAt: number;
}
