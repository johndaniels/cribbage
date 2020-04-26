import {fullDeck, shuffleDeck, compareCards} from './cards';

test('full deck shuffled and sorted is itself', () => {
    const actual = shuffleDeck(fullDeck());
    actual.sort(compareCards);
    expect(actual).toStrictEqual(fullDeck());
})