import { startLayAway, layAwayCards, nextHand, startCut, cutDeck, cutForDeal, createGame, showCrib, PHASE, startPlay, playCard} from './game';
import { compareCards, fullDeck } from './cards';

test('Creating Game and cutting deck twice', () => {
    let game = createGame();

    // Sort cards to make this deterministic
    game.cuttingState.deck.sort(compareCards)
    game = cutForDeal(game, 10);
    game = cutForDeal(game, 10);

    const remainingCards = fullDeck();
    remainingCards.splice(10, 1);
    remainingCards.splice(10, 1);

    const expectedResult = {
        dealer: null,
        phase: PHASE.CUTTING_FOR_DEAL,
        cuttingState: {
            deck: remainingCards,
            currentPlayer: 0,
            cutCards: [
                {
                    suit: "HEARTS",
                    value: 3,
                },
                {
                    suit: "SPADES",
                    value: 3,
                }]
        },
        deck: null,
        cutCard: null,
        currentPlayer: null,
        playedCards: [[], []],
        hands: [[], []],
        cribVisible: false,
    }
    
    expect(game).toStrictEqual(expectedResult);

});

test('Starting Play and layaway', () => {
    let game = createGame();

    // Sort cards to make this deterministic
    const deck = fullDeck();
    game = startLayAway(game, 0, fullDeck());
    game = layAwayCards(game, 0, [1,2]);
    game = layAwayCards(game, 1, [3,4]);
    expect(game).toStrictEqual({
        dealer: 0,
        phase: PHASE.LAY_AWAY,
        cuttingState: null,
        hands: [[deck[0], deck[6], deck[8], deck[10]], [deck[1], deck[3], deck[5], deck[11]]],
        cribCards: [deck[2], deck[4], deck[7], deck[9]],
        deck: deck.slice(12),
        cutCard: null,
        currentPlayer: null,
        playedCards: [[], []],
        cribVisible: false,
    });

    game = startCut(game);
    game = cutDeck(game, 10);
    expect(game.deck).toBe(null);
    expect(game.cutCard).toStrictEqual(deck[22]);

    game = startPlay(game);
    expect(game.currentPlayer).toBe(1);
    expect(game.hands).toStrictEqual([[deck[0], deck[6], deck[8], deck[10]], [deck[1], deck[3], deck[5], deck[11]]]);

    game = playCard(game, 1);
    game = playCard(game, 1);
    expect(game.hands).toStrictEqual([
        [deck[0], deck[8], deck[10]],
        [deck[1], deck[5], deck[11]],
    ]);

    expect(game.playedCards).toStrictEqual([[deck[6]], [deck[3]]]);
    game = playCard(game, 0);
    game = playCard(game, 0);
    game = playCard(game, 0);
    game = playCard(game, 0);
    game = playCard(game, 0);
    game = playCard(game, 0);
    expect(game.hands).toStrictEqual([[], []]);
    expect(game.playedCards).toStrictEqual([
        [deck[6], deck[0], deck[8], deck[10]],
        [deck[3], deck[1], deck[5], deck[11]],
    ]);

    game = showCrib(game);

    expect(game.cribVisible).toBe(true);

    let newDeck = fullDeck();
    game = nextHand(game, newDeck);

    expect(game).toStrictEqual({
        dealer: 1,
        phase: PHASE.LAY_AWAY,
        cuttingState: null,
        hands: [[newDeck[1], newDeck[3], newDeck[5], newDeck[7], newDeck[9], newDeck[11]], [newDeck[0], newDeck[2], deck[4], newDeck[6], newDeck[8], newDeck[10]]],
        cribCards: [ ],
        deck: newDeck.slice(12),
        cutCard: null,
        currentPlayer: null,
        playedCards: [[], []],
        cribVisible: false,
    });
});