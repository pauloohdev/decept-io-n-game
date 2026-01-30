import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as game from "./game.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-dd9aacbd/health", (c) => {
  return c.json({ status: "ok" });
});

// Criar sala
app.post("/make-server-dd9aacbd/room/create", async (c) => {
  try {
    const { hostName } = await c.req.json();
    
    if (!hostName || typeof hostName !== 'string') {
      return c.json({ error: 'Nome do host é obrigatório' }, 400);
    }
    
    const result = await game.createRoom(hostName);
    return c.json(result);
  } catch (error) {
    console.log(`Erro ao criar sala: ${error}`);
    return c.json({ error: 'Erro ao criar sala' }, 500);
  }
});

// Entrar em sala
app.post("/make-server-dd9aacbd/room/join", async (c) => {
  try {
    const { roomCode, playerName } = await c.req.json();
    
    if (!roomCode || !playerName) {
      return c.json({ error: 'Código da sala e nome são obrigatórios' }, 400);
    }
    
    const result = await game.joinRoom(roomCode, playerName);
    return c.json(result);
  } catch (error) {
    console.log(`Erro ao entrar na sala: ${error}`);
    return c.json({ error: 'Erro ao entrar na sala' }, 500);
  }
});

// Obter estado da sala
app.get("/make-server-dd9aacbd/room/:roomCode", async (c) => {
  try {
    const roomCode = c.req.param('roomCode');
    const state = await game.getRoomState(roomCode);
    
    if (!state) {
      return c.json({ error: 'Sala não encontrada' }, 404);
    }
    
    return c.json(state);
  } catch (error) {
    console.log(`Erro ao obter estado da sala: ${error}`);
    return c.json({ error: 'Erro ao obter estado da sala' }, 500);
  }
});

// Iniciar jogo
app.post("/make-server-dd9aacbd/game/start", async (c) => {
  try {
    const { roomCode } = await c.req.json();
    const success = await game.startGame(roomCode);
    
    return c.json({ success });
  } catch (error) {
    console.log(`Erro ao iniciar jogo: ${error}`);
    return c.json({ error: 'Erro ao iniciar jogo' }, 500);
  }
});

// Assassino escolhe cartas
app.post("/make-server-dd9aacbd/game/murderer-choice", async (c) => {
  try {
    const { roomCode, playerId, methodId, evidenceId } = await c.req.json();
    const success = await game.setMurdererChoice(roomCode, playerId, methodId, evidenceId);
    
    return c.json({ success });
  } catch (error) {
    console.log(`Erro ao definir escolha do assassino: ${error}`);
    return c.json({ error: 'Erro ao definir escolha do assassino' }, 500);
  }
});

// Perito adiciona pista
app.post("/make-server-dd9aacbd/game/forensic-clue/add", async (c) => {
  try {
    const { roomCode, playerId, category, cardName } = await c.req.json();
    const success = await game.addForensicClue(roomCode, playerId, category, cardName);
    
    return c.json({ success });
  } catch (error) {
    console.log(`Erro ao adicionar pista: ${error}`);
    return c.json({ error: 'Erro ao adicionar pista' }, 500);
  }
});

// Perito finaliza turno
app.post("/make-server-dd9aacbd/game/turn/finish", async (c) => {
  try {
    const { roomCode, playerId } = await c.req.json();
    const success = await game.finishTurn(roomCode, playerId);
    
    return c.json({ success });
  } catch (error) {
    console.log(`Erro ao finalizar turno: ${error}`);
    return c.json({ error: 'Erro ao finalizar turno' }, 500);
  }
});

// Fazer palpite (acusação)
app.post("/make-server-dd9aacbd/game/guess", async (c) => {
  try {
    const { roomCode, playerId, suspectId, methodId, evidenceId } = await c.req.json();
    const result = await game.makeGuess(roomCode, playerId, suspectId, methodId, evidenceId);
    
    return c.json(result);
  } catch (error) {
    console.log(`Erro ao fazer palpite: ${error}`);
    return c.json({ error: 'Erro ao fazer palpite' }, 500);
  }
});

// Reiniciar jogo
app.post("/make-server-dd9aacbd/game/restart", async (c) => {
  try {
    const { roomCode, hostId } = await c.req.json();
    const success = await game.restartGame(roomCode, hostId);
    
    return c.json({ success });
  } catch (error) {
    console.log(`Erro ao reiniciar jogo: ${error}`);
    return c.json({ error: 'Erro ao reiniciar jogo' }, 500);
  }
});

// Encerrar sala
app.post("/make-server-dd9aacbd/room/close", async (c) => {
  try {
    const { roomCode, hostId } = await c.req.json();
    const success = await game.closeRoom(roomCode, hostId);
    
    return c.json({ success });
  } catch (error) {
    console.log(`Erro ao encerrar sala: ${error}`);
    return c.json({ error: 'Erro ao encerrar sala' }, 500);
  }
});

Deno.serve(app.fetch);