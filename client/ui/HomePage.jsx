import React from 'react';
import PropTypes from 'prop-types';

export default function HomePage({createGame}) {
    return <div>
        <button onClick={createGame}>Create Game</button>
        Your Games:
    </div>
}

HomePage.propTypes = {
    createGame: PropTypes.func,
}