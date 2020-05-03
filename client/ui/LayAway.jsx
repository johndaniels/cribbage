import React from 'react';
import { PlayableHand, DisplayHand } from './Cards.jsx';
import PropTypes from 'prop-types';

export function LayAway({game, layAwayCards, startCut, localPlayer, players}) {
    const canMoveForward = game.hands[0].length == 4 && game.hands[1].length == 4;
    function renderHand(player) {
        if (player == localPlayer) {
            return <PlayableHand cards={game.hands[player]} playCount={game.hands[player].length - 4} play={(cards) => layAwayCards(player, cards)}/>;
        } else {
            return <DisplayHand cards={game.hands[player]} visible={false}/>
        }
    }
    return <div>
        <p>{players[0].playerName}</p>
        {renderHand(0)}
        <p>{players[1].playerName}</p>
        {renderHand(1)}
        <p>Crib</p>
        <DisplayHand cards={game.cribCards} />
        <button disabled={!canMoveForward} onClick={startCut}>Move to Cut</button>
    </div>
}

LayAway.propTypes = {
    game: PropTypes.object,
    layAwayCards: PropTypes.func,
    startCut: PropTypes.func,
    localPlayer: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object)
}