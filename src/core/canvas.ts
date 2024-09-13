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

  const computedStyle = window.getComputedStyle(document.body);
  const color = computedStyle.getPropertyValue("--yellow");

  const getRelativePosition = (element: HTMLLIElement): Point => {
    const elementRect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    return {
      x: elementRect.left - canvasRect.left + elementRect.width / 2,
      y: elementRect.top - canvasRect.top + elementRect.height / 2
    }
  }


  const drawLine = (from: Point, to: Point, lineSize: number) => {
      context.filter = `blur(${lineSize}px)`;
      context.shadowBlur = lineSize / 1.5;
      context.shadowOffsetX = lineSize / 3;
      context.shadowOffsetY = lineSize / 3;
      context.shadowColor = "gray";

      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);

      context.strokeStyle = color;
      context.lineWidth = lineSize;
      context.lineCap = "round";

      context.stroke();
  }

  const draw = (activeElements: HTMLLIElement[]) => {
    const lineSize = 0.25 * parseFloat(getComputedStyle(document.body).fontSize);

    elements = activeElements;

    context.clearRect(0, 0, canvas.width, canvas.height);

    links?.forEach(link => {
      const fromElement = activeElements.at(link.originSequence);
      const toElement = activeElements.at(link.sequence);

      if(!fromElement || !toElement) return;

      const from = getRelativePosition(fromElement);
      const to = getRelativePosition(toElement);

      let mode: 'center' | 'edge' = 'center';
      if(
        (link.originSequence === 1 && link.sequence === 0) ||
        (link.originSequence === 1 && link.sequence === 2) ||
        (link.originSequence === 2 && link.sequence === 0) 
      ) {
        mode = 'edge';
      }

      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      if(mode === 'edge') {
        const fromX = from.x + (from.x < to.x ? 1 : -1) * fromRect.width / 2;

        drawLine({ x: fromX, y: from.y }, { x: to.x, y: from.y }, lineSize);
        drawLine({ x: to.x, y: from.y }, to, lineSize);
      } else {
        const toX = to.x + (to.x < from.x ? 1 : -1) * toRect.width / 2;

        drawLine(from, { x: from.x, y: to.y }, lineSize);
        drawLine({ x: from.x, y: to.y }, { x: toX, y: to.y }, lineSize);
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