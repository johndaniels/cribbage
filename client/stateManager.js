import { processAction } from "../shared/actions";

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default class StateManager {
    constructor() {
        this.open = false;
        this.gameId;
        this.playerId = window.localStorage.getItem("playerId");
        if (this.playerId === null) {
            this.playerId = makeId(8);
            window.localStorage.setItem("playerId", this.playerId);
        }
        this.playerName = window.localStorage.getItem("playerName") || "Change Me";
        if (window.location.pathname.length > 1) {
            this.gameId = window.location.pathname.substr(1);
        }
        this.game = null;
        this.gameStateChangeHandler = () => {};
        this.connectionStateChangeHandler = () => {};
        this.webSocket = new WebSocket('ws://localhost:3001');
        this.webSocket.addEventListener('open', () => {
            this.connected = true;
            this.webSocket.send(JSON.stringify({
                type: "playerInfo",
                playerInfo: {
                    playerId: this.playerId,
                    playerName: this.playerName,
                }
            }));
            if (this.gameId) {
                this.webSocket.send(JSON.stringify({
                    type: "join",
                    gameId: this.gameId,
                }));
            }
            this.connectionStateChangeHandler({
                open: true,
            });
        });
        this.webSocket.addEventListener('message', (event) => {
            this.handleMessage(event);
        })
    }

    onGameStateChange(handler) {
        this.gameStateChangeHandler = handler;
    }

    onConnectionStateChange(handler) {
        this.connectionStateChangeHandler = handler;
    }

    handleMessage(message) {
        console.log(message.data);
        const data = JSON.parse(message.data);
        if (data.type === 'gameState') {
            this.game = data.gameState.game;
            this.gameId = data.gameState.gameId;
            history.replaceState(null, "", "/" + this.gameId);
            this.players = data.gameState.players;
            this.playerIndex = this.players.map(p => p?.playerId).indexOf(this.playerId);
            this.gameStateChangeHandler({
                game: this.game,
                players: this.players,
                gameId: this.gameId,
                playerIndex: this.playerIndex,
            });
        } else if (data.type === 'gameAction') {
            this.game = processAction(this.game, data.gameAction);
            this.gameStateChangeHandler({
                game: this.game,
                players: this.players,
                gameId: this.gameId,
                playerIndex: this.playerIndex,
            });
        } else if (data.type === 'players') {
            this.players = data.players.slice();
            this.gameStateChangeHandler({
                game: this.game,
                players: this.players,
                gameId: this.gameId,
                playerIndex: this.playerIndex,
            });
        }
    }

    sendCreateGame() {
        this.webSocket.send(JSON.stringify({
            type: "create",
            playerId: this.playerId,
        }));
        return new Promise((resolve, reject) => {
            this.createResolve = resolve;
            this.createReject = reject;
        });
    }

    sendGameAction(gameAction) {
        this.webSocket.send(JSON.stringify({
            type: "gameAction",
            gameAction,
        }));
    }

    sendPlayerInfo() {
        this.webSocket.send(JSON.stringify({
            type: "playerInfo",
            playerInfo: {
                playerName: this.playerName,
                playerId: this.playerId,
            },
        }));
    }
    
    setPlayerName(playerName) {
        this.playerName = playerName;
        window.localStorage.setItem('playerName', playerName);
        this.sendPlayerInfo();
    }
}