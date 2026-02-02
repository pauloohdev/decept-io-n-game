import { useState } from 'react';
import type { Card, Player } from '@/types/game';
import { Skull } from 'lucide-react';

interface MurdererSelectionProps {
  player: Player;
  tableMethods: Card[];
  tableEvidences: Card[];
  onConfirm: (methodId: string, evidenceId: string) => void;
  loading: boolean;
}

export function MurdererSelection({
  player,
  tableMethods,
  tableEvidences,
  onConfirm,
  loading,
}: MurdererSelectionProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  
  const canConfirm = selectedMethodId && selectedEvidenceId;
  
  // Debug: Log para verificar se as cartas estão chegando
  console.log('MurdererSelection - tableMethods:', tableMethods);
  console.log('MurdererSelection - tableEvidences:', tableEvidences);
  console.log('MurdererSelection - player.role:', player.role);
  
  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(selectedMethodId, selectedEvidenceId);
    }
  };
  
  if (player.role !== 'murderer') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Aguarde...</h2>
          <p className="text-slate-300">
            O Assassino está escolhendo o método e a evidência do crime.
          </p>
        </div>
      </div>
    );
  }
  
  // Se não há cartas na mesa ainda, mostrar loading
  if (!tableMethods.length || !tableEvidences.length) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Carregando...</h2>
          <p className="text-slate-300">
            Preparando as cartas...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Skull className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Você é o Assassino</h1>
          </div>
          <p className="text-red-100">
            Escolha 1 Método e 1 Evidência entre as 4 cartas disponíveis de cada tipo.
            Esta será a solução do crime. Mantenha sua identidade em segredo!
          </p>
        </div>
        
        {/* Métodos (4 cartas) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Escolha o Método (1 de 4)</h2>
          <div className="grid grid-cols-2 gap-3">
            {tableMethods.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedMethodId(card.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethodId === card.id
                    ? 'bg-red-600 border-red-400 shadow-lg scale-105'
                    : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
              >
                <p className="text-white font-medium text-center">{card.name}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Evidências (4 cartas) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Escolha a Evidência (1 de 4)</h2>
          <div className="grid grid-cols-2 gap-3">
            {tableEvidences.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedEvidenceId(card.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedEvidenceId === card.id
                    ? 'bg-red-600 border-red-400 shadow-lg scale-105'
                    : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
              >
                <p className="text-white font-medium text-center">{card.name}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Seleção Atual */}
        {(selectedMethodId || selectedEvidenceId) && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Sua Seleção:</h3>
            <div className="space-y-2">
              <p className="text-slate-300">
                <strong className="text-white">Método:</strong>{' '}
                {tableMethods.find(c => c.id === selectedMethodId)?.name || '—'}
              </p>
              <p className="text-slate-300">
                <strong className="text-white">Evidência:</strong>{' '}
                {tableEvidences.find(c => c.id === selectedEvidenceId)?.name || '—'}
              </p>
            </div>
          </div>
        )}
        
        {/* Confirmar */}
        <button
          onClick={handleConfirm}
          disabled={!canConfirm || loading}
          className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Confirmando...' : 'Confirmar Escolha'}
        </button>
      </div>
    </div>
  );
}