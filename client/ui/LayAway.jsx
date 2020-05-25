import React from 'react';
import { Hand } from './Cards.jsx';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const LayAwayContainer = styled.div`
    display: flex;
`

const HandsContainer = styled.div`
    width: 700px;
`;
export function LayAway({game, layAwayCards, startCut, localPlayer, players, reorderHand}) {
    const canMoveForward = game.hands[0].length == 4 && game.hands[1].length == 4;
    function renderHand(player) {
        const isLocalPlayer = player == localPlayer;
        const reorder = isLocalPlayer ? ({oldIndex, newIndex}) => reorderHand(player, oldIndex, newIndex) : null;
        return <Hand 
            cards={game.hands[player]}
            canPlay={isLocalPlayer}
            playCount={game.hands[player].length - 4}
            play={(cards) => layAwayCards(player, cards)}
            visible={isLocalPlayer}
            playText="Lay Away Card(s)"
            reorder={reorder}
        />
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
            <Hand cards={game.cribCards} />
            <button disabled={!canMoveForward} onClick={startCut}>Move to Cut</button>
        </div>
    </LayAwayContainer>
}

LayAway.propTypes = {
    game: PropTypes.object,
    layAwayCards: PropTypes.func,
    startCut: PropTypes.func,
    localPlayer: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object),
    reorderHand: PropTypes.func,
}