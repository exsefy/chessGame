import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {Chess} from 'chess.js';
import io from 'socket.io-client';
import qs from 'query-string';
import { createBoard } from '../../functions';
import Board from '../../components/board';
import Player from '../../components/player';
import { GameContext } from '../../context/GameContext';
import {getGameOverState} from '../../functions/game-over.js';
import GameOver from '../../components/gameover';
import {
    setMessage,
    setOpponent,
    setOpponentMoves,
    setPlayer,
    setPlayerColor,
    types
} from '../../context/actions';
import './game-styles.css';

const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
// draw/Stalemate
//const FEN = '4k3/4P3/4K3/8/8/8/8/8 b - - 0 78';
const socket = io('localhost:5000');

const Game = () => {
	const [fen, setFen] = useState(FEN);
	const { current: chess } = useRef(new Chess(fen));
	const [board, setBoard] = useState(createBoard(fen));
	const location = useLocation();
	const navigate = useNavigate();
	const playerName = useRef();
	const gameID = useRef();
	const {
        dispatch,
        gameOver,
        playerName: player,
        opponentName,
        playerColor,
    } = useContext(GameContext);

	useEffect(() => {
		setBoard(createBoard(fen));
	}, [fen]);

	useEffect(() => {
		const { id, name } = qs.parse(location.search);
		playerName.current = name;
		gameID.current = id;
	}, [location.search]);

	useEffect(() => {
		socket.emit(
			'join',
			{ name: playerName.current, gameID: gameID.current },
			({ error, color }) => {
				if (error) {
					navigate('/');
				}
				dispatch(setPlayer(playerName.current));
				dispatch(setPlayerColor(color));
			}
		);
		socket.on('welcome', ({ message, opponent }) => {
			dispatch(setMessage(message));
			dispatch(setOpponent(opponent));
		});
		socket.on('opponentJoin', ({ message, opponent }) => {
			dispatch(setMessage(message));
			dispatch(setOpponent(opponent));
		});
		socket.on('opponentMove', ({ from, to }) => {
			chess.move({ from, to });
			setFen(chess.fen());
			dispatch(setMessage('Your Turn'));
			dispatch(setOpponentMoves([from, to]));
		});
		socket.on('message', ({ message }) => {
			dispatch(setMessage(message));
		});
	}, [chess, navigate, dispatch]);

	useEffect(() => {
		const [gameOver, status] = getGameOverState(chess);
		if (gameOver) {
			dispatch({ type: types.GAME_OVER, status, player: chess.turn() });
			return;
		}
		dispatch({
			type: types.SET_TURN,
			player: chess.turn(),
			check: chess.inCheck(),
		});
	}, [fen, dispatch, chess]);

	const fromPos = useRef();

	const makeMove = (pos) => {
		const from = fromPos.current;
		chess.move({ from, to: pos });
		dispatch({ type: types.CLEAR_POSSIBLE_MOVES });
		setFen(chess.fen());
		socket.emit('move', { gameID: '20', from, to: pos });
	};

	const setFromPos = (pos) => {
		fromPos.current = pos;
		dispatch({
			type: types.SET_POSSIBLE_MOVES,
			moves: chess.moves({ square: pos }),
		});
	};
	
	if (gameOver) {
		return <GameOver />;
	}
		return (
			<div className="game">
				<Player name={player} color={playerColor} player />
				<Player name={opponentName} color={playerColor === 'w' ? 'b' : 'w'} />
				<Board cells={board} makeMove={makeMove} setFromPos={setFromPos} />
			</div>
		);
};

export default Game;