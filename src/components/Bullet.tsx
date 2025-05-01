import React from 'react';
import { TILE_SIZE } from '../logic/constants';
import './Bullet.css';

type BulletProps = {
    x: number;
    y: number;
};

const Bullet: React.FC<BulletProps> = ({ x, y }) => {
    return (
        <div
            className="bullet"
            style={{
                transform: `translate(${x * TILE_SIZE}px, ${y * TILE_SIZE}px)`,
                width: TILE_SIZE / 4,
                height: TILE_SIZE / 4,
            }}
        />
    );
};

export default Bullet;
