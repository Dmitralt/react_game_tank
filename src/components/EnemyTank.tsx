import React from 'react';
import { TILE_SIZE } from '../logic/constants';
import './EnemyTank.css';

interface Props {
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
}

const EnemyTank: React.FC<Props> = ({ x, y, direction }) => {
    return (
        <div
            className={`enemy-tank ${direction}`}
            style={{
                left: `${x * TILE_SIZE}px`,
                top: `${y * TILE_SIZE}px`,
                width: TILE_SIZE,
                height: TILE_SIZE,
                position: 'absolute',
            }}
        />
    );
};

export default EnemyTank;
