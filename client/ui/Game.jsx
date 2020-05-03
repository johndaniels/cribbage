import React,  {useState} from 'react';
import {  markPlayerReady } from '../../shared/game';
import {
    cutForDealAction,
    resetCuttingAction,
    startLayAwayAction,
    layAwayCardsAction,
    startCutAction,
    cutDeckAction,
    startPlayAction,
    playCardAction,
    showCribAction,
    nextHandAction,
} from '../../shared/actions';
import { PHASE } from '../../shared/game';
import { CutForDeal } from './CutForDeal.jsx';
import { LayAway } from './LayAway.jsx';
import { Cut } from './Cut.jsx';
import { Play } from './Play.jsx';
import Lobby from './Lobby.jsx';
import HomePage from './HomePage.jsx';
import PropTypes from 'prop-types';
import styled from 'styled-components';
const HeaderStyled = styled.div`
    position: fixed;
    top: 0;
    height: 20px;
    display: flex;
`;

const PlayerNameDisplay = styled.div`
    width: 100px;
`

const PaddedCenter = styled.div`
    margin-top: 30px;
`;


function Header({playerName, setPlayerName}) {
    
    const [isEditing, setEditing] = useState(false);
    const [playerNameDraft, setPlayerNameDraft] = useState(playerName || "");

    function savePlayerName() {
        setEditing(false);
        setPlayerName(playerNameDraft);
    }

    function onKeyPress(event) {
        if(event.key === 'Enter'){
            savePlayerName();
        }
    }

    if (!isEditing) {
        return <HeaderStyled>
            <label>Username: </label>
            <PlayerNameDisplay>{playerName}</PlayerNameDisplay>
            <button onClick={() => setEditing(true)}>Edit</button>
        </HeaderStyled>;
    } else {
        return <HeaderStyled>
            <label>Username: </label>
            <input value={playerNameDraft} onKeyPress={onKeyPress} onChange={(event) => setPlayerNameDraft(event.target.value)}/>
            <button onClick={savePlayerName}>Save</button>
        </HeaderStyled>
    }
}

Header.propTypes = {
    playerName: PropTypes.string,
    setPlayerName: PropTypes.func,
}

export class Game extends React.Component {
    constructor(props) {
        super(props);
        props.stateManager.onGameStateChange(({game, gameId, players, playerIndex}) => {
            this.setState({
                game,
                gameId,
                players,
                localPlayer: playerIndex,
            });
        });
        props.stateManager.onConnectionStateChange((connectionState) => {
            this.setState({
                open: connectionState.open,
            });
        });

        this.state = {
            game: props.stateManager.game,
            gameId: props.stateManager.gameId,
            open: props.stateManager.open,
            playerName: props.stateManager.playerName,
            players: [null, null],
            localPlayer: 0,
        };

        // We take our action generating functions and bind them, causing them to call
        // 'processAction' on the generated action objects (similar to Redux reducers).
        this.cutForDeal = this.bindAction(cutForDealAction);
        this.resetCutting = this.bindAction(resetCuttingAction);
        this.startLayAway = this.bindAction(startLayAwayAction);
        this.layAwayCards = this.bindAction(layAwayCardsAction);
        this.startCut = this.bindAction(startCutAction);
        this.cutDeck = this.bindAction(cutDeckAction);
        this.startPlay = this.bindAction(startPlayAction);
        this.playCard = this.bindAction(playCardAction);
        this.showCrib = this.bindAction(showCribAction);
        this.nextHand = this.bindAction(nextHandAction);


        // Binding methods in general
        this.toggleLocalPlayer = this.toggleLocalPlayer.bind(this);
        this.markPlayerReady = this.markPlayerReady.bind(this);
        this.setPlayerName = this.setPlayerName.bind(this);
    }

    setPlayerName(playerName) {
        this.setState({
            playerName,
        });
        this.props.stateManager.setPlayerName(playerName);
    }

    toggleLocalPlayer() {
        this.setState({
            localPlayer: (this.state.localPlayer + 1) % 2
        });
    }

    markPlayerReady(playerName) {
        this.setState({
            game: markPlayerReady(this.state.game, this.state.localPlayer, playerName),
        });
    }

    bindAction(action) {
        /*return (...args) => this.setState({
            game: processAction(this.state.game, action(...args)),
        });*/
        return (...args) => {
            this.props.stateManager.sendGameAction(action(...args));
            /*this.setState({
                game: processAction(this.state.game, action(...args)),
            })*/
        };
    }

    renderGameBoard() {
        const game = this.state.game;
        if (!game) {
            return <div></div>;
        }
        if (game.phase === PHASE.LOBBY) {
            return <Lobby
                game={game}
                localPlayer={this.state.localPlayer}
                markPlayerReady={this.markPlayerReady}
            />
        } else if (game.phase === PHASE.CUTTING_FOR_DEAL) {
            return <CutForDeal 
                cuttingState={game.cuttingState}
                cutForDeal={this.cutForDeal} 
                resetCutting={this.resetCutting}
                startLayAway={this.startLayAway}
                localPlayer={this.state.localPlayer}
                players={this.state.players}
            />
        } else if (game.phase === PHASE.LAY_AWAY) {
            return <LayAway 
                game={game}
                layAwayCards={this.layAwayCards}
                startCut={this.startCut}
                localPlayer={this.state.localPlayer}
                players={this.state.players}
            />
        } else if (game.phase === PHASE.CUTTING) {
            return <Cut
                deck={game.deck}
                cutCard={game.cutCard}
                cutDeck={this.cutDeck}
                startPlay={this.startPlay}
                localPlayer={this.state.localPlayer}
                dealer={game.dealer}
                />
        } else if (game.phase === PHASE.PLAYING) {
            return <Play
                game={game}
                playCard={this.playCard}
                showCrib={this.showCrib}
                nextHand={this.nextHand}
                localPlayer={this.state.localPlayer}
                players={this.state.players}
                />
        }
    } 

    renderGame() {
        const renderDealer = (player) => {
            if (player==this.state.game.dealer) {
                return " (Dealer)"
            }
        }
        return <div>
            <div>Phase: {this.state.game.phase}</div>
            <div>Player1: {this.state.players[0].playerName}{renderDealer(0)}</div>
            <div>Player2: {this.state.players[1].playerName}{renderDealer(1)}</div>
            {this.renderGameBoard()}
        </div>
    }

    renderHome() {
        return <HomePage
            createGame={() => this.props.stateManager.sendCreateGame()}
        />
    }

    renderCenter() {
        if (!this.state.gameId) {
            return this.renderHome();
        } else if (this.state.players.some(p => !p)) {
            return <div>Waiting for Player</div>
        } else {
            return this.renderGame();
        }
    }

    render() {
        return <div>
            <Header playerName={this.state.playerName} setPlayerName={this.setPlayerName}/>
            <PaddedCenter>
                {this.renderCenter()}
            </PaddedCenter>
        </div>
    }
}

Game.propTypes = {
    stateManager: PropTypes.object
};