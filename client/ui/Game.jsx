import React from 'react';
import { createGame, cutForDeal, resetCutting, startLayAway, layAwayCards, startCut, cutDeck, startPlay, playCard, markPlayerReady, showCrib, nextHand } from '../game';
import { PHASE } from '../game';
import { CutForDeal } from './CutForDeal.jsx';
import { LayAway } from './LayAway.jsx';
import { Cut } from './Cut.jsx';
import { Play } from './Play.jsx';
import LocalPlayerToggle from './LocalPlayerToggle.jsx';
import Lobby from './Lobby.jsx';

export class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            game: createGame(),
            localPlayer: 0,
        };


        // These are all bound as methods of this by updating this components state
        // with the result of the pure function that modifies a game.
        this.cutForDeal = this.bindAction(cutForDeal);
        this.resetCutting = this.bindAction(resetCutting);
        this.startLayAway = this.bindAction(startLayAway);
        this.layAwayCards = this.bindAction(layAwayCards);
        this.startCut = this.bindAction(startCut);
        this.cutDeck = this.bindAction(cutDeck);
        this.startPlay = this.bindAction(startPlay);
        this.playCard = this.bindAction(playCard);
        this.showCrib = this.bindAction(showCrib);
        this.nextHand = this.bindAction(nextHand);


        // Binding methods in general
        this.toggleLocalPlayer = this.toggleLocalPlayer.bind(this);
        this.markPlayerReady = this.markPlayerReady.bind(this);

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
        return (...args) => this.setState({
            game: action(this.state.game, ...args),
        });
    }

    renderGameBoard() {
        const game = this.state.game;
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
            />
        } else if (game.phase === PHASE.LAY_AWAY) {
            return <LayAway 
                game={game}
                layAwayCards={this.layAwayCards}
                startCut={this.startCut}
            />
        } else if (game.phase === PHASE.CUTTING) {
            return <Cut
                deck={game.deck}
                cutCard={game.cutCard}
                cutDeck={this.cutDeck}
                startPlay={this.startPlay} />
        } else if (game.phase === PHASE.PLAYING) {
            return <Play
                game={game}
                playCard={this.playCard}
                showCrib={this.showCrib}
                nextHand={this.nextHand}/>
              
        }
    } 

    render() {
        return <div>
            <LocalPlayerToggle
                localPlayer={this.state.localPlayer}
                toggleLocalPlayer={this.toggleLocalPlayer}
            />
            {this.renderGameBoard()}
        </div>
    }
}