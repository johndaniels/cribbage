
import express from 'express';
import WebSocket from 'ws';
import { createGame } from '../shared/game.js';
import { processAction } from '../shared/actions.js';
import winston from 'winston';
const app = express()
const port = 3000

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function newGame(gameId, playerClient) {
    const gameManager = new GameManager(gameId, playerClient);
    games[gameId] = gameManager;
    return gameManager;
}

class GameManager {
    constructor(gameId, playerOneClient) {
        this.gameId = gameId;
        this.players = [playerOneClient.playerId, null];
        this.clients = [playerOneClient, null];
        this.game = createGame();
    }

    getPlayers() {
        return this.clients.map(client => {
            if (client) {
                return {
                    playerId: client.playerId,
                    playerName: client.playerName,
                }
            } else {
                return null;
            }
        })
    }

    removeClient(clientIndex) {
        this.clients[clientIndex] = null;
    }

    addPlayer(playerClient) {
        this.clients[1] = playerClient;
        this.players[1] = playerClient.playerId;
        this.updatePlayer(1, playerClient.playerName);
    }

    updateGame(gameAction) {
        this.game = processAction(this.game, gameAction)
        for (const client of this.clients) {
            client.sendGameAction(gameAction);
        }
    }

    updatePlayer(playerIndex, playerName) {
        // send the message to the 'other' player
        const client = this.clients[(playerIndex + 1) % 1];
        if (client != null) {
            this.clients[(playerIndex + 1) % 1].sendPlayer(playerName);
        }
    }

    reconnectPlayer(playerIndex, playerClient) {
        this.clients[playerIndex] = playerClient;
        this.updatePlayer(playerIndex, playerClient.playerName);
    }
}

class ClientState {
    constructor(ws) {
        this.ws = ws;
        this.ws.on('message', (message) => this.handleMessage(message));
        this.ws.on('close', () => this.handleClose());
        this.gameManager = null;
        this.playerId = null;
        this.playerName = null;
    }

    handleClose() {
        logger.info("Websocket Closed");
        this.gameManager.removeClient(this.playerIndex);
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
        if(data.type === 'create') {
            if (!this.playerId) {
                this.sendError("Cannot create game without playerId");
                return;
            }
            const gameId = makeId(16);
            this.gameManager = newGame(gameId, this);
            this.playerIndex = 0;

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
            const gameManager = games[data.gameId];
            if (!gameManager) {
                this.sendError("Could not find game with that Id");
                return;
            }
            const playerIndex = gameManager.players.indexOf(this.playerId);
            if (playerIndex < 0 ) {
                logger.info(JSON.stringify(gameManager.players));
                if (gameManager.players[1] === null) {
                    gameManager.addPlayer(this);
                } else {
                    this.sendError("You are not a player in this game and there is no open slot");
                    return;
                }
            } else {
                if (gameManager.clients[this.playerIndex] !== null) {
                    this.sendError("You cannot connect to the same room twice!");
                    return;
                }
                gameManager.reconnectPlayer(this.playerIndex, this.playerName);
            }
            this.gameManager = gameManager;
            this.playerIndex = playerIndex;
            logger.info("Sending gameState");
            this.ws.send(JSON.stringify({
                type: "gameState",
                gameState: {
                    game: this.gameManager.game,
                    gameId: this.gameManager.gameId,
                    players: this.gameManager.getPlayers(),
                }
            }));
        }
        else if (data.type === 'playerInfo') {
            if (this.playerId && data.playerInfo.playerId !== this.playerId) {
                this.sendError("Cannot set playerId twice")
            }
            if (!this.playerId) {
                this.playerId = data.playerInfo.playerId;
            }
            this.playerName = data.playerInfo.playerId;
        } else if (data.type === 'gameAction') {
            if (this.gameManager) {
                this.gameManager.updateGame(data.gameAction);
            } else {
                this.sendError("Cannot make actions when not in a game");
            }
        }
    }

    sendPlayer(playerName) {
        logger.info("Sending playerName");
        this.ws.send(JSON.stringify({
            type: 'playerName',
            playerName: playerName,
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

app.use('/', express.static("dist"))
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

const wss = new WebSocket.Server({
    port: 3001
});

const games = {};

wss.on('connection', function connection(ws) {
    logger.info("New Connection");
    new ClientState(ws);
});

logger.info("Starting ");


