import React, { useEffect, useRef, useState } from 'react';
import PlayerTank from './PlayerTank';

type Direction = 'up' | 'down' | 'left' | 'right';

type Target = {
    x: number;
    y: number;
    isAlive: boolean;
};

type BotTankProps = {
    x: number;
    y: number;
    getTargets: () => Target[];
    map: string[][];
    onShoot: (x: number, y: number, direction: Direction) => void;
    getObstacles: () => { x: number; y: number }[];
    reportPosition: (x: number, y: number) => void;
    isActive: boolean;
    reservedPositions: React.MutableRefObject<Set<string>>; // 👈 NEW
};

const BotTank: React.FC<BotTankProps> = ({
    x,
    y,
    getTargets,
    map,
    onShoot,
    getObstacles,
    reportPosition,
    isActive,
    reservedPositions,
}) => {
    const [position, setPosition] = useState({ x, y });
    const [direction, setDirection] = useState<Direction>('down');
    const positionRef = useRef(position);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const isCellFree = (x: number, y: number): boolean => {
        if ((map[y]?.[x] !== 'empty') && (map[y]?.[x] !== 'bush')) return false;
        const obstacles = getObstacles();
        if (obstacles.some((obj) => obj.x === x && obj.y === y)) return false;

        return !reservedPositions.current.has(`${x},${y}`);
    };

    const canShoot = (target: Target): boolean => {
        const { x, y } = positionRef.current;

        if (target.x === x) {
            for (let i = Math.min(y, target.y) + 1; i < Math.max(y, target.y); i++) {
                if (!isCellFree(x, i)) return false;
            }
            return true;
        }

        if (target.y === y) {
            for (let i = Math.min(x, target.x) + 1; i < Math.max(x, target.x); i++) {
                if (!isCellFree(i, y)) return false;
            }
            return true;
        }

        return false;
    };

    const lastReportedPosition = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (
            !lastReportedPosition.current ||
            lastReportedPosition.current.x !== position.x ||
            lastReportedPosition.current.y !== position.y
        ) {
            reportPosition(position.x, position.y);
            lastReportedPosition.current = { x: position.x, y: position.y };
        }
    }, [position, reportPosition]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isActive) return;

            const current = positionRef.current;
            const targets = getTargets().filter((t) => t.isAlive);
            if (targets.length === 0) return;

            const target = targets.reduce((closest, t) => {
                const dist = Math.abs(t.x - current.x) + Math.abs(t.y - current.y);
                const closestDist = Math.abs(closest.x - current.x) + Math.abs(closest.y - current.y);
                return dist < closestDist ? t : closest;
            }, targets[0]);

            if (!target) return;

            const dx = target.x - current.x;
            const dy = target.y - current.y;

            const isAligned = target.x === current.x || target.y === current.y;

            if (isAligned && canShoot(target)) {
                const shootDir =
                    target.x === current.x
                        ? target.y > current.y ? 'down' : 'up'
                        : target.x > current.x ? 'right' : 'left';

                setDirection(shootDir);
                if (Math.random() < 0.4) {
                    onShoot(current.x, current.y, shootDir);
                }
                return;
            }

            const tryMove = (dir: Direction): boolean => {
                let [tx, ty] = [current.x, current.y];
                if (dir === 'up') ty -= 1;
                if (dir === 'down') ty += 1;
                if (dir === 'left') tx -= 1;
                if (dir === 'right') tx += 1;

                if (isCellFree(tx, ty)) {
                    reservedPositions.current.add(`${tx},${ty}`);
                    setDirection(dir);
                    setPosition({ x: tx, y: ty });
                    return true;
                }
                return false;
            };

            const mainDir =
                Math.abs(dx) > Math.abs(dy)
                    ? dx > 0 ? 'right' : 'left'
                    : dy > 0 ? 'down' : 'up';

            const altDir =
                Math.abs(dx) > Math.abs(dy)
                    ? dy > 0 ? 'down' : 'up'
                    : dx > 0 ? 'right' : 'left';

            if (!tryMove(mainDir)) {
                tryMove(altDir);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [map, onShoot, getTargets, getObstacles, isActive, reservedPositions]);

    return (
        <PlayerTank
            x={position.x}
            y={position.y}
            direction={direction}
            isActive={isActive}
            color="red"
        />
    );
};

export default BotTank;
