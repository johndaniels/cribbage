import React from 'react';
import { PlayableHand, DisplayHand, Card } from './Cards.jsx';
import PropTypes from 'prop-types';
import styled from 'styled-components';

function getHand(cards, isActive, isVisible, playCard) {
    if (isActive && isVisible) {
        return <PlayableHand cards={cards} playCount={1} play={(cards) => playCard(cards[0])}/>
    } else {
        return <DisplayHand cards={cards} visible={isVisible} />
    }
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

export function Play({game, playCard, showCrib, nextHand, localPlayer, players}) {
    const canMoveForward = game.hands[0].length == 0 && game.hands[1].length == 0;
    const playerOneHand = getHand(game.hands[0], game.currentPlayer == 0 && localPlayer == 0, localPlayer == 0, playCard);
    const playerTwoHand = getHand(game.hands[1], game.currentPlayer == 1 && localPlayer == 1, localPlayer == 1, playCard);
    let moveForwardButton;
    if (!game.cribVisible) {
        moveForwardButton = <button disabled={!canMoveForward} onClick={showCrib}>Show Crib</button>;
    } else {
        moveForwardButton = <button disabled={!game.cribVisible} onClick={nextHand}>Next Hand</button>;
    }
    return <PlayContainer>
        <HandsContainer>
            <p>{players[0].playerName}&apos;s Hand</p>
            {playerOneHand}
            <p></p>
            
            <p>{players[1].playerName}&apos;s Hand</p>
            {playerTwoHand}
        </HandsContainer>
        <PlayedContainer>
            <p>Played</p>
            <DisplayHand cards={game.playedCards[0]} visible />
            <DisplayHand cards={game.playedCards[1]} visible />
            <p>Crib</p>
                <DisplayHand cards={game.cribCards} visible={game.cribVisible } />
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
}