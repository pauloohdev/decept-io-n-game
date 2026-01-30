import { useState } from 'react';
import type { Player, Card, ClueMarker, Guess, ClueCategory } from '@/types/game';
import { Eye, Target, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import { CLUE_CARDS, CATEGORY_NAMES } from '@/data/cards';

interface GamePlayProps {
  player: Player;
  players: Player[];
  tableMethods: Card[];
  tableEvidences: Card[];
  murdererChoice: { methodId: string | null; evidenceId: string | null };
  currentTurn: number;
  cluesThisTurn: number;
  cluesRequired: number;
  forensicClues: ClueMarker[];
  guesses: Guess[];
  onAddClue: (category: ClueCategory, cardName: string) => void;
  onFinishTurn: () => void;
  onMakeGuess: (suspectId: string, methodId: string, evidenceId: string) => void;
  loading: boolean;
}

export function GamePlay({
  player,
  players,
  tableMethods,
  tableEvidences,
  murdererChoice,
  currentTurn,
  cluesThisTurn,
  cluesRequired,
  forensicClues,
  guesses,
  onAddClue,
  onFinishTurn,
  onMakeGuess,
  loading,
}: GamePlayProps) {
  const [selectedCategory, setSelectedCategory] = useState<ClueCategory>('location');
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  
  const isForensic = player.role === 'forensic';
  const isMurderer = player.role === 'murderer';
  const isAccomplice = player.role === 'accomplice';
  const canGuess = !isForensic && player.hasCredential;
  
  // Filtrar pistas por categoria
  const cluesByCategory = CLUE_CARDS.filter(c => c.category === selectedCategory);
  
  // Verificar se pode adicionar pista
  const canAddClue = isForensic && cluesThisTurn < cluesRequired;
  const canFinishTurn = isForensic && cluesThisTurn >= cluesRequired;
  
  // Verificar restrição de categoria no turno 1
  const canSelectCategory = (category: ClueCategory): boolean => {
    if (currentTurn !== 1 || cluesThisTurn === 0) return true;
    
    // No turno 1, após dar a primeira pista, não pode repetir a categoria
    const lastClue = forensicClues[forensicClues.length - 1];
    return !lastClue || lastClue.category !== category;
  };
  
  const handleAddClue = (cardName: string) => {
    if (canAddClue && canSelectCategory(selectedCategory)) {
      onAddClue(selectedCategory, cardName);
    }
  };
  
  const handleGuess = () => {
    if (canGuess && selectedSuspectId && selectedMethodId && selectedEvidenceId) {
      onMakeGuess(selectedSuspectId, selectedMethodId, selectedEvidenceId);
      // Limpar seleção
      setSelectedSuspectId('');
      setSelectedMethodId('');
      setSelectedEvidenceId('');
    }
  };
  
  // Obter solução para Perito, Assassino e Cúmplice
  const correctMethod = tableMethods.find(c => c.id === murdererChoice.methodId);
  const correctEvidence = tableEvidences.find(c => c.id === murdererChoice.evidenceId);
  
  return (
    <div className="min-h-screen bg-slate-900 p-4 overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Papel do jogador */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {isForensic && '🔬 Perito Forense'}
                {isMurderer && '💀 Assassino'}
                {isAccomplice && '🤝 Cúmplice'}
                {!isForensic && !isMurderer && !isAccomplice && '🔍 Investigador'}
              </h1>
              <p className="text-slate-400 text-sm">
                {isForensic && `Turno ${currentTurn} • Dar ${cluesRequired - cluesThisTurn} pista(s)`}
                {(isMurderer || isAccomplice) && 'Observe e não seja descoberto'}
                {!isForensic && !isMurderer && !isAccomplice && 'Faça palpites para descobrir o assassino'}
              </p>
            </div>
            
            {/* Credencial */}
            <div className="flex items-center gap-2">
              {player.hasCredential ? (
                <>
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 font-semibold">Credencial Ativa</span>
                </>
              ) : (
                <>
                  <ShieldOff className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-semibold">Credencial Perdida</span>
                </>
              )}
            </div>
          </div>
          
          {/* Mostrar solução para Perito, Assassino e Cúmplice */}
          {(isForensic || isMurderer || isAccomplice) && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400 mb-2">
                {isForensic && 'Solução do Crime (apenas você vê):'}
                {isMurderer && 'Sua Escolha:'}
                {isAccomplice && 'O Crime (você é cúmplice):'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
                  <p className="text-xs text-red-300 mb-1">Método</p>
                  <p className="text-white font-semibold">{correctMethod?.name}</p>
                </div>
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
                  <p className="text-xs text-red-300 mb-1">Evidência</p>
                  <p className="text-white font-semibold">{correctEvidence?.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Mesa e Pistas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cartas da Mesa - TODOS VÊem */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cartas da Mesa (Visível para Todos)</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Métodos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tableMethods.map((card) => (
                    <div
                      key={card.id}
                      className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 text-center"
                    >
                      <p className="text-white font-semibold">{card.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Evidências</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tableEvidences.map((card) => (
                    <div
                      key={card.id}
                      className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-center"
                    >
                      <p className="text-white font-semibold">{card.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Pistas do Perito */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Pistas do Perito Forense
              </h2>
              
              {forensicClues.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Aguardando pistas do perito...
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Agrupar por turno */}
                  {Array.from(new Set(forensicClues.map(c => c.turnNumber))).sort().map(turn => (
                    <div key={turn} className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-slate-300 mb-3">Turno {turn}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {forensicClues
                          .filter(c => c.turnNumber === turn)
                          .map((clue, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3"
                            >
                              <p className="text-xs text-blue-200 mb-1">
                                {CATEGORY_NAMES[clue.category]}
                              </p>
                              <p className="text-white font-semibold text-sm">{clue.cardName}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Interface do Perito */}
            {isForensic && (
              <div className="bg-blue-900/20 border-2 border-blue-600 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Dar Pistas (Apenas Perito)</h2>
                
                <div className="mb-4 bg-blue-900/30 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    <strong>Turno {currentTurn}:</strong> Você precisa dar <strong>{cluesRequired - cluesThisTurn}</strong> pista(s) ainda.
                  </p>
                  {currentTurn === 1 && cluesThisTurn === 1 && (
                    <p className="text-xs text-yellow-300 mt-2">
                      ⚠️ A segunda pista deve ser de uma categoria diferente da primeira!
                    </p>
                  )}
                </div>
                
                {/* Seletor de Categoria */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Selecione a Categoria
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(CATEGORY_NAMES) as ClueCategory[]).map((category) => {
                      const disabled = !canSelectCategory(category);
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          disabled={disabled}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white'
                              : disabled
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {CATEGORY_NAMES[category]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Cartas de Pista */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Selecione uma Pista de {CATEGORY_NAMES[selectedCategory]}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {cluesByCategory.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleAddClue(card.name)}
                        disabled={!canAddClue || !canSelectCategory(selectedCategory) || loading}
                        className="p-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg border border-slate-600 hover:border-blue-500 disabled:border-slate-700 transition-all text-left"
                      >
                        <p className="text-white font-medium text-sm">{card.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Botão Finalizar Turno */}
                {canFinishTurn && (
                  <button
                    onClick={onFinishTurn}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Turno'}
                  </button>
                )}
              </div>
            )}
            
            {/* Palpites Recentes */}
            {guesses.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Palpites Recentes</h2>
                <div className="space-y-2">
                  {guesses.slice(-10).reverse().map((guess, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 ${
                        guess.correct
                          ? 'bg-green-900/30 border border-green-600'
                          : 'bg-slate-700'
                      }`}
                    >
                      <p className="text-sm text-slate-300">
                        <strong className="text-white">{guess.playerName}</strong> acusou{' '}
                        <strong className={guess.correct ? 'text-green-400' : 'text-red-400'}>
                          {guess.suspectName}
                        </strong>
                        {guess.correct && ' ✓ CORRETO'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {guess.methodCard} + {guess.evidenceCard}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Coluna Direita - Fazer Palpite e Jogadores */}
          <div className="space-y-6">
            {/* Fazer Palpite */}
            <div className="bg-slate-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Fazer Palpite
              </h2>
              
              {!canGuess ? (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-200 text-center">
                    {isForensic
                      ? 'O Perito não pode fazer palpites'
                      : 'Você perdeu sua credencial'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selecionar Suspeito */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Suspeito
                    </label>
                    <select
                      value={selectedSuspectId}
                      onChange={(e) => setSelectedSuspectId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Selecione...</option>
                      {players
                        .filter(p => p.id !== player.id && p.role !== 'forensic')
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  {/* Selecionar Método */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Método
                    </label>
                    <select
                      value={selectedMethodId}
                      onChange={(e) => setSelectedMethodId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Selecione...</option>
                      {tableMethods.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Selecionar Evidência */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Evidência
                    </label>
                    <select
                      value={selectedEvidenceId}
                      onChange={(e) => setSelectedEvidenceId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Selecione...</option>
                      {tableEvidences.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleGuess}
                    disabled={!selectedSuspectId || !selectedMethodId || !selectedEvidenceId || loading}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? 'Enviando...' : 'Fazer Palpite'}
                  </button>
                  
                  <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                    <p className="text-xs text-yellow-200">
                      <strong>Atenção:</strong> Palpites incorretos fazem você perder sua credencial permanentemente!
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Jogadores */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Jogadores</h2>
              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className={`bg-slate-700 rounded-lg px-4 py-3 ${
                      p.id === player.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{p.name}</span>
                      <div className="flex items-center gap-2">
                        {p.role === 'forensic' && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Perito
                          </span>
                        )}
                        {p.id === player.id && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Você
                          </span>
                        )}
                        {p.hasCredential ? (
                          <Shield className="w-4 h-4 text-green-400" />
                        ) : (
                          <ShieldOff className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
