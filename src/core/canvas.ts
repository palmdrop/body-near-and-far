import { FollowedLink } from "~/types/links";

export const createCanvas = (
  canvas: HTMLCanvasElement, 
) => {
  const context = canvas.getContext("2d");

  let links: FollowedLink[] | undefined = undefined;
  let elements: HTMLLIElement[] | undefined = undefined;

  const draw = (activeElements: HTMLLIElement[]) => {
    elements = activeElements;

    context?.clearRect(0, 0, canvas.width, canvas.height);

    links?.forEach(link => {
      const fromElement = activeElements.at(link.originSequence);
      const toElement = activeElements.at(link.sequence);
      // TODO: need to render line relative to canvas position...
      /*
      context?.beginPath();
      context?.moveTo(link.from.x, link.from.y);
      context?.lineTo(link.to.x, link.to.y);
      context?.stroke();
      */
    });
  }

  const setLinks = (newLinks: FollowedLink[]) => {
    links = newLinks;
  }

  const clearLinks = () => {
    links = undefined;
  }

  const resize = (parent: HTMLElement) => {
    canvas.width = parent.clientWidth; 
    canvas.height = parent.clientHeight;
    draw(elements ?? []);
  }

  return {
    draw,
    setLinks,
    clearLinks,
    resize
  }
}