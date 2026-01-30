import { useState, useEffect } from 'react';
import { HomeScreen } from '@/app/components/HomeScreen';
import { Lobby } from '@/app/components/Lobby';
import { MurdererSelection } from '@/app/components/MurdererSelection';
import { GamePlay } from '@/app/components/GamePlay';
import { GameOver } from '@/app/components/GameOver';
import * as api from '@/utils/api';
import type { GameState, ClueCategory } from '@/types/game';

type AppState = 'home' | 'game';

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Game data
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Poll for game state updates
  useEffect(() => {
    if (!roomCode || appState !== 'game') return;
    
    let isMounted = true;
    
    const fetchGameState = async () => {
      try {
        const state = await api.getRoomState(roomCode);
        if (isMounted) {
          setGameState(state);
        }
      } catch (err) {
        console.error('Erro ao buscar estado do jogo:', err);
        
        // Se a sala não existe mais (404), voltar para home
        if (err instanceof Error && err.message.includes('404')) {
          setAppState('home');
          setError('A sala foi encerrada pelo host');
        }
      }
    };
    
    // Initial fetch
    fetchGameState();
    
    // Poll every 2 seconds
    const interval = setInterval(fetchGameState, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode, appState]);
  
  const currentPlayer = gameState?.players.find(p => p.id === playerId);
  
  // Handlers
  const handleCreateRoom = async (hostName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.createRoom(hostName);
      setRoomCode(result.roomCode);
      setPlayerId(result.playerId);
      setAppState('game');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar sala');
      console.error('Erro ao criar sala:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinRoom = async (code: string, playerName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.joinRoom(code, playerName);
      
      if (!result.success) {
        throw new Error('Não foi possível entrar na sala. Verifique o código e tente novamente.');
      }
      
      setRoomCode(code);
      setPlayerId(result.playerId);
      setAppState('game');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar na sala');
      console.error('Erro ao entrar na sala:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.startGame(roomCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar jogo');
      console.error('Erro ao iniciar jogo:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMurdererChoice = async (methodId: string, evidenceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.setMurdererChoice(roomCode, playerId, methodId, evidenceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao definir escolha');
      console.error('Erro ao definir escolha:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddClue = async (category: ClueCategory, cardName: string) => {
    try {
      await api.addForensicClue(roomCode, playerId, category, cardName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pista');
      console.error('Erro ao adicionar pista:', err);
    }
  };
  
  const handleFinishTurn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.finishTurn(roomCode, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar turno');
      console.error('Erro ao finalizar turno:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMakeGuess = async (suspectId: string, methodId: string, evidenceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.makeGuess(roomCode, playerId, suspectId, methodId, evidenceId);
      
      if (result.correct) {
        console.log('Palpite correto! Investigadores venceram!');
      } else if (result.gameOver) {
        console.log('Todos perderam credenciais. Assassino venceu!');
      } else {
        console.log('Palpite incorreto. Credencial perdida.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer palpite');
      console.error('Erro ao fazer palpite:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.restartGame(roomCode, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reiniciar jogo');
      console.error('Erro ao reiniciar jogo:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.closeRoom(roomCode, playerId);
      // Voltar para home
      setAppState('home');
      setRoomCode('');
      setPlayerId('');
      setGameState(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao encerrar sala');
      console.error('Erro ao encerrar sala:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);
  
  // Render
  if (appState === 'home') {
    return (
      <>
        <HomeScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          loading={loading}
        />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
      </>
    );
  }
  
  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }
  
  // Lobby
  if (gameState.phase === 'lobby') {
    return (
      <>
        <Lobby
          roomCode={roomCode}
          players={gameState.players}
          isHost={currentPlayer.isHost}
          onStartGame={handleStartGame}
          loading={loading}
        />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
      </>
    );
  }
  
  // Murderer Selection
  if (gameState.phase === 'murderer_selection') {
    return (
      <>
        <MurdererSelection
          player={currentPlayer}
          tableMethods={gameState.tableMethods}
          tableEvidences={gameState.tableEvidences}
          onConfirm={handleMurdererChoice}
          loading={loading}
        />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
      </>
    );
  }
  
  // Playing
  if (gameState.phase === 'playing') {
    return (
      <>
        <GamePlay
          player={currentPlayer}
          players={gameState.players}
          tableMethods={gameState.tableMethods}
          tableEvidences={gameState.tableEvidences}
          murdererChoice={gameState.murdererChoice}
          currentTurn={gameState.currentTurn}
          cluesThisTurn={gameState.cluesThisTurn}
          cluesRequired={gameState.cluesRequired}
          forensicClues={gameState.forensicClues}
          guesses={gameState.guesses}
          onAddClue={handleAddClue}
          onFinishTurn={handleFinishTurn}
          onMakeGuess={handleMakeGuess}
          loading={loading}
        />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
      </>
    );
  }
  
  // Game Over
  if (gameState.phase === 'game_over') {
    return (
      <>
        <GameOver
          winner={gameState.winner}
          players={gameState.players}
          tableMethods={gameState.tableMethods}
          tableEvidences={gameState.tableEvidences}
          murdererChoice={gameState.murdererChoice}
          isHost={currentPlayer.isHost}
          onRestart={handleRestart}
          onClose={handleClose}
          loading={loading}
        />
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            {error}
          </div>
        )}
      </>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Estado do jogo desconhecido</div>
    </div>
  );
}
