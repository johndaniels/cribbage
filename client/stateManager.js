import { processAction } from "../shared/actions";
import seedrandom from 'seedrandom';

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const MAX_RETRY_MUL = 16;
export default class StateManager {
    constructor() {
        this.open = false;
        this.gameId = null;
        this.retryMul = 1;
        this.playerId = window.localStorage.getItem("playerId");
        if (this.playerId === null) {
            this.playerId = makeId(8);
            window.localStorage.setItem("playerId", this.playerId);
        }
        this.playerName = window.localStorage.getItem("playerName") || "Change Me";
        if (window.location.pathname.length > 1) {
            this.joiningGame = true;
            this.homepageGameName = window.location.pathname.substr(1);
        } else {
            this.joiningGame = false;
            this.homepageGameName = makeId(8);
        }
        this.game = null;
        this.stateChangeHandler = () => {};
        this.connect();
    }

    setLoaded() {
        this.stateChangeHandler({
            loaded: true,
        });
    }

    connect() {
        this.webSocket = new WebSocket('ws://' + window.location.hostname + ':3001');
        this.webSocket.addEventListener('open', () => {
            this.isConnected = true;
            if (!this.joiningGame) {
                this.setLoaded();
            }
            this.webSocket.send(JSON.stringify({
                type: "playerInfo",
                playerInfo: {
                    playerId: this.playerId,
                    playerName: this.playerName,
                }
            }));
            if (this.homepageGameName && this.joiningGame) {
                this.webSocket.send(JSON.stringify({
                    type: "join",
                    gameId: this.homepageGameName,
                }));
            }
            this.handleConnectionStateChange(true);
        });
        this.webSocket.addEventListener('message', (event) => {
            this.handleMessage(event);
        })

        this.webSocket.addEventListener('close', () => {
            console.log("Connection Closed");
            this.handleConnectionStateChange(false);
        });
    }

    triggerConnectionRetry() {
        const retryMul = this.retryMul * Math.random();
        if (retryMul < MAX_RETRY_MUL) {
            this.retryMul *= 2;
        }
        setTimeout(() => {
            if (document.visibilityState != 'visible') {
                setTimeout(() => this.triggerConnectionRetry(), 5000);
            } else {
                console.log("Trying to connect");
                this.connect();
            }
        }, 5000)
    }

    onStateChange(handler) {
        this.stateChangeHandler = handler;
    }

    handleConnectionStateChange(isConnected) {
        if (!isConnected) {
            this.triggerConnectionRetry();
        }
        this.stateChangeHandler({
            isConnected,
        });
    }

    handleMessage(message) {
        console.log(message.data);
        const data = JSON.parse(message.data);
        if (data.type === 'error') {
            window.alert("Error: " + data.error);
        } else if (data.type === 'gameState') {
            this.setLoaded();
            this.game = data.gameState.game;
            this.gameId = data.gameState.gameId;
            history.replaceState(null, "", "/" + this.gameId);
            this.players = data.gameState.players;
            this.playerIndex = this.players.map(p => p?.playerId).indexOf(this.playerId);
            this.prng = new seedrandom(null, {state: data.gameState.prngState});
            this.stateChangeHandler({
                game: this.game,
                players: this.players,
                gameId: this.gameId,
                localPlayer: this.playerIndex,
            });
        } else if (data.type === 'gameAction') {
        this.game = processAction(this.game, this.prng, data.gameAction);
            this.stateChangeHandler({
                game: this.game,
                players: this.players,
                gameId: this.gameId,
                localPlayer: this.playerIndex,
            });
        } else if (data.type === 'players') {
            this.players = data.players.slice();
            this.stateChangeHandler({
                game: this.game,
                players: this.players,
                gameId: this.gameId,
                localPlayer: this.playerIndex,
            });
        } else if (data.type === 'gameAlreadyExists') {
            this.stateChangeHandler({
                alreadyExists: true,
            })
        } else if (data.type === 'noSuchGame') {
            this.stateChangeHandler({
                noSuchGame: true,
                loaded: true,
            })
        }
    }

    sendCreateGame(name) {
        this.webSocket.send(JSON.stringify({
            type: "create",
            playerId: this.playerId,
            gameId: name,
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