import React from 'react';
import { PlayableHand, DisplayHand } from './Cards.jsx';
import PropTypes from 'prop-types';

function getHand(cards, isActive, playCard) {
    if (isActive) {
        return <PlayableHand cards={cards} playCount={1} play={(cards) => playCard(cards[0])}/>
    } else {
        return <DisplayHand cards={cards} />
    }
}

export function Play({game, playCard, showCrib, nextHand}) {
    const canMoveForward = game.hands[0].length == 0 && game.hands[1].length == 0;
    const playerOneHand = getHand(game.hands[0], game.currentPlayer == 0, playCard);
    const playerTwoHand = getHand(game.hands[1], game.currentPlayer == 1, playCard);
    let moveForwardButton;
    if (!game.cribVisible) {
        moveForwardButton = <button disabled={!canMoveForward} onClick={showCrib}>Show Crib</button>;
    } else {
        moveForwardButton = <button disabled={!game.cribVisible} onClick={nextHand}>Next Hand</button>;
    }
    return <div>
        <p>Player 1</p>
        <p>Played</p>
        <DisplayHand cards={game.playedCards[0]} />
        <p>Hand</p>
        {playerOneHand}
        <p>Player 2</p>
        <p>Played</p>
        <DisplayHand cards={game.playedCards[1]} />
        <p>Hand</p>
        {playerTwoHand}
        <p>Crib</p>
        <DisplayHand cards={game.cribCards} />
        
        {moveForwardButton}
    </div>
}

Play.propTypes = {
    game: PropTypes.object,
    playCard: PropTypes.func,
    showCrib: PropTypes.func,
    nextHand: PropTypes.func,
}