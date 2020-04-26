import React from 'react';
import { PlayableHand, DisplayHand } from './Cards.jsx';
import PropTypes from 'prop-types';

export function LayAway({game, layAwayCards, startCut}) {
    const canMoveForward = game.hands[0].length == 4 && game.hands[1].length == 4;
    return <div>
        <p>Player 1</p>
        <PlayableHand cards={game.hands[0]} playCount={game.hands[0].length - 4} play={(cards) => layAwayCards(0, cards)}/>
        <p>Player 2</p>
        <PlayableHand cards={game.hands[1]} playCount={game.hands[1].length - 4} play={(cards) => layAwayCards(1, cards)}/>
        <p>Crib</p>
        <DisplayHand cards={game.cribCards} />
        <button disabled={!canMoveForward} onClick={startCut}>Move to Cut</button>
    </div>
}

LayAway.propTypes = {
    game: PropTypes.object,
    layAwayCards: PropTypes.func,
    startCut: PropTypes.func,
}