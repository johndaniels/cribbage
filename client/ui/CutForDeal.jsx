import React from 'react';
import { CuttableDeck, Card } from './Cards.jsx';
import PropTypes from 'prop-types';

export function CutForDeal({cuttingState, cutForDeal, resetCutting, startLayAway, localPlayer, players}) {

    const allDone = cuttingState.cutCards[1] != null;
    const activePlayer = cuttingState.cutCards[0] == null ? 0 : 1;
    const deck = allDone ? null : <CuttableDeck cards={cuttingState.deck} cutForDeal={cutForDeal} disabled={localPlayer != activePlayer} />;

    function renderStatus() {
        if (allDone) {
            return "Pick a dealer:";
        } else {
            return <div>{players[activePlayer].playerName} to cut:</div>
        }
    }

    return <div>
        {renderStatus()}
        {deck}
        <div>
            <p>{players[0].playerName}&apos;s Card:</p>
            {cuttingState.cutCards[0] ? <Card card={cuttingState.cutCards[0]} visible={true}/> : null}
        </div>
        <div>
            <p>{players[1].playerName}&apos;s Card:</p>
            {cuttingState.cutCards[1] ? <Card card={cuttingState.cutCards[1]} visible={true} /> : null}
        </div>
        {
            <div>
                <button onClick={() => resetCutting()}>Cut Again</button>
                <button onClick={() => startLayAway(0)}> {players[0].playerName} Deals </button>
                <button onClick={() => startLayAway(1)}> {players[1].playerName} Deals </button>
            </div>
        }
    </div>;
}

CutForDeal.propTypes = {
    cuttingState: PropTypes.object,
    cutForDeal: PropTypes.func,
    resetCutting: PropTypes.func,
    startLayAway: PropTypes.func,
    localPlayer: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object)
}