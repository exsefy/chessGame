import React, { createContext, useReducer } from 'react';
import GameReducer from './GameReducer';

const initialState = {
    possibleMoves: [],
    turn: 'w',
    check: false,
    gameOver: false,
    status: '', 
    playerName: '',
    playerColor: '',
    opponentName: '',
    message: '',
    opponentMoves: [],
     
};

export const GameContext = createContext(initialState);

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(GameReducer, initialState);

    return (
        <GameContext.Provider value={{ ...state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};