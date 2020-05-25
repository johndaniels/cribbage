import React, { useState } from 'react';
import styled, {css} from 'styled-components';
import PropTypes from 'prop-types';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';

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

const CardContainer = styled.div`
    width: ${props => props.narrow ? "30px" : "120px"};
    ${props => props.playable && css`
        cursor: pointer;
        &:hover {
            margin-top: -20px;
        }
        margin-top: ${props => props.selected ? "-40px" : "0px"};
    `}
`;

const CardList = styled.div`
    display: flex; 
    margin-top: 40px;
`;

const SortableCardContainer = SortableElement(({card, playable, narrow, selected, onClick, visible}) => {
    return <CardContainer key={card.suit + card.value} playable={playable} narrow={narrow} selected={selected}>
        <Card key={card.suit + card.value} card={card} onClick={onClick} visible={visible}/>
    </CardContainer>;
});

const SortableCardList = SortableContainer(({cards, canPlay, playCount, visible, narrow, canReorder, selectedIndices, setSelectedIndices}) => {

    const cardDivs = cards.map((card, index) => {
        // Only handle clicks if we are playable
        const onClick = canPlay && playCount > 0 ? () => {
            const newSelectedIndices = selectedIndices.includes(index) ?
                selectedIndices.filter(i => i != index) :
                selectedIndices.concat([index]);
            if (newSelectedIndices.length > playCount) {
                return;
            }
            setSelectedIndices(newSelectedIndices);
        } : null;
        return <SortableCardContainer
            key={card.suit + card.value}
            index={index}
            card={card}
            playable={canPlay && playCount > 0}
            selected={selectedIndices.includes(index)}
            narrow={narrow}
            visible={visible}
            onClick={onClick}
            disabled={!canReorder}
        />
    });
    return <CardList>
        {cardDivs}
    </CardList>
})

export const Hand = SortableContainer(function Hand({cards, canPlay, playCount, playText, visible, narrow, play, reorder}) {
    const [selectedIndices, setSelectedIndices] = useState([]);
    
    return <div>
        <SortableCardList
            cards={cards}
            canPlay={canPlay}
            playCount={playCount}
            visible={visible}
            narrow={narrow}
            selectedIndices={selectedIndices}
            setSelectedIndices={setSelectedIndices}
            reorder={reorder}
            axis="x"
            distance={20}
            onSortEnd={reorder}
            canReorder={!!reorder}
        />
        {canPlay && <button disabled={playCount <= 0 || selectedIndices.length != playCount} onClick={() => {setSelectedIndices([]); play(selectedIndices)}}>{playText || "Play Card(s)"}</button>}
    </div>;
})

Hand.propTypes = {
    cards: PropTypes.array,
    play: PropTypes.func,
    playCount: PropTypes.number,
    reorder: PropTypes.func,
    visible: PropTypes.bool,
    narrow: PropTypes.bool,
    playText: PropTypes.string,
    canPlay: PropTypes.bool, // Indicates whether the current user can _ever_ play from this hand (and thus should show a button)
}