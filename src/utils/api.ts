import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { GameState, ClueCategory } from '@/types/game';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dd9aacbd`;

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export async function createRoom(hostName: string): Promise<{ roomCode: string; playerId: string }> {
  return apiCall('/room/create', {
    method: 'POST',
    body: JSON.stringify({ hostName }),
  });
}

export async function joinRoom(roomCode: string, playerName: string): Promise<{ playerId: string; success: boolean }> {
  return apiCall('/room/join', {
    method: 'POST',
    body: JSON.stringify({ roomCode, playerName }),
  });
}

export async function getRoomState(roomCode: string): Promise<GameState> {
  return apiCall(`/room/${roomCode}`);
}

export async function startGame(roomCode: string): Promise<{ success: boolean }> {
  return apiCall('/game/start', {
    method: 'POST',
    body: JSON.stringify({ roomCode }),
  });
}

export async function setMurdererChoice(
  roomCode: string,
  playerId: string,
  methodId: string,
  evidenceId: string
): Promise<{ success: boolean }> {
  return apiCall('/game/murderer-choice', {
    method: 'POST',
    body: JSON.stringify({ roomCode, playerId, methodId, evidenceId }),
  });
}

export async function addForensicClue(
  roomCode: string,
  playerId: string,
  category: ClueCategory,
  cardName: string
): Promise<{ success: boolean }> {
  return apiCall('/game/forensic-clue/add', {
    method: 'POST',
    body: JSON.stringify({ roomCode, playerId, category, cardName }),
  });
}

export async function finishTurn(
  roomCode: string,
  playerId: string
): Promise<{ success: boolean }> {
  return apiCall('/game/turn/finish', {
    method: 'POST',
    body: JSON.stringify({ roomCode, playerId }),
  });
}

export async function makeGuess(
  roomCode: string,
  playerId: string,
  suspectId: string,
  methodId: string,
  evidenceId: string
): Promise<{ success: boolean; correct: boolean; gameOver: boolean; winner: string | null }> {
  return apiCall('/game/guess', {
    method: 'POST',
    body: JSON.stringify({ roomCode, playerId, suspectId, methodId, evidenceId }),
  });
}

export async function restartGame(roomCode: string, hostId: string): Promise<{ success: boolean }> {
  return apiCall('/game/restart', {
    method: 'POST',
    body: JSON.stringify({ roomCode, hostId }),
  });
}

export async function closeRoom(roomCode: string, hostId: string): Promise<{ success: boolean }> {
  return apiCall('/room/close', {
    method: 'POST',
    body: JSON.stringify({ roomCode, hostId }),
  });
}
