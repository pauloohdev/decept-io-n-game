import { Copy, Check, Users, Play } from 'lucide-react';
import { useState } from 'react';
import type { Player } from '@/types/game';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
  loading: boolean;
}

export function Lobby({ roomCode, players, isHost, onStartGame, loading }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  
  // Modo de teste: permite 1+ jogadores
  const canStart = players.length >= 1 && players.length <= 12;
  
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-3">Sala de Espera</h2>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg flex-1">
                <p className="text-xs text-red-100 mb-1">Código da Sala</p>
                <p className="text-2xl font-mono font-bold text-white tracking-wider">{roomCode}</p>
              </div>
              
              <button
                onClick={copyRoomCode}
                className="bg-white/10 hover:bg-white/20 backdrop-blur p-3 rounded-lg transition-colors"
                title="Copiar código"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
          
          {/* Players List */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">
                Jogadores ({players.length}/12)
              </h3>
            </div>
            
            <div className="space-y-2 mb-6">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="bg-slate-700 rounded-lg px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-white font-medium">{player.name}</span>
                  {player.isHost && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Requirements */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300 mb-2">
                <strong className="text-white">Requisitos para iniciar:</strong>
              </p>
              <ul className="text-sm text-slate-400 space-y-1">
                <li className={players.length >= 4 ? 'text-green-400' : ''}>
                  • Mínimo de 4 jogadores {players.length >= 4 && '✓'}
                </li>
                <li className={players.length <= 12 ? 'text-green-400' : 'text-red-400'}>
                  • Máximo de 12 jogadores {players.length <= 12 ? '✓' : '✗'}
                </li>
              </ul>
            </div>
            
            {/* Start Button */}
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={!canStart || loading}
                className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {loading ? 'Iniciando...' : 'Iniciar Jogo'}
              </button>
            ) : (
              <div className="text-center py-4 text-slate-400">
                Aguardando o host iniciar o jogo...
              </div>
            )}
            
            {!canStart && isHost && (
              <p className="text-center text-sm text-red-400 mt-3">
                Número máximo de jogadores excedido
              </p>
            )}
          </div>
        </div>
        
        {/* Share Instructions */}
        <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 text-center">
            Compartilhe o código <strong className="text-white">{roomCode}</strong> com seus amigos para eles entrarem na partida
          </p>
        </div>
      </div>
    </div>
  );
}