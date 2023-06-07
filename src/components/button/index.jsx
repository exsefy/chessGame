import React from 'react';
import './button-styles.css';

const Button = ({ onClick, children }) => {
    return (
        <button onClick={onClick} className="button">
            {children}
        </button>
    );
};

export default Button;