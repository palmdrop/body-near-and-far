import { Component, createMemo, For } from "solid-js";

type Props = {
  line: string,
  active?: boolean
}

export const LineRenderer: Component<Props> = props => {
  const words = createMemo(() => props.line.split(" "));

  return (
    <For each={words()}>
      {word => {
        const emphasized = word.startsWith("*") && word.endsWith("*");
        if(emphasized) {
          word = word.slice(1, -1);
        }

        const hyphenated = word.endsWith("-");

        return (
          <span 
            classList={{
              word: true,
              emphasized,
              active: props.active,
              filtered: props.active
            }}
          >
            {word}{!hyphenated ? " " : ""}
          </span>
        );
      }}
    </For>
  );
}