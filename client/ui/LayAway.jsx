import React from 'react';
import { PlayableHand, DisplayHand } from './Cards.jsx';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const LayAwayContainer = styled.div`
    display: flex;
`

const HandsContainer = styled.div`
    width: 700px;
`;
export function LayAway({game, layAwayCards, startCut, localPlayer, players}) {
    const canMoveForward = game.hands[0].length == 4 && game.hands[1].length == 4;
    function renderHand(player) {
        if (player == localPlayer) {
            return <PlayableHand cards={game.hands[player]} playCount={game.hands[player].length - 4} play={(cards) => layAwayCards(player, cards)}/>;
        } else {
            return <DisplayHand cards={game.hands[player]} visible={false}/>
        }
    }
    const topPlayer = (localPlayer + 1) % 2;
    const bottomPlayer = localPlayer;
    return <LayAwayContainer>
        <HandsContainer>
            <p>{players[topPlayer].playerName}</p>
            {renderHand(topPlayer)}
            <p>{players[bottomPlayer].playerName}</p>
            {renderHand(bottomPlayer)}
        </HandsContainer>
        <div>
        <p>Crib</p>
            <DisplayHand cards={game.cribCards} />
            <button disabled={!canMoveForward} onClick={startCut}>Move to Cut</button>
        </div>
    </LayAwayContainer>
}

LayAway.propTypes = {
    game: PropTypes.object,
    layAwayCards: PropTypes.func,
    startCut: PropTypes.func,
    localPlayer: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object)
}