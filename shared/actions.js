import { 
    markPlayerReady,
    cutForDeal,
    resetCutting,
    layAwayCards,
    startCut,
    cutDeck,
    startPlay,
    playCard,
    showCrib,
    startLayAway,
    nextHand,
    reorderCards,
} from './game.js';

export const CUT_DECK = 'CUT_DECK';

export const ACTION_TYPE = {
    MARK_PLAYER_READY: 'MARK_PLAYER_READY',
    CUT_FOR_DEAL: 'CUT_FOR_DEAL',
    RESET_CUTTING: 'RESET_CUTTING',
    START_LAY_AWAY: 'START_LAY_AWAY',
    LAY_AWAY_CARDS: 'LAY_AWAY_CARDS',
    START_CUT: 'START_CUT',
    CUT_DECK: 'CUT_DECK',
    START_PLAY: 'START_PLAY',
    PLAY_CARD: 'PLAY_CARD',
    SHOW_CRIB: 'SHOW_CRIB',
    NEXT_HAND: 'NEXT_HAND',
    REORDER_CARDS: 'REORDER_CARDS',
};

export function markPlayerReadyAction(player, playerName) {
    return { type: ACTION_TYPE.MARK_PLAYER_READY, player, playerName };
}

export function cutForDealAction(position) {
    return { type: ACTION_TYPE.CUT_FOR_DEAL, position };
}

export function resetCuttingAction() {
    return { type: ACTION_TYPE.RESET_CUTTING };
}

export function startLayAwayAction(dealer) {
    return { type: ACTION_TYPE.START_LAY_AWAY, dealer };
}

export function layAwayCardsAction(player, cardIndices) {
    return { type: ACTION_TYPE.LAY_AWAY_CARDS, player, cardIndices };
}

export function startCutAction() {
    return { type: ACTION_TYPE.START_CUT };
}

export function cutDeckAction(position) {
    return { type: ACTION_TYPE.CUT_DECK, position};
}

export function startPlayAction() {
    return { type: ACTION_TYPE.START_PLAY };
}

export function playCardAction(cardIndex) {
    return { type: ACTION_TYPE.PLAY_CARD, cardIndex };
}

export function showCribAction() {
    return { type: ACTION_TYPE.SHOW_CRIB };
}

export function nextHandAction() {
    return { type: ACTION_TYPE.NEXT_HAND };
}

export function reorderCardsAction({which, player, from, to}) {
    return {
        type: ACTION_TYPE.REORDER_CARDS,
        which,
        player,
        from,
        to,
    }
}

export function processAction(game, prng, action) {
    switch (action.type) {
        case ACTION_TYPE.MARK_PLAYER_READY:
            return markPlayerReady(game, action.player, action.playerName);
        case ACTION_TYPE.CUT_FOR_DEAL:
            return cutForDeal(game, action.position);
        case ACTION_TYPE.RESET_CUTTING:
            return resetCutting(game, prng);
        case ACTION_TYPE.START_LAY_AWAY:
            return startLayAway(game, action.dealer, prng);
        case ACTION_TYPE.LAY_AWAY_CARDS:
            return layAwayCards(game, action.player, action.cardIndices);
        case ACTION_TYPE.START_CUT:
            return startCut(game);
        case ACTION_TYPE.CUT_DECK:
            return cutDeck(game, action.position)
        case ACTION_TYPE.START_PLAY:
            return startPlay(game);
        case ACTION_TYPE.PLAY_CARD:
            return playCard(game, action.cardIndex)
        case ACTION_TYPE.SHOW_CRIB:
            return showCrib(game);
        case ACTION_TYPE.NEXT_HAND:
            return nextHand(game, prng);
        case ACTION_TYPE.REORDER_CARDS:
            return reorderCards({
                game: game,
                which: action.which,
                player: action.player,
                from: action.from,
                to: action.to,
            });
        default:
            throw new Error("Bad action type!");
    }
}