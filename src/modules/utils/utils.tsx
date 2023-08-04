import { coordinate2D } from "../../types/types";

export function drawObj (ctx : CanvasRenderingContext2D, obj :coordinate2D[], objColor:string) {
	ctx.fillStyle = objColor;
	obj.forEach((segment) => ctx.fillRect(segment.x, segment.y, 1, 1));
}