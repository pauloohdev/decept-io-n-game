import { useState } from 'react';
import { Users, Plus } from 'lucide-react';

interface HomeScreenProps {
  onCreateRoom: (hostName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  loading: boolean;
}

export function HomeScreen({ onCreateRoom, onJoinRoom, loading }: HomeScreenProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [hostName, setHostName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostName.trim()) {
      onCreateRoom(hostName.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('menu')}
            className="text-slate-400 hover:text-slate-300 mb-6"
          >
            ← Voltar
          </button>
          
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Criar Sala</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="hostName" className="block text-sm font-medium text-slate-300 mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  id="hostName"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !hostName.trim()}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Sala'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('menu')}
            className="text-slate-400 hover:text-slate-300 mb-6"
          >
            ← Voltar
          </button>
          
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Entrar em Sala</h2>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium text-slate-300 mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-slate-300 mb-2">
                  Código da Sala
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !playerName.trim() || !roomCode.trim()}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Deception</h1>
          <p className="text-xl text-red-400">Murder in Hong Kong</p>
          <p className="text-slate-400 mt-4">Jogo de dedução social online</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('create')}
            className="bg-slate-800 hover:bg-slate-700 p-8 rounded-lg shadow-xl transition-colors group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Criar Sala</h2>
              <p className="text-slate-400">
                Inicie uma nova partida e convide seus amigos
              </p>
            </div>
          </button>
          
          <button
            onClick={() => setMode('join')}
            className="bg-slate-800 hover:bg-slate-700 p-8 rounded-lg shadow-xl transition-colors group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Entrar em Sala</h2>
              <p className="text-slate-400">
                Entre em uma partida existente com o código
              </p>
            </div>
          </button>
        </div>
        
        <div className="mt-12 bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Como Jogar</h3>
          <ul className="text-slate-300 space-y-2 text-sm">
            <li>• <strong>4-12 jogadores:</strong> Um será o Perito Forense, outro o Assassino</li>
            <li>• <strong>Objetivo:</strong> Investigadores devem descobrir o Assassino, Método e Evidência</li>
            <li>• <strong>Perito:</strong> Dá pistas visuais sem falar para guiar os investigadores</li>
            <li>• <strong>Assassino:</strong> Deve permanecer oculto até o fim do tempo ou das tentativas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
