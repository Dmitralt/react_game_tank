import React, { useState, useEffect, useRef } from 'react';
import { initialMap } from '../logic/map';
import { TILE_SIZE, Bullet } from '../logic/constants';
import PlayerTank from './PlayerTank';
import BulletComponent from './Bullet';
import { useTankControls } from '../logic/useTankControls';
import './GameBoard.css';
import BotTank from './BotTank';

let bulletId = 0;

const GameBoard: React.FC = () => {
    const [map, setMap] = useState(initialMap);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [tankSpeed, setTankSpeed] = useState(300);
    const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);

    const reservedPositions = useRef<Set<string>>(new Set());
    useEffect(() => {
        reservedPositions.current.clear();
    });

    const [bots, setBots] = useState(() => [
        { id: 1, position: { x: 5, y: 5 }, isActive: true },
        { id: 2, position: { x: 7, y: 5 }, isActive: true },
    ]);
    const botsRef = useRef(bots);

    useEffect(() => {
        botsRef.current = bots;
    }, [bots]);

    const updateBotPosition = (id: number, x: number, y: number) => {
        setBots((prev) =>
            prev.map((bot) =>
                bot.id === id ? { ...bot, position: { x, y } } : bot
            )
        );
    };

    const deactivateBot = (id: number) => {
        setBots((prev) =>
            prev.map((bot) =>
                bot.id === id ? { ...bot, isActive: false } : bot
            )
        );
    };

    const mapRef = useRef(map);
    useEffect(() => {
        mapRef.current = map;
    }, [map]);

    const handleShoot = (
        x: number,
        y: number,
        direction: 'up' | 'down' | 'left' | 'right'
    ) => {
        setBullets((prev) => [
            ...prev,
            {
                id: bulletId++,
                x,
                y,
                direction,
            },
        ]);
    };
    const player1Ref = useRef<any>(null);
    const player2Ref = useRef<any>(null);

    const player1 = useTankControls({
        keys: {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            shoot: ' ',
        },
        initialPosition: { x: 10, y: 12 },
        map,
        tankSpeed,
        onShoot: handleShoot,
        getOtherTanks: () => {
            return [
                ...botsRef.current.map((b) => b.position),
                player2Ref.current?.position ?? { x: -1, y: -1 },
            ];
        },
    });

    const player2 = useTankControls({
        keys: {
            up: 'w',
            down: 's',
            left: 'a',
            right: 'd',
            shoot: 'f',
        },
        initialPosition: { x: 2, y: 12 },
        map,
        tankSpeed,
        onShoot: handleShoot,
        getOtherTanks: () => {
            return [
                ...botsRef.current.map((b) => b.position),
                player1Ref.current?.position ?? { x: -1, y: -1 },
            ];
        },
    });

    useEffect(() => {
        player1Ref.current = player1;
        player2Ref.current = player2;
    }, [player1, player2]);




    useEffect(() => {
        if (winner) return;

        const goalReached = (player: typeof player1 | typeof player2) => {
            const tile = map[player.position.y]?.[player.position.x];
            return tile === 'goal' && player.isActive;
        };

        if (goalReached(player1)) {
            setWinner('player1');
        } else if (goalReached(player2)) {
            setWinner('player2');
        }
    }, [player1.position, player2.position, map, winner, player1.isActive, player2.isActive]);
    useEffect(() => {
        if (!winner) return;

        setBots(prev => prev.map(bot => ({ ...bot, isActive: false })));

        if (winner === 'player1') {
            player2.deactivate();
        } else {
            player1.deactivate();
        }
    }, [winner]);

    useEffect(() => {
        const handleSpeedChange = (e: KeyboardEvent) => {
            if (e.key === '1') setTankSpeed(300);
            if (e.key === '2') setTankSpeed(200);
            if (e.key === '3') setTankSpeed(100);
        };
        window.addEventListener('keydown', handleSpeedChange);
        return () => window.removeEventListener('keydown', handleSpeedChange);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setBullets((prevBullets) => {
                const newBullets: Bullet[] = [];
                const updatedMap = map.map((row) => [...row]);

                for (const bullet of prevBullets) {
                    let { x, y } = bullet;

                    if (bullet.direction === 'up') y -= 1;
                    if (bullet.direction === 'down') y += 1;
                    if (bullet.direction === 'left') x -= 1;
                    if (bullet.direction === 'right') x += 1;

                    if (
                        player1.isActive &&
                        player1.position.x === x &&
                        player1.position.y === y
                    ) {
                        player1.deactivate();
                        continue;
                    }

                    if (
                        player2.isActive &&
                        player2.position.x === x &&
                        player2.position.y === y
                    ) {
                        player2.deactivate();
                        continue;
                    }

                    const hitBot = botsRef.current.find(
                        (bot) =>
                            bot.isActive &&
                            bot.position.x === x &&
                            bot.position.y === y
                    );
                    if (hitBot) {
                        deactivateBot(hitBot.id);
                        continue;
                    }

                    if (
                        x < 0 ||
                        y < 0 ||
                        y >= updatedMap.length ||
                        x >= updatedMap[0].length
                    )
                        continue;

                    const tile = updatedMap[y][x];

                    if (tile === 'brick') {
                        updatedMap[y][x] = 'empty';
                        continue;
                    }

                    if (tile === 'steel') continue;

                    newBullets.push({ ...bullet, x, y });
                }

                setMap(updatedMap);
                return newBullets;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [map]);

    return (
        <div
            className="game-board"
            style={{
                width: `${TILE_SIZE * map[0].length}px`,
                height: `${TILE_SIZE * map.length}px`,
                position: 'relative',
            }}
        >
            {map.map((row, rowIndex) =>
                row.map((tile, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`tile ${tile}`}
                    ></div>
                ))
            )}


            <PlayerTank
                x={player1.position.x}
                y={player1.position.y}
                direction={player1.direction}
                isActive={player1.isActive}
                color="blue"
            />

            {/*  <PlayerTank
                x={player2.position.x}
                y={player2.position.y}
                direction={player2.direction}
                isActive={player2.isActive}
                color="purple"
            />*/}

            {bots.map((bot) => (
                <BotTank
                    key={bot.id}
                    x={bot.position.x}
                    y={bot.position.y}
                    getTargets={() => [
                        {
                            x: player1.position.x,
                            y: player1.position.y,
                            isAlive: player1.isActive,
                        },
                        /* {
                            x: player2.position.x,
                            y: player2.position.y,
                            isAlive: player2.isActive,
                        },*/
                    ]}
                    map={map}
                    onShoot={handleShoot}
                    getObstacles={() => [
                        { x: player1.position.x, y: player1.position.y },
                        // { x: player2.position.x, y: player2.position.y },
                        ...botsRef.current.map((b) => b.position),
                    ]}
                    reportPosition={(x, y) => updateBotPosition(bot.id, x, y)}
                    isActive={bot.isActive}
                    reservedPositions={reservedPositions}
                />
            ))}

            {bullets.map((b) => (
                <BulletComponent key={b.id} x={b.x} y={b.y} />
            ))}
        </div>
    );
};

export default GameBoard;
