type Loop = {
  rate: number,
  callback: (delta: number, shouldTrigger?: boolean) => void,
  constant?: boolean
}

// If paused for a while, immediately move to next frame... but if first, wait for appropriate time
export const createLoops = (loops: Loop[]) => {
  let animationFrame: number;

  let thens: number[];

  const setThens = () => {
    thens = Array(loops.length).fill(Date.now());
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

  const start = () => {
    // TODO: Store delta? make sure timer is preserved between pauses?
    setThens();
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