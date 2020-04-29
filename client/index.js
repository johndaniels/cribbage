import ReactDOM from 'react-dom';
import React from 'react';
import { Game } from './ui/Game.jsx';
import StateManager from './stateManager.js';

const element = document.createElement("div");
document.body.appendChild(element);

const stateManager = new StateManager();
ReactDOM.render(<Game stateManager={stateManager} />, element);