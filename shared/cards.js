import shuffle from 'shuffle-array';

export const SUITS = {
    SPADES: 'SPADES',
    DIAMONDS: 'DIAMONDS',
    HEARTS: 'HEARTS',
    CLUBS: 'CLUBS',
};

const SUIT_ORDER = {
    CLUBS: 0,
    DIAMONDS: 1,
    HEARTS: 2,
    SPADES: 3,
};

function card(suit, value) {
    return {
        suit,
        value,
    };
}

export function compareCards(a, b) {
    if (a.value < b.value) {
        return -1;
    } else if (a.value > b.value) {
        return 1;
    } else if (SUIT_ORDER[a.suit] < SUIT_ORDER[b.suit]) {
        return -1;
    } else if (SUIT_ORDER[a.suit] > SUIT_ORDER[b.suit]) {
        return 1;
    }
    return 0;
}

export function shuffleDeck(cards, prng) {
    const result = cards.slice(0);
    shuffle(result, {rng: prng});
    return result;
}

export function fullDeck() {
    const cards = [];
    for (var i=1; i<=12; i++) {
        for (var suit of [SUITS.CLUBS, SUITS.DIAMONDS, SUITS.HEARTS, SUITS.SPADES]) {
            cards.push(card(suit, i));
        }
    }
    return cards;
}