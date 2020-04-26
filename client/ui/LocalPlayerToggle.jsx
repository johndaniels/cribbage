import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';


const Toggle = styled.button`
    cursor: pointer;
    background-color: #aaa;
    border-radius: 5px;
    padding: 5px;
`;

export default function LocalPlayerToggle({localPlayer, toggleLocalPlayer}) {
    return <Toggle onClick={toggleLocalPlayer}>
        Current Player: {localPlayer}
    </Toggle>
}

LocalPlayerToggle.propTypes = {
    localPlayer: PropTypes.number,
    toggleLocalPlayer: PropTypes.func,
}