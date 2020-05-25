import { fullDeck, shuffleDeck } from './cards.js';
import update from 'immutability-helper';

export const PHASE = {
    LOBBY: 'LOBBY',
    CUTTING_FOR_DEAL: 'CUTTING_FOR_DEAL',
    LAY_AWAY: 'LAY_AWAY',
    PLAYING: 'PLAYING',
    CUTTING: 'CUTTING',
};

function operationForPlayer(player, operation, value) {
    const operationObject = {}
    operationObject[operation] = value;
    const result = {}
    result[player] = operationObject;
    return result;
}

function setForPlayer(player, value) {
    const update = {};
    update[player] = {$set: value};
    return update;
}

function removeCards(hand, cardIndices) {
    const newHand = hand.filter((_, i) => !cardIndices.includes(i));
    const removed = hand.filter((_, i) => cardIndices.includes(i));
    return [newHand, removed]
}

export function createGame(prng) {
    if (!prng) {
        throw new Error("PRNG is required");
    }
    return {
        dealer: null,
        phase: PHASE.CUTTING_FOR_DEAL,
        cuttingState: {
            deck: shuffleDeck(fullDeck(), prng),
            currentPlayer: 0,
            cutCards: [null, null]
        },
        deck: null,
        cutCard: null,
        currentPlayer: null,
        playedCards: [[], []],
        hands: [[], []],
        cribVisible: false,
    }
}

export function markPlayerReady(game, player, playerName) {
    const newGame = update(game, {
        playerNames: setForPlayer(player, playerName),
        playerReady: setForPlayer(player, true),
    });
    if (newGame.playerReady[0] && newGame.playerReady[1]) {
        return update(newGame, {
            phase: { $set: PHASE.CUTTING_FOR_DEAL },
        })
    } else {
        return newGame;
    }
}

export function cutForDeal(game, position) {
    let cutCard = game.cuttingState.deck[position];
    let cutCardUpdate = {};
    cutCardUpdate[game.cuttingState.currentPlayer] = {$set: cutCard}
    const nextPlayer = (game.cuttingState.currentPlayer + 1) %2
    return update(game, {
        cuttingState: {
            currentPlayer: {$set: nextPlayer},
            deck: {$splice: [[position, 1]]},
            cutCards: setForPlayer(game.cuttingState.currentPlayer, cutCard),
        }
    });
}

export function resetCutting(game, prng) {
    if (!prng) {
        throw new Error("PRNG is required");
    }
    return update(game, {
        cuttingState: {$set: 
            {
                currentPlayer: 0,
                deck: shuffleDeck(fullDeck(), prng),
                cutCards: [null, null]
            }
        }
    });
}

export function startLayAway(game, dealer, prng) {
    if (!prng) {
        throw new Error("PRNG is required");
    }
    let deck = shuffleDeck(fullDeck(), prng);
    let hands = [
        [deck[0], deck[2], deck[4], deck[6], deck[8], deck[10]],
        [deck[1], deck[3], deck[5], deck[7], deck[9], deck[11]],
    ];
    if (dealer > 0) {
        hands = [hands[1], hands[0]];
    }
    return update(game, {
        dealer: {$set: dealer},
        phase: {$set: PHASE.LAY_AWAY},
        cuttingState: {$set: null},
        cribCards: {$set: [] },
        hands: {$set: hands },
        deck: {$set: deck.slice(12)},
    })
}

export function layAwayCards(game, player, cardIndices) {
    const [newHand, cribCards] = removeCards(game.hands[player], cardIndices);
    return update(game, {
        hands: setForPlayer(player, newHand),
        cribCards: {$push: cribCards}
    })
}

export function startCut(game) {
    return update(game, {
        phase: {$set: PHASE.CUTTING}
    });
}

export function cutDeck(game, position) {
    return update(game, {
        cutCard: {$set: game.deck[position]},
        deck: {$set: null},
    })
}

export function startPlay(game) {
    return update(game, {
        phase: {$set: PHASE.PLAYING},
        currentPlayer: {$set: (game.dealer + 1) % 2},
        playedCards: {$set: [[], []] }
    });
}

export function playCard(game, cardIndex) {
    const player = game.currentPlayer;
    const [newHand, playedCards] = removeCards(game.hands[player], [cardIndex]);
    return update(game, {
        currentPlayer: {$set: (game.currentPlayer + 1) % 2},
        playedCards: operationForPlayer(player, "$push", playedCards),
        hands: setForPlayer(player, newHand),
    });
}

export function showCrib(game) {
    return update(game, {
        cribVisible: { $set: true}
    });
}

export function nextHand(game, prng) {
    if (!prng) {
        throw new Error("PRNG is required");
    }
    const deck = shuffleDeck(fullDeck(), prng);
    let dealer = (game.dealer + 1) % 2;
    let hands = [
        [deck[0], deck[2], deck[4], deck[6], deck[8], deck[10]],
        [deck[1], deck[3], deck[5], deck[7], deck[9], deck[11]],
    ];
    if (dealer > 0) {
        hands = [hands[1], hands[0]];
    }

    return update(game, {
        phase: {$set: PHASE.LAY_AWAY},
        cuttingState: {$set: null},
        dealer: {$set: dealer },
        cribVisible: {$set: false },
        currentPlayer: {$set: null },
        cutCard: {$set: null },
        cribCards: {$set: [] },
        playedCards: {$set: [[],[]]},
        hands: {$set: hands },
        deck: {$set: deck.slice(12)},
    });
}
