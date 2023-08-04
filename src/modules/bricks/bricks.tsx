import { coordinate2D } from "../../types/types";

export const bricks : coordinate2D[][] = [
    [{x:0,y:0},{x:0,y:-1},{x:0,y:1},{x:0,y:2}],
    [{x:0,y:0},{x:0,y:-1},{x:0,y:1},{x:-1,y:1}],
    [{x:0,y:0},{x:0,y:-1},{x:0,y:1},{x:1,y:1}],
    [{x:0,y:0},{x:0,y:1},{x:1,y:0},{x:1,y:1}],
    [{x:0,y:0},{x:0,y:1},{x:-1,y:0},{x:1,y:1}],
    [{x:0,y:0},{x:0,y:1},{x:-1,y:1},{x:1,y:0}],
    [{x:0,y:0},{x:0,y:1},{x:-1,y:0},{x:1,y:0}],
]

export function randomBrick() {
    return bricks[Math.floor(Math.random() * bricks.length)]
}