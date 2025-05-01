import React from 'react';
import { TILE_SIZE } from '../logic/constants';
import './PlayerTank.css';

type PlayerTankProps = {
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
    color?: string;
    isActive?: boolean;
};

const PlayerTank: React.FC<PlayerTankProps> = ({
    x,
    y,
    direction,
    color = 'green',
    isActive = true,
}) => {
    const background = isActive
        ? color
        : 'linear-gradient(135deg, #b72d2d, #ff9900)';

    return (
        <div
            className={`player-tank ${isActive ? direction : 'dead'}`}
            style={{
                transform: `translate(${x * TILE_SIZE}px, ${y * TILE_SIZE}px)`,
                width: TILE_SIZE,
                height: TILE_SIZE,
                background,
                opacity: isActive ? 1 : 0.8,
                filter: isActive ? 'none' : 'grayscale(40%) brightness(90%)',
            }}
        />
    );
};

export default PlayerTank;

