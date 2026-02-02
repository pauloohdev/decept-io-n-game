import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import type { GameState, Player, Card, Role, ClueCategory } from './types.tsx';
import { METHOD_CARDS, EVIDENCE_CARDS, CLUE_CARDS } from './cards.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Gerar código de sala aleatório
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Embaralhar array
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Distribuir papéis
function assignRoles(players: Player[]): Player[] {
  const shuffledPlayers = shuffle(players);
  const playerCount = shuffledPlayers.length;
  
  // Modo de teste: 1 jogador
  if (playerCount === 1) {
    return shuffledPlayers.map(player => ({
      ...player,
      role: 'murderer',
      hasCredential: true,
    }));
  }
  
  // 1 Perito, 1 Assassino, 0-1 Cúmplice (se >= 5 jogadores), resto Investigadores
  const roles: Role[] = ['forensic', 'murderer'];
  
  if (playerCount >= 5) {
    roles.push('accomplice');
  }
  
  while (roles.length < playerCount) {
    roles.push('investigator');
  }
  
  return shuffledPlayers.map((player, index) => ({
    ...player,
    role: roles[index],
    hasCredential: true, // Todos começam com credencial
  }));
}

// Criar nova sala
export async function createRoom(hostName: string): Promise<{ roomCode: string; playerId: string }> {
  const roomCode = generateRoomCode();
  const playerId = crypto.randomUUID();
  
  const initialState: GameState = {
    roomCode,
    phase: 'lobby',
    players: [{
      id: playerId,
      name: hostName,
      role: null,
      isHost: true,
      hasCredential: true,
    }],
    tableMethods: [],
    tableEvidences: [],
    murdererChoice: {
      methodId: null,
      evidenceId: null,
    },
    currentTurn: 0,
    cluesThisTurn: 0,
    cluesRequired: 0,
    forensicClues: [],
    guesses: [],
    winner: null,
    createdAt: Date.now(),
  };
  
  await kv.set(`room:${roomCode}`, initialState);
  return { roomCode, playerId };
}

// Entrar em sala
export async function joinRoom(roomCode: string, playerName: string): Promise<{ playerId: string; success: boolean }> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state) {
    return { playerId: '', success: false };
  }
  
  if (state.phase !== 'lobby') {
    return { playerId: '', success: false };
  }
  
  const playerId = crypto.randomUUID();
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    role: null,
    isHost: false,
    hasCredential: true,
  };
  
  state.players.push(newPlayer);
  await kv.set(`room:${roomCode}`, state);
  
  return { playerId, success: true };
}

// Iniciar jogo
export async function startGame(roomCode: string): Promise<boolean> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  // Modo de teste: permite 1+ jogadores
  if (!state || state.phase !== 'lobby' || state.players.length < 1) {
    return false;
  }
  
  // Distribuir papéis
  state.players = assignRoles(state.players);
  
  // Selecionar 4 cartas aleatórias de método e 4 de evidência para a mesa
  const shuffledMethods = shuffle(METHOD_CARDS);
  const shuffledEvidences = shuffle(EVIDENCE_CARDS);
  
  state.tableMethods = shuffledMethods.slice(0, 4);
  state.tableEvidences = shuffledEvidences.slice(0, 4);
  
  console.log('startGame - tableMethods:', state.tableMethods);
  console.log('startGame - tableEvidences:', state.tableEvidences);
  
  state.phase = 'murderer_selection';
  
  await kv.set(`room:${roomCode}`, state);
  return true;
}

// Assassino escolhe método e evidência
export async function setMurdererChoice(
  roomCode: string,
  playerId: string,
  methodId: string,
  evidenceId: string
): Promise<boolean> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state || state.phase !== 'murderer_selection') {
    return false;
  }
  
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.role !== 'murderer') {
    return false;
  }
  
  // Verificar se as cartas estão na mesa
  const methodExists = state.tableMethods.some(c => c.id === methodId);
  const evidenceExists = state.tableEvidences.some(c => c.id === evidenceId);
  
  if (!methodExists || !evidenceExists) {
    return false;
  }
  
  state.murdererChoice = { methodId, evidenceId };
  state.phase = 'playing';
  state.currentTurn = 1;
  state.cluesThisTurn = 0;
  state.cluesRequired = 2; // Turno 1: 2 pistas obrigatórias
  
  await kv.set(`room:${roomCode}`, state);
  return true;
}

// Perito adiciona pista
export async function addForensicClue(
  roomCode: string,
  playerId: string,
  category: ClueCategory,
  cardName: string
): Promise<boolean> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state || state.phase !== 'playing') {
    return false;
  }
  
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.role !== 'forensic') {
    return false;
  }
  
  // Verificar se a carta existe
  const clueExists = CLUE_CARDS.some(c => c.category === category && c.name === cardName);
  if (!clueExists) {
    return false;
  }
  
  // No turno 1, não pode repetir categoria nas 2 primeiras pistas
  if (state.currentTurn === 1 && state.cluesThisTurn === 1) {
    const firstClue = state.forensicClues[state.forensicClues.length - 1];
    if (firstClue && firstClue.category === category) {
      return false; // Categoria duplicada no turno 1
    }
  }
  
  state.forensicClues.push({ category, cardName, turnNumber: state.currentTurn });
  state.cluesThisTurn++;
  
  await kv.set(`room:${roomCode}`, state);
  return true;
}

// Perito finaliza turno (avança para próximo turno)
export async function finishTurn(roomCode: string, playerId: string): Promise<boolean> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state || state.phase !== 'playing') {
    return false;
  }
  
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.role !== 'forensic') {
    return false;
  }
  
  // Verificar se cumpriu o requisito de pistas
  if (state.cluesThisTurn < state.cluesRequired) {
    return false;
  }
  
  // Avançar turno
  state.currentTurn++;
  state.cluesThisTurn = 0;
  state.cluesRequired = 1; // A partir do turno 2, sempre 1 pista por turno
  
  await kv.set(`room:${roomCode}`, state);
  return true;
}

// Fazer palpite (acusação)
export async function makeGuess(
  roomCode: string,
  playerId: string,
  suspectId: string,
  methodId: string,
  evidenceId: string
): Promise<{ success: boolean; correct: boolean; gameOver: boolean; winner: string | null }> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state || state.phase !== 'playing') {
    return { success: false, correct: false, gameOver: false, winner: null };
  }
  
  const guesser = state.players.find(p => p.id === playerId);
  const suspect = state.players.find(p => p.id === suspectId);
  
  if (!guesser || !suspect) {
    return { success: false, correct: false, gameOver: false, winner: null };
  }
  
  // Verificar se tem credencial
  if (!guesser.hasCredential) {
    return { success: false, correct: false, gameOver: false, winner: null };
  }
  
  // Verificar se é investigador (perito não pode acusar)
  if (guesser.role === 'forensic') {
    return { success: false, correct: false, gameOver: false, winner: null };
  }
  
  // Buscar nomes das cartas
  const methodCard = state.tableMethods.find(c => c.id === methodId);
  const evidenceCard = state.tableEvidences.find(c => c.id === evidenceId);
  
  if (!methodCard || !evidenceCard) {
    return { success: false, correct: false, gameOver: false, winner: null };
  }
  
  // Verificar se está correto
  const correct = 
    suspect.role === 'murderer' &&
    state.murdererChoice.methodId === methodId &&
    state.murdererChoice.evidenceId === evidenceId;
  
  // Registrar palpite
  state.guesses.push({
    playerId,
    playerName: guesser.name,
    suspectId,
    suspectName: suspect.name,
    methodCard: methodCard.name,
    evidenceCard: evidenceCard.name,
    timestamp: Date.now(),
    correct,
  });
  
  if (correct) {
    // Vitória dos investigadores
    state.phase = 'game_over';
    state.winner = 'investigators';
    await kv.set(`room:${roomCode}`, state);
    return { success: true, correct: true, gameOver: true, winner: 'investigators' };
  }
  
  // Palpite incorreto - perde credencial
  guesser.hasCredential = false;
  
  // Verificar se todos os investigadores perderam suas credenciais
  const investigatorsWithCredential = state.players.filter(
    p => (p.role === 'investigator' || p.role === 'accomplice') && p.hasCredential
  );
  
  if (investigatorsWithCredential.length === 0) {
    // Todos perderam credenciais - assassino vence
    state.phase = 'game_over';
    state.winner = 'murderer';
    await kv.set(`room:${roomCode}`, state);
    return { success: true, correct: false, gameOver: true, winner: 'murderer' };
  }
  
  await kv.set(`room:${roomCode}`, state);
  return { success: true, correct: false, gameOver: false, winner: null };
}

// Reiniciar jogo (jogar novamente)
export async function restartGame(roomCode: string, hostId: string): Promise<boolean> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state) {
    return false;
  }
  
  // Verificar se é o host
  const host = state.players.find(p => p.id === hostId);
  if (!host || !host.isHost) {
    return false;
  }
  
  // Resetar para lobby mantendo jogadores
  state.phase = 'lobby';
  state.players = state.players.map(p => ({
    ...p,
    role: null,
    hasCredential: true,
  }));
  state.tableMethods = [];
  state.tableEvidences = [];
  state.murdererChoice = { methodId: null, evidenceId: null };
  state.currentTurn = 0;
  state.cluesThisTurn = 0;
  state.cluesRequired = 0;
  state.forensicClues = [];
  state.guesses = [];
  state.winner = null;
  
  await kv.set(`room:${roomCode}`, state);
  return true;
}

// Encerrar sala
export async function closeRoom(roomCode: string, hostId: string): Promise<boolean> {
  const state = await kv.get<GameState>(`room:${roomCode}`);
  
  if (!state) {
    return false;
  }
  
  const host = state.players.find(p => p.id === hostId);
  if (!host || !host.isHost) {
    return false;
  }
  
  await kv.del(`room:${roomCode}`);
  return true;
}

// Obter estado da sala
export async function getRoomState(roomCode: string): Promise<GameState | null> {
  return await kv.get<GameState>(`room:${roomCode}`);
}