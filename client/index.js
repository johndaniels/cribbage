import ReactDOM from 'react-dom';
import React from 'react';
import { Game } from './ui/Game.jsx';

const element = document.createElement("div");
document.body.appendChild(element);

ReactDOM.render(<Game />, element);