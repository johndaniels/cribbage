import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export default function Lobby({game, localPlayer, markPlayerReady}) {

    const [playerName, setPlayerName] = useState("");

    const otherPlayerReady = game.playerReady[(localPlayer + 1) % 2];
    let status = otherPlayerReady ? "Other Player is ready" : "Waiting for other player";
    const localPlayerReady = game.playerReady[localPlayer]

    return <div>
        <label>Player Name</label>
        <input disabled={localPlayerReady} value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
        <button disabled={localPlayerReady} onClick={() => markPlayerReady(playerName)}>
            {localPlayerReady ? "Ready to Play!" : "Set Ready to Play"}
        </button>
        <div>{status}</div>
    </div>;
}

Lobby.propTypes = {
    localPlayer: PropTypes.number,
    game: PropTypes.object,
    markPlayerReady: PropTypes.func,
}