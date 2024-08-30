import { FollowedLink } from "~/types/links";

export const createCanvas = (
  canvas: HTMLCanvasElement, 
) => {
  const context = canvas.getContext("2d");

  const draw = () => {

  }

  const addLink = (link: FollowedLink) => {

  }

  const resize = (parent: HTMLElement) => {
    
  }

  return {
    draw,
    addLink,
    resize
  }
}