import React, {useState} from 'react';
import PropTypes from 'prop-types';

export default function HomePage({createGame, alreadyExists, gameName, setGameName, noSuchGame}) {

    return <div>
        {noSuchGame ? <p>This game ({gameName}) does not exist. You can create it with the form below:</p>: null}
        <input value={gameName} onChange={(e) => setGameName(e.target.value)} />
        <button onClick={() => createGame(gameName)}>Create Game</button>
        {alreadyExists ? `This game (${gameName}) already exists. Try a different name or join at ${window.location.host}/${gameName}` : null}
    </div>
}

HomePage.propTypes = {
    createGame: PropTypes.func,
}