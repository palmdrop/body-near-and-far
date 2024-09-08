type Loop = {
  rate: number,
  callback: (delta: number, shouldTrigger?: boolean) => void,
  constant?: boolean
}

export const createLoops = (loops: Loop[]) => {
  let animationFrame: number;
  let thens: number[];

  const setThens = (thenAspect = 1) => {
    const now = Date.now();
    thens = loops.map(({ rate }) => now - rate * (1 - thenAspect));
  }

  setThens();

  const animate = () => {
    const now = Date.now();

    loops.forEach(({ callback, rate, constant }, i) => {
      const then = thens[i];
      const delta = now - then;

      if(delta > rate) {
        thens[i] = now - (delta % rate);
        callback(delta, true);
      } else if(constant) {
        callback(delta, false);
      }
    });

    animationFrame = requestAnimationFrame(animate);
  }

  const start = (thenAspect?: number) => {
    setThens(thenAspect);
    animate();
  }

  const stop = () => {
    cancelAnimationFrame(animationFrame);
  }

  return {
    start,
    stop
  };
}