type Loop = {
  rate: number,
  callback: (delta: number) => void,
}

export const createLoops = (loops: Loop[]) => {
  let animationFrame: number;

  let thens: number[];

  const setThens = () => {
    thens = Array(loops.length).fill(Date.now());
  }

  const animate = () => {
    const now = Date.now();

    loops.forEach(({ callback, rate }, i) => {
      const then = thens[i];
      const delta = now - then;

      if(delta > rate) {
        thens[i] = now - (delta % rate);
        callback(delta);
      }
    });

    animationFrame = requestAnimationFrame(animate);
  }

  const start = () => {
    debugger
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