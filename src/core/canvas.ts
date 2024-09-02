import { FollowedLink } from "~/types/links";

type Point = {
  x: number,
  y: number
}

export const createCanvas = (
  canvas: HTMLCanvasElement, 
) => {
  const context = canvas.getContext("2d")!;

  let links: FollowedLink[] | undefined = undefined;
  let elements: HTMLLIElement[] | undefined = undefined;

  const getRelativePosition = (element: HTMLLIElement): Point => {
    const elementRect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    return {
      x: elementRect.left - canvasRect.left + elementRect.width / 2,
      y: elementRect.top - canvasRect.top + elementRect.height / 2
    }
  }

  const drawLine = (from: Point, to: Point) => {
      context.filter = "blur(5px)";

      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);

      context.strokeStyle = "black";
      context.lineWidth = 5;
      context.lineCap = "round";

      context.stroke();
  }

  const draw = (activeElements: HTMLLIElement[]) => {
    elements = activeElements;

    context.clearRect(0, 0, canvas.width, canvas.height);

    links?.forEach(link => {
    // [{ originSequence: 0, sequence: 1 }, { originSequence: 1, sequence: 2 }].forEach(link => {
      const fromElement = activeElements.at(link.originSequence);
      const toElement = activeElements.at(link.sequence);

      if(!fromElement || !toElement) return;

      const from = getRelativePosition(fromElement);
      const to = getRelativePosition(toElement);

      if(link.originSequence === 0 || link.sequence === 0) {
        drawLine(from, { x: from.x, y: to.y });
        drawLine({ x: from.x, y: to.y }, to);
      } else {
        drawLine(from, { x: to.x, y: from.y });
        drawLine({ x: to.x, y: from.y }, to);
      }
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