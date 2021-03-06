import React from 'react';
import { Card, Hand } from './Cards.jsx';
import PropTypes from 'prop-types';
import styled from 'styled-components';

function getHand(cards, player, currentPlayer, localPlayer, playCard, reorderHand, pass) {
    const isCurrent = currentPlayer == player;
    const isLocal = localPlayer == player;
    const playerReorder = player==localPlayer ? ({oldIndex, newIndex}) => reorderHand(player, oldIndex, newIndex) : null;
    return <div>
        <Hand
        cards={cards}
        playCount={isCurrent && isLocal ? 1 : 0}
        visible={isLocal}
        canPlay={isLocal}
        play={(cards) => playCard(cards[0])}
        reorder={playerReorder}
        />
        {isLocal && <button disabled={!isCurrent} onClick={pass}>Pass</button>}
    </div>
}

const PlayContainer = styled.div`
    display: flex;
`;

const HandsContainer = styled.div`
    width: 500px;
`;

const PlayedContainer = styled.div`
    width: 500px;
`

export function Play({game, playCard, showCrib, nextHand, localPlayer, players, reorderHand, pass}) {
    const canMoveForward = game.hands[0].length == 0 && game.hands[1].length == 0;
    const topPlayer = (localPlayer + 1) % 2;
    const bottomPlayer = localPlayer;

    const topPlayerHand = getHand(game.hands[topPlayer], topPlayer, game.currentPlayer, localPlayer, playCard, reorderHand, pass);
    const bottomPlayerHand = getHand(game.hands[bottomPlayer], bottomPlayer, game.currentPlayer, localPlayer, playCard, reorderHand, pass);
    let moveForwardButton;
    if (!game.cribVisible) {
        moveForwardButton = <button disabled={!canMoveForward} onClick={showCrib}>Show Crib</button>;
    } else {
        moveForwardButton = <button disabled={!game.cribVisible} onClick={nextHand}>Next Hand</button>;
    }

    return <PlayContainer>
        <HandsContainer>
            <p>{players[topPlayer].playerName}&apos;s Hand</p>
            {topPlayerHand}
            
            <p>{players[bottomPlayer].playerName}&apos;s Hand</p>
            {bottomPlayerHand}
        </HandsContainer>
        <PlayedContainer>
            <p>Played</p>
            <Hand cards={game.playedCards[topPlayer]} visible />
            <Hand cards={game.playedCards[bottomPlayer]} visible />
            <p>Crib</p>
                <Hand cards={game.cribCards} visible={game.cribVisible } />
                {moveForwardButton}
        </PlayedContainer>
        <div>
            <p>Cut Card</p>
            <Card card={game.cutCard} visible/>
        </div>
    </PlayContainer>
}

Play.propTypes = {
    game: PropTypes.object,
    playCard: PropTypes.func,
    showCrib: PropTypes.func,
    nextHand: PropTypes.func,
    localPlayer: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object),
    reorderHand: PropTypes.func,
    reorderCrib: PropTypes.func,
    pass: PropTypes.func,
}