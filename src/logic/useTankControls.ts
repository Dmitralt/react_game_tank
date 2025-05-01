import { useEffect, useState, useRef } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

export interface TankControlConfig {
    keys: {
        up: string;
        down: string;
        left: string;
        right: string;
        shoot?: string;
        color?: string;
    };
    getOtherTanks?: () => { x: number; y: number }[];

    initialPosition: { x: number; y: number };
    initialDirection?: Direction;
    tankSpeed?: number;
    map: string[][];
    onShoot?: (x: number, y: number, direction: Direction) => void;
}

export function useTankControls(config: TankControlConfig) {
    const {
        keys,
        initialPosition,
        initialDirection = 'up',
        tankSpeed = 300,
        map,
        onShoot,
    } = config;

    const [position, setPosition] = useState(initialPosition);
    const [direction, setDirection] = useState<Direction>(initialDirection);
    const [moveKey, setMoveKey] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);

    const moveIntervalRef = useRef<number | null>(null);
    const speedRef = useRef(tankSpeed);
    const mapRef = useRef(map);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        speedRef.current = tankSpeed;
    }, [tankSpeed]);

    useEffect(() => {
        mapRef.current = map;
    }, [map]);



    useEffect(() => {
        if (moveIntervalRef.current !== null) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }

        if (!moveKey || !isActive) return;

        const move = () => {
            setPosition((prev) => {
                let { x, y } = prev;
                let newX = x;
                let newY = y;

                if (moveKey === keys.up) {
                    setDirection('up');
                    newY -= 1;
                }
                if (moveKey === keys.down) {
                    setDirection('down');
                    newY += 1;
                }
                if (moveKey === keys.left) {
                    setDirection('left');
                    newX -= 1;
                }
                if (moveKey === keys.right) {
                    setDirection('right');
                    newX += 1;
                }

                const tile = mapRef.current[newY]?.[newX];
                const blockedByOtherTank = config.getOtherTanks?.().some(
                    (tank) => tank.x === newX && tank.y === newY
                );

                if (
                    newX >= 0 &&
                    newY >= 0 &&
                    newY < mapRef.current.length &&
                    newX < mapRef.current[0].length &&
                    (tile === 'empty' || tile === 'goal' || tile === 'bush') &&
                    !blockedByOtherTank
                ) {
                    return { x: newX, y: newY };
                }

                return prev;
            });
        };


        move();
        moveIntervalRef.current = window.setInterval(move, speedRef.current);

        return () => {
            if (moveIntervalRef.current !== null) {
                clearInterval(moveIntervalRef.current);
                moveIntervalRef.current = null;
            }
        };
    }, [moveKey, isActive]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat || !isActive) return;

            if (Object.values(keys).includes(e.key)) {
                if ([keys.up, keys.down, keys.left, keys.right].includes(e.key)) {
                    setMoveKey(e.key);
                }

                if (e.key === keys.shoot && onShoot) {
                    onShoot(position.x, position.y, direction);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === moveKey) {
                setMoveKey(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [moveKey, direction, keys, position, onShoot, isActive]);

    return {
        position,
        direction,
        isActive,
        deactivate: () => setIsActive(false),
    };
}
