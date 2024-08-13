import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { throttle } from "@solid-primitives/scheduled";

/* Based on https://codepen.io/Valgo/pen/PowZaNY */

const minThreshold = -80;
const maxThreshold = -50;

export const Filter: Component = () => {
  const [threshold, setThreshold] = createSignal(-50);

  const pixelValueToNumber = (pixelValue: string) => {
    return Number(pixelValue.slice(0, -2));
  }

  onMount(() => {
    const computeThreshold = throttle(() => {
      const computedStyle = window.getComputedStyle(document.body);

      const minFontSize = pixelValueToNumber(
        computedStyle.getPropertyValue("--min-font-size")
      );

      const maxFontSize = pixelValueToNumber(
        computedStyle.getPropertyValue("--max-font-size")
      );

      const fontSize = pixelValueToNumber(
        computedStyle.fontSize
      );

      const delta = (fontSize - minFontSize) / (maxFontSize - minFontSize);
      const threshold = (maxThreshold - minThreshold) * delta + minThreshold;

      setThreshold(threshold);
    }, 100);

    computeThreshold();
    window.addEventListener("resize", computeThreshold);

    onCleanup(() => {
      computeThreshold.clear();
      window.removeEventListener("resize", computeThreshold);
    });
  });

  return (
    <svg id="filters" style="position: absolute">
      <defs>
        <filter id="threshold">
          <feColorMatrix in="SourceGraphic"
            type="matrix"
            values={`1 0 0 0 0
                     0 1 0 0 0
                     0 0 1 0 0
                     0 0 0 255 ${threshold()}`}
          />
        </filter>
      </defs>
    </svg>
  );
};