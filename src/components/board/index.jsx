import React from 'react';
import './board-styles.css';
import Cell from '../cell';
import PropTypes from 'prop-types';


const Board = ({ cells, ...props }) => {
    return (
        <div className="board">
            {cells.map((cell, index) => (
                <Cell cell={cell} index={index} key={cell.pos} {...props} />
                ))}
        </div>
    );
};


Board.prototype = {
    cells: PropTypes.array.isRequired,
    makeMove: PropTypes.func,
    setFromPos: PropTypes.func,
};
export default Board;