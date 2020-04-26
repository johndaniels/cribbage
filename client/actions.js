export const CUT_DECK = 'CUT_DECK';

export function cutDeck(position) {
    return { type: CUT_DECK, position }
}