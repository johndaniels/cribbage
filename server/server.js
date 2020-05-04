import { createGame } from '../shared/game.js';
import { processAction } from '../shared/actions.js';
import WebSocket from 'ws';

import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

const ALPHA_REGEX = /^[a-z0-9]+$/i;

class GameManager {
    constructor(server, gameId, playerOneClient) {
        this.gameId = gameId;
        this.players = [playerOneClient.playerId, null];
        // A list of clients for each player
        this.clients = [[playerOneClient], []];
        this.game = createGame();
        this.server = server;
    }

    allClients() {
        return this.clients[0].concat(this.clients[1]);
    }

    getPlayers() {
        return this.players.map(playerId => {
            if (playerId) {
                return {
                    playerId: this.server.players[playerId].playerId,
                    playerName: this.server.players[playerId].playerName,
                }
            } else {
                return null;
            }
        })
    }

    removeClient(clientIndex, client) {
        this.clients[clientIndex] = this.clients[clientIndex].filter(c => c != client);
    }

    addPlayer(playerClient) {
        this.clients[1].push(playerClient);
        this.players[1] = playerClient.playerId;
        console.log(this.getPlayers());
        for (const client of this.clients[0]) {
            client.sendPlayers(this.getPlayers());
        }
    }

    updateGame(gameAction) {
        this.game = processAction(this.game, gameAction)
        for (const client of this.allClients()) {
            client.sendGameAction(gameAction);
        }
    }

    updatePlayers() {
        for (const client of this.allClients()) {
            client.sendPlayers(this.getPlayers());
        }
    }

    addConnection(playerIndex, playerClient) {
        this.clients[playerIndex].push(playerClient);
    }
}

class ClientState {
    constructor(server, ws) {
        this.ws = ws;
        this.ws.on('message', (message) => this.handleMessage(message));
        this.ws.on('close', () => this.handleClose());
        this.gameManager = null;
        this.playerId = null;
        this.playerName = null;
        this.players = server.players;
        this.games = server.games;
        this.server = server;
    }

    handleClose() {
        logger.info("Websocket Closed");
        if (this.gameManager) {
            this.gameManager.removeClient(this.playerIndex, this);
        }
        this.players[this.playerId].clients = this.players[this.playerId].clients.filter(c => c!= this);
    }

    handleMessage(message) {
        logger.info("Message Received " + message);
        this.handleMessageData(JSON.parse(message));
    }

    sendError(error) {
        logger.info("Sending Error" + error);
        this.ws.send(JSON.stringify({
            type: "error",
            error,
        }));
    }

    handleMessageData(data) {
        logger.info("Message Received");
        if (!this.playerId && data.type !== 'playerInfo') {
            this.sendError("Must send playerInfo first!");
            return;
        }
        if (data.type === 'playerInfo') {
            if (this.playerId && data.playerInfo.playerId !== this.playerId) {
                this.sendError("Cannot set playerId twice")
            }
            if (!this.playerId) {
                this.playerId = data.playerInfo.playerId;
                if (!this.players[this.playerId]) {
                    this.players[this.playerId] = {
                        clients: [],
                        games: [],
                        playerName: null,
                        playerId: this.playerId,
                    }
                }
                this.players[this.playerId].playerName = data.playerInfo.playerName;
                this.sendPlayerInfoUpdates(this.playerId)
                this.players[this.playerId].clients.push(this);
            } else if (this.players[this.playerId].playerName !== data.playerInfo.playerName) {
                this.players[this.playerId].playerName = data.playerInfo.playerName;
                this.sendPlayerInfoUpdates(this.playerId)
            }
        } else if (data.type === 'create') {
            if (!this.playerId) {
                this.sendError("Cannot create game without playerId");
                return;
            }
            if (!data.gameId) {
                this.sendError("Must provide id of game to create");
                return;
            }
            if (this.games[data.gameId]) {
                this.ws.send(JSON.stringify({
                    type: 'gameAlreadyExists',
                }));
                return;
            }
            if (!ALPHA_REGEX.test(data.gameId)) {
                this.sendError("Game ID must be letters and numbers only");
                return;
            }

            this.gameManager = this.server.newGame(data.gameId, this);
            this.playerIndex = 0;

            this.players[this.playerId].games.push(this.gameManager);

            logger.info("Sending gameState");
            this.ws.send(JSON.stringify({
                type: "gameState",
                gameState: {
                    game: this.gameManager.game,
                    gameId: this.gameManager.gameId,
                    players: this.gameManager.getPlayers(),
                }
            }));
        } else if (data.type === 'join') {
            if (!this.playerId) {
                this.sendError("Cannot join game without playerId");
                return;
            }
            const gameManager = this.games[data.gameId];
            if (!gameManager) {
                this.ws.send(JSON.stringify({
                    type: 'noSuchGame'
                }));
                return;
            }
            const playerIndex = gameManager.players.indexOf(this.playerId);
            if (playerIndex < 0 ) {
                logger.info(JSON.stringify(gameManager.players));
                if (gameManager.players[1] === null) {
                    gameManager.addPlayer(this);
                    this.playerIndex = 1;
                } else {
                    this.sendError("You are not a player in this game and there is no open slot");
                    return;
                }
            } else {
                gameManager.addConnection(playerIndex, this);
                this.playerIndex = playerIndex;
            }
            if (!this.players[this.playerId].games.includes(gameManager)) {
                this.players[this.playerId].games.push(gameManager);
            }
            this.gameManager = gameManager;
            logger.info("Sending gameState");
            this.ws.send(JSON.stringify({
                type: "gameState",
                gameState: {
                    game: this.gameManager.game,
                    gameId: this.gameManager.gameId,
                    players: this.gameManager.getPlayers(),
                }
            }));
        } else if (data.type === 'gameAction') {
            if (this.gameManager) {
                this.gameManager.updateGame(data.gameAction);
            } else {
                this.sendError("Cannot make actions when not in a game");
            }
        }
    }

    sendPlayerInfoUpdates(playerId) {
        for (let client of this.players[playerId].clients) {
            client.sendPlayerInfo({
                playerId: playerId,
                playerName: this.players[playerId].playerName,
            })
        }
    
        for (let gameInfo of this.players[playerId].games) {
            gameInfo.updatePlayers();
        }
    }

    sendPlayerInfo(playerInfo) {
        logger.info("Sending playerInfo");
        this.ws.send(JSON.stringify({
            type: 'playerInfo',
            playerInfo: playerInfo,
        }));
    }

    sendPlayers(players) {
        logger.info("Sending players");
        this.ws.send(JSON.stringify({
            type: 'players',
            players: players,
        }));
    }

    sendGameAction(gameAction) {
        logger.info("Sending gameAction");
        this.ws.send(JSON.stringify({
            type: 'gameAction',
            gameAction: gameAction,
        }));
    }
}

export default class Server {
    constructor() {
        this.games = {};
        this.players = {}
    }

    start() {
        this.wss = new WebSocket.Server({
            port: 3001
        });
        
        this.wss.on('connection', (ws) => {
            this.acceptConnection(ws);
        });
    }

    acceptConnection(ws) {
        logger.info("New Connection");
        new ClientState(this, ws);
    }

    newGame(gameId, playerClient) {
        const gameManager = new GameManager(this, gameId, playerClient);
        this.games[gameId] = gameManager;
        return gameManager;
    }
}