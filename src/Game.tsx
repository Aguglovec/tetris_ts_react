import React, { useEffect, useRef, useState } from "react";
import "./Game.css";
import {useInterval} from "./modules/hooks/useInterval";
import {boardColor, brickColor, canvasX, canvasY, nextColor, scale, stackColor, timeDelay} from "./gameConfig";
import { coordinate2D, lineFilling } from "./types/types";
import { randomBrick } from "./modules/bricks/bricks";
import { drawObj } from "./modules/utils/utils";


function Game() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [ currentBrick, setCurrentBrick ] = useState(startBrickPosition(randomBrick()));
	const [ nextBrick, setNextBrick ] = useState(startBrickPosition(randomBrick()));
	const [ stack, setStack ] = useState<coordinate2D[]>([]);
	const [ direction, setDirection ] = useState<coordinate2D>({x : 0, y : 1});
	const [ delay, setDelay ] = useState<number | null>(null);
	const [ score, setScore ] = useState(0);
	const [ gameOver, setGameOver ] = useState(false);

	useInterval(() => runGame(), delay);

	useEffect(
		() => {
			if (canvasRef.current) {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.setTransform(scale, 0, 0, scale, 0, 0);
					ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
					ctx.fillStyle = boardColor;
					drawObj (ctx, stack, stackColor);
					drawObj (ctx, currentBrick, brickColor);
					drawObj (ctx, nextBrickDemoPosition(nextBrick), nextColor);
					setDirection({x : 0, y : 1});
				}
			}
		},
		[ stack, currentBrick, gameOver, delay, nextBrick ]
	)

function handleScore () {
	if (score > Number(localStorage.getItem("tetrisScore"))) {
		localStorage.setItem("tetrisScore", JSON.stringify(score));
	}
}
	
	function play() {
		setStack([]);
		setCurrentBrick(startBrickPosition(randomBrick()));
		setNextBrick(startBrickPosition(randomBrick()));
		setDirection({x : 0, y : 1});
		setDelay(timeDelay);
		setGameOver(false);
		setScore(0);
	}

	function startBrickPosition  (brick:coordinate2D[]) : coordinate2D[] {
		const startPosition = Math.floor(canvasX/(scale*2));
		return brick.map((segment) => {
			return {x:segment.x + startPosition, y:segment.y}
		})
	}

	function nextBrickDemoPosition  (brick:coordinate2D[]) : coordinate2D[] {
		const nextPosition = Math.floor(canvasX/(scale*2) - 2 );
		return brick.map((segment) => {
			return {x:segment.x + nextPosition, y:segment.y + 2}
		})
	}

	function rotateBrick (brick:coordinate2D[]) {
		const position = brick[0];
		const clearBrick = brick.map((segment) => {
			return {x:segment.x - position.x, y:segment.y - position.y}
		})
		const rotatedBrick = clearBrick.map((segment) => {return { x:-segment.y+position.x, y:segment.x + position.y }});		
		if (checkCollision(rotatedBrick)) return brick
		else setCurrentBrick (rotatedBrick);
	}

	function checkCollision (brick: coordinate2D[]) {
		for (const brickSegment of brick) {
			if (brickSegment.x < 0 || brickSegment.x >= canvasX/scale || brickSegment.y >= canvasY/scale) {
				return true
			}
			for (const stackElement of stack) {
				if (brickSegment.x === stackElement.x && brickSegment.y === stackElement.y) {
					return true
				}
			}
		}
		return false
	}


	function findFullLinesIndexes(stack:coordinate2D[]) {
		const maxLineLength = canvasX/scale;
		const lines: lineFilling = {};
		const fullLines : number[] = [];
		for (const element of stack) {
			lines[(element.y)] ? lines[element.y] += 1 : lines[element.y] = 1;
			}
		
		for (const key in lines) {
			if (lines[key] === maxLineLength) {
				fullLines.push(Number(key));
			}
		}
		return fullLines
	}

	function removeFullLines (stack : coordinate2D[], fullLines : number[]) {
		const newStack : coordinate2D[] = [];
		for (const element of stack) {
			let dropHeight = 0;
			let remove = false;
			for (const line of fullLines) {
				if (element.y < line) {
					dropHeight++					
				} 
				else if (element.y === line) {
					remove = true;
				}
			}
			if (!remove) newStack.push({x:element.x, y: element.y + dropHeight})
		}
		setStack(newStack);
		fullLines.forEach(()=> setScore(score+10));
	}

	function checkGameOver (stack: coordinate2D[]) {
		for (const stackSegment of stack) {
			if (stackSegment.y <= 1) return true
		}
		return false
	}

	function runGame() {
		//side collision check
		let newBrick = currentBrick.map((segment) => {return { x:segment.x + direction.x, y:segment.y + direction.y }});
		if (checkCollision(newBrick)) {
			newBrick = currentBrick.map((segment) => {return { x:segment.x, y:segment.y + direction.y }});
		}
		// botton collision check
		const nextMovePosition = newBrick.map((segment) => {return { x:segment.x, y:segment.y + direction.y }});
		if (checkCollision(nextMovePosition)) {

			const newStack = [...stack]; 
			newBrick.forEach((segment) => newStack.push(segment));
			setStack(newStack);
			removeFullLines(newStack, findFullLinesIndexes(newStack));
			if (checkGameOver(newStack)) {
				setDelay(null);
				handleScore();
				setGameOver(true);
			} else {
				setDelay(timeDelay);
				setCurrentBrick(nextBrick);
				setNextBrick(startBrickPosition(randomBrick()));
			}
		}
		else {
			setCurrentBrick(newBrick);
		}
	}

	function changeDirection(e: React.KeyboardEvent<HTMLDivElement>) {
		setDelay(timeDelay)
			switch (e.key) {
				case "ArrowLeft":
					setDirection({x : direction.x-1, y : 1});
					break
				case "ArrowUp":
					rotateBrick(currentBrick);
					break
				case "ArrowRight":
					setDirection({x :  direction.x+1, y : 1});
					break
				case "ArrowDown":
					delay ? setDelay(delay/4) : null;
					break
			}
	}

	return (
		<div onKeyDown={(e) => changeDirection(e)} >
			<div className="scoreBox">
				<h2>Score: {score}</h2>
				<h2>High Score: {localStorage.getItem("tetrisScore")}</h2>
			</div>
			{gameOver && <div className="gameOver">Game Over</div>}
			<canvas className="playArea border-4 border-red-500" ref={canvasRef} width={`${canvasX}px`} height={`${canvasY}px`} />
			<button onClick={play} className="playButton">
				Play
			</button>
		</div>
		
	)
}

export default Game