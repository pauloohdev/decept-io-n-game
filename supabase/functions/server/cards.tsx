export interface Card {
  id: string;
  type: 'method' | 'evidence';
  name: string;
}

export interface ClueCard {
  id: string;
  category: 'location' | 'time' | 'weather' | 'condition' | 'relationship' | 'other';
  name: string;
}

export const METHOD_CARDS: Card[] = [
  { id: 'method_1', type: 'method', name: 'Arma de Fogo' },
  { id: 'method_2', type: 'method', name: 'Facada' },
  { id: 'method_3', type: 'method', name: 'Envenenamento' },
  { id: 'method_4', type: 'method', name: 'Estrangulamento' },
  { id: 'method_5', type: 'method', name: 'Afogamento' },
  { id: 'method_6', type: 'method', name: 'Golpe Contundente' },
  { id: 'method_7', type: 'method', name: 'Empurrão de Altura' },
  { id: 'method_8', type: 'method', name: 'Acidente de Carro' },
  { id: 'method_9', type: 'method', name: 'Overdose' },
  { id: 'method_10', type: 'method', name: 'Sufocamento' },
  { id: 'method_11', type: 'method', name: 'Incêndio' },
  { id: 'method_12', type: 'method', name: 'Explosão' },
];

export const EVIDENCE_CARDS: Card[] = [
  { id: 'evidence_1', type: 'evidence', name: 'Arma' },
  { id: 'evidence_2', type: 'evidence', name: 'Documento' },
  { id: 'evidence_3', type: 'evidence', name: 'Fibra' },
  { id: 'evidence_4', type: 'evidence', name: 'Impressão Digital' },
  { id: 'evidence_5', type: 'evidence', name: 'Sangue' },
  { id: 'evidence_6', type: 'evidence', name: 'Cabelo' },
  { id: 'evidence_7', type: 'evidence', name: 'Pegada' },
  { id: 'evidence_8', type: 'evidence', name: 'Substância Química' },
  { id: 'evidence_9', type: 'evidence', name: 'Ferramenta' },
  { id: 'evidence_10', type: 'evidence', name: 'Roupas' },
  { id: 'evidence_11', type: 'evidence', name: 'Objeto Pessoal' },
  { id: 'evidence_12', type: 'evidence', name: 'Marcas no Corpo' },
];

export const CLUE_CARDS: ClueCard[] = [
  { id: 'clue_loc_1', category: 'location', name: 'Apartamento' },
  { id: 'clue_loc_2', category: 'location', name: 'Rua' },
  { id: 'clue_loc_3', category: 'location', name: 'Parque' },
  { id: 'clue_loc_4', category: 'location', name: 'Restaurante' },
  { id: 'clue_loc_5', category: 'location', name: 'Escritório' },
  { id: 'clue_loc_6', category: 'location', name: 'Hospital' },
  
  { id: 'clue_time_1', category: 'time', name: 'Manhã' },
  { id: 'clue_time_2', category: 'time', name: 'Tarde' },
  { id: 'clue_time_3', category: 'time', name: 'Noite' },
  { id: 'clue_time_4', category: 'time', name: 'Madrugada' },
  { id: 'clue_time_5', category: 'time', name: 'Dia Útil' },
  { id: 'clue_time_6', category: 'time', name: 'Fim de Semana' },
  
  { id: 'clue_weather_1', category: 'weather', name: 'Sol' },
  { id: 'clue_weather_2', category: 'weather', name: 'Chuva' },
  { id: 'clue_weather_3', category: 'weather', name: 'Neblina' },
  { id: 'clue_weather_4', category: 'weather', name: 'Neve' },
  { id: 'clue_weather_5', category: 'weather', name: 'Tempestade' },
  { id: 'clue_weather_6', category: 'weather', name: 'Calor Extremo' },
  
  { id: 'clue_cond_1', category: 'condition', name: 'Muito Sangue' },
  { id: 'clue_cond_2', category: 'condition', name: 'Pouco Sangue' },
  { id: 'clue_cond_3', category: 'condition', name: 'Corpo Oculto' },
  { id: 'clue_cond_4', category: 'condition', name: 'Corpo Visível' },
  { id: 'clue_cond_5', category: 'condition', name: 'Luta' },
  { id: 'clue_cond_6', category: 'condition', name: 'Sem Luta' },
  
  { id: 'clue_rel_1', category: 'relationship', name: 'Família' },
  { id: 'clue_rel_2', category: 'relationship', name: 'Amigo' },
  { id: 'clue_rel_3', category: 'relationship', name: 'Colega' },
  { id: 'clue_rel_4', category: 'relationship', name: 'Estranho' },
  { id: 'clue_rel_5', category: 'relationship', name: 'Inimigo' },
  { id: 'clue_rel_6', category: 'relationship', name: 'Rival' },
  
  { id: 'clue_other_1', category: 'other', name: 'Testemunha' },
  { id: 'clue_other_2', category: 'other', name: 'Sem Testemunha' },
  { id: 'clue_other_3', category: 'other', name: 'Premeditado' },
  { id: 'clue_other_4', category: 'other', name: 'Acidental' },
  { id: 'clue_other_5', category: 'other', name: 'Câmeras' },
  { id: 'clue_other_6', category: 'other', name: 'Sem Câmeras' },
];
