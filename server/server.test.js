import Server from './server.js';

class WebSocketMock {
    constructor() {
        this.eventHandlers = {};
        this.messages = [];
    }

    on(name, func) {
        if (!this.eventHandlers[name]) {
            this.eventHandlers[name] = [];
        }
        this.eventHandlers[name].push(func);
    }

    trigger(name, ...params) {
        for (const handler of this.eventHandlers[name]) {
            handler(...params);
        }
    }

    triggerMessage(message) {
        this.trigger("message", JSON.stringify(message));
    }

    send(message) {
        this.messages.push(JSON.parse(message));
    }
}

function connectAndSendInfo(server, client, playerId, playerName) {
    server.acceptConnection(client);
    client.triggerMessage({
        type: 'playerInfo',
        playerInfo: {
            playerId,
            playerName,
        }
    });
}

test('Networking Test', () => {
    const server = new Server();
    const clientOne = new WebSocketMock();
    const clientTwo = new WebSocketMock();

    connectAndSendInfo(server, clientOne, "1", "one");
    expect(Object.keys(server.players)).toStrictEqual(["1"]);

    clientOne.triggerMessage({
        type: 'create',
        gameId: 'gameId',
    });
    const createResult = clientOne.messages[0]
    expect(createResult).toMatchObject({
        type: 'gameState',
    });
    connectAndSendInfo(server, clientTwo, "2", "two");

    clientTwo.triggerMessage({
        type: 'join',
        gameId: createResult.gameState.gameId,
    });
    expect(clientTwo.messages[0]).toMatchObject({
        type: 'gameState',
    });
    expect(clientOne.messages[1]).toMatchObject({
        type: 'players',
    });

    clientOne.trigger('close');
});

test('Test Close Before Game Start', () => {
    const server = new Server();
    const clientOne = new WebSocketMock();

    connectAndSendInfo(server, clientOne, "1", "one");

    expect(Object.keys(server.players)).toStrictEqual(["1"]);

    clientOne.trigger("close");
});

test('Test Close Second Client', () => {
    const server = new Server();
    const clientOne = new WebSocketMock();
    const clientTwo = new WebSocketMock();

    connectAndSendInfo(server, clientOne, "1", "one");

    clientOne.triggerMessage({
        type: 'create',
        gameId: 'game',
    });
    const createResult = clientOne.messages[0];
    connectAndSendInfo(server, clientTwo, "2", "two");
    clientTwo.triggerMessage({
        type: 'join',
        gameId: createResult.gameState.gameId,
    });

    clientTwo.trigger("close");
});

test('Test Second PlayerInfo', () => {
    const server = new Server();
    const clientOne = new WebSocketMock();
    const clientTwo = new WebSocketMock();

    connectAndSendInfo(server, clientOne, "1", "one");

    clientOne.triggerMessage({
        type: 'create',
        gameId: 'first',
    });
    const createResult = clientOne.messages[0];
    connectAndSendInfo(server, clientTwo, "2", "two");
    clientTwo.triggerMessage({
        type: 'join',
        gameId: createResult.gameState.gameId,
    });

    clientOne.triggerMessage({
        type: 'playerInfo',
        playerInfo: {
            playerId: '1',
            playerName: 'onesies',
        }
    });
    expect(clientTwo.messages[1]).toStrictEqual({
        type: 'players',
        players: [
            {
                playerId: '1',
                playerName: 'onesies',
            },
            {
                playerId: '2',
                playerName: 'two',
            }
        ]
    });

    clientTwo.trigger("close");
});

test('Test No Game exists', () => {
    const server = new Server();
    const clientOne = new WebSocketMock();
    const clientTwo = new WebSocketMock();

    connectAndSendInfo(server, clientOne, "1", "one");
    expect(Object.keys(server.players)).toStrictEqual(["1"]);

    clientOne.triggerMessage({
        type: 'create',
        gameId: 'first',
    });
    const createResult = clientOne.messages[0]
    expect(createResult).toMatchObject({
        type: 'gameState',
    });
    connectAndSendInfo(server, clientTwo, "2", "two");

    clientTwo.triggerMessage({
        type: 'join',
        gameId: "second",
    });
    expect(clientTwo.messages[0]).toMatchObject({
        type: 'noSuchGame',
    });
});

test('Test Game already exists', () => {
    const server = new Server();
    const clientOne = new WebSocketMock();
    const clientTwo = new WebSocketMock();

    connectAndSendInfo(server, clientOne, "1", "one");
    expect(Object.keys(server.players)).toStrictEqual(["1"]);

    clientOne.triggerMessage({
        type: 'create',
        gameId: 'first',
    });
    const createResult = clientOne.messages[0]
    expect(createResult).toMatchObject({
        type: 'gameState',
    });
    connectAndSendInfo(server, clientTwo, "2", "two");

    clientTwo.triggerMessage({
        type: 'create',
        gameId: 'first',
    });
    expect(clientTwo.messages[0]).toMatchObject({
        type: 'gameAlreadyExists',
    });
});
