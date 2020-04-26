import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PHASE } from '../game';
import { cutDeck } from '../actions'
import update from 'immutability-helper';

const CardDiv = styled.div`
    width: 100px;
    height: 150px;
    background-color: blue;
    border: 3px solid red;
    color: white;
    `;

export function Card({card, className, onClick, visible}) {
    let text = visible ? card.suit + " " + card.value : null;
    return <CardDiv className={className} onClick={onClick}>
        {text}
    </CardDiv>
}

Card.propTypes = {
    card: PropTypes.shape({
        suit: PropTypes.string,
        value: PropTypes.number,
    }),
    className: PropTypes.string,
    onClick: PropTypes.func,
    visible: PropTypes.bool,
}

const CuttableContainer = styled.div`
    width: 30px;
    cursor: pointer;
    &:hover {
        margin-top: -20px;
    }
`;

const CuttableCards = styled.div`
    display: flex; 
    margin-top: 20px;
`;

export function CuttableDeck({cards, cutForDeal}) {
    const cardDivs = cards.map((card, index) => {
        return <CuttableContainer key={card.suit + card.value}>
            <Card key={card.suit + card.value} card={card} onClick={() => cutForDeal(index)} visible={false}/>
        </CuttableContainer>;
    }).reverse();
    return <CuttableCards>
        {cardDivs}
    </CuttableCards>;
}


CuttableDeck.propTypes = {
    cards: PropTypes.array,
    cutForDeal: PropTypes.func,
}

const PlayableContainer = styled.div`
    width: 120px;
    cursor: pointer;
    margin-top: ${props => props.selected ? "-40px" : "0px"};

    &:hover {
        margin-top: -20px;
    }
`;

const PlayableCards = styled.div`
    display: flex; 
    margin-top: 40px;
`;

export function PlayableHand({cards, play, playCount}) {
    const [selectedIndices, setSelectedIndices] = useState([]);

    const cardDivs = cards.map((card, index) => {

        const onClick = () => {
            const newSelectedIndices = selectedIndices.includes(index) ?
                selectedIndices.filter(i => i != index) :
                selectedIndices.concat([index]);
            if (newSelectedIndices.length > playCount) {
                return;
            }
            setSelectedIndices(newSelectedIndices);
        }
        return <PlayableContainer key={card.suit + card.value} selected={selectedIndices.includes(index)}>
            <Card key={card.suit + card.value} card={card} onClick={onClick} visible={true}/>
        </PlayableContainer>;
    });
    return <div>
        <PlayableCards>
            {cardDivs}
        </PlayableCards>
        <button disabled={playCount <= 0} onClick={() => play(selectedIndices)}>Play Card(s)</button>
    </div>;
}

PlayableHand.propTypes = {
    cards: PropTypes.array,
    play: PropTypes.func,
    playCount: PropTypes.number,
}

const DisplayContainer = styled.div`
    width: 120px;
    cursor: pointer;
`;

const DisplayCards = styled.div`
    display: flex; 
`;

export function DisplayHand({cards, visible}) {
    const cardDivs = cards.map((card) => {

        return <DisplayContainer key={card.suit + card.value} >
            <Card key={card.suit + card.value} card={card} />
        </DisplayContainer>;
    });
    return <DisplayCards>
            {cardDivs}
        </DisplayCards>;
}

DisplayHand.propTypes = {
    cards: PropTypes.array,
    visible: PropTypes.bool,
}