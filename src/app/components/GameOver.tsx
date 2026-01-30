import { Trophy, Skull, RotateCcw, X } from 'lucide-react';
import type { Player, Card } from '@/types/game';

interface GameOverProps {
  winner: 'investigators' | 'murderer' | null;
  players: Player[];
  tableMethods: Card[];
  tableEvidences: Card[];
  murdererChoice: { methodId: string | null; evidenceId: string | null };
  isHost: boolean;
  onRestart: () => void;
  onClose: () => void;
  loading: boolean;
}

export function GameOver({
  winner,
  players,
  tableMethods,
  tableEvidences,
  murdererChoice,
  isHost,
  onRestart,
  onClose,
  loading,
}: GameOverProps) {
  const murderer = players.find(p => p.role === 'murderer');
  const forensic = players.find(p => p.role === 'forensic');
  
  const correctMethod = tableMethods.find(c => c.id === murdererChoice.methodId);
  const correctEvidence = tableEvidences.find(c => c.id === murdererChoice.evidenceId);
  
  const investigatorsWon = winner === 'investigators';
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Resultado */}
        <div
          className={`rounded-lg p-8 mb-6 text-center ${
            investigatorsWon
              ? 'bg-gradient-to-r from-green-900 to-green-800'
              : 'bg-gradient-to-r from-red-900 to-red-800'
          }`}
        >
          <div className="mb-4">
            {investigatorsWon ? (
              <Trophy className="w-20 h-20 text-yellow-300 mx-auto" />
            ) : (
              <Skull className="w-20 h-20 text-white mx-auto" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            {investigatorsWon ? 'Investigadores Venceram!' : 'Assassino Venceu!'}
          </h1>
          
          <p className="text-xl text-white/80">
            {investigatorsWon
              ? 'O crime foi solucionado com sucesso!'
              : 'O assassino escapou da justiça!'}
          </p>
        </div>
        
        {/* Solução do Crime */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Solução do Crime</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-400 mb-2">Assassino</p>
              <p className="text-xl font-bold text-red-400">{murderer?.name || 'Desconhecido'}</p>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-400 mb-2">Método</p>
              <p className="text-xl font-bold text-white">{correctMethod?.name || '—'}</p>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-400 mb-2">Evidência</p>
              <p className="text-xl font-bold text-white">{correctEvidence?.name || '—'}</p>
            </div>
          </div>
          
          {forensic && (
            <div className="text-center">
              <p className="text-slate-400">
                <strong className="text-white">Perito Forense:</strong> {forensic.name}
              </p>
            </div>
          )}
        </div>
        
        {/* Papéis Revelados */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Papéis dos Jogadores</h2>
          
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="bg-slate-700 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-white font-medium">{player.name}</span>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-semibold ${
                    player.role === 'forensic'
                      ? 'bg-blue-600 text-white'
                      : player.role === 'murderer'
                      ? 'bg-red-600 text-white'
                      : player.role === 'accomplice'
                      ? 'bg-orange-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {player.role === 'forensic' && '🔬 Perito'}
                  {player.role === 'murderer' && '💀 Assassino'}
                  {player.role === 'accomplice' && '🤝 Cúmplice'}
                  {player.role === 'investigator' && '🔍 Investigador'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ações */}
        <div className="bg-slate-800 rounded-lg p-6">
          {isHost ? (
            <div className="space-y-3">
              <button
                onClick={onRestart}
                disabled={loading}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                {loading ? 'Reiniciando...' : 'Jogar Novamente'}
              </button>
              
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                {loading ? 'Encerrando...' : 'Encerrar Sala'}
              </button>
              
              <p className="text-xs text-slate-400 text-center mt-2">
                "Jogar Novamente" mantém os jogadores e re-sorteia papéis e cartas.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400">
                Aguardando o host decidir...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
