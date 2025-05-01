export const TILE_SIZE = 32;
export const GRID_WIDTH = 13;
export const GRID_HEIGHT = 13;

export type TileType = 'empty' | 'brick' | 'steel' | 'bush' | 'water' | 'ice' | 'base' | 'goal';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Bullet {
    id: number;
    x: number;
    y: number;
    direction: Direction;
}


export interface Enemy {
    id: number;
    x: number;
    y: number;
    direction: 'up' | 'down' | 'left' | 'right';
}
