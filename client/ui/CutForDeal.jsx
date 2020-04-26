import React from 'react';
import { CuttableDeck, Card } from './Cards.jsx';
import PropTypes from 'prop-types';

export function CutForDeal({cuttingState, cutForDeal, resetCutting, startLayAway}) {

    return <div>
        <CuttableDeck cards={cuttingState.deck} cutForDeal={cutForDeal} />
        <div>
            <p>Player 1 Card:</p>
            {cuttingState.cutCards[0] ? <Card card={cuttingState.cutCards[0]} /> : null}
        </div>
        <div>
            <p>Player 2 Card:</p>
            {cuttingState.cutCards[1] ? <Card card={cuttingState.cutCards[1]} /> : null}
        </div>
        {
            true || cuttingState.cutCards[0] && cuttingState.cutCards[1] ? 
                <div>
                    <button onClick={() => resetCutting()}>Cut Again</button>
                    <button onClick={() => startLayAway(0)}> Player 1 Deals </button>
                    <button onClick={() => startLayAway(1)}> Player 2 Deals </button>
                </div>
            : null
        }
        <div>
            <p>Phase: Cutting For Deal </p>
            <p>Player: {cuttingState.currentPlayer}</p>
        </div>
    </div>;
}

CutForDeal.propTypes = {
    cuttingState: PropTypes.object,
    cutForDeal: PropTypes.func,
    resetCutting: PropTypes.func,
    startLayAway: PropTypes.func,
}