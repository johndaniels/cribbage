import React from 'react';
import { CuttableDeck, Card } from './Cards.jsx';
import PropTypes from 'prop-types';

export function Cut({deck, cutCard, cutDeck, startPlay, dealer, localPlayer}) {

    let deckOrCard;
    if (cutCard) {
        deckOrCard = <div>
            <p>Result Card:</p>
            {cutCard ? <Card card={cutCard} visible={true} /> : null}
            <button onClick={() => startPlay()}>Start Play</button>
        </div>;
    } else {
        deckOrCard = <CuttableDeck cards={deck} cutForDeal={cutDeck} disabled={dealer==localPlayer}/>;
    }
    return <div>
        {deckOrCard}
        <div>
            <p>Phase: Cutting </p>
        </div>
    </div>;
}

Cut.propTypes = {
    deck: PropTypes.array,
    cutCard: PropTypes.object,
    cutDeck: PropTypes.func,
    startPlay: PropTypes.func,
    dealer: PropTypes.number,
    localPlayer: PropTypes.number,
}