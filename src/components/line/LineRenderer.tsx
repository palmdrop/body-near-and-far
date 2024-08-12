import { Component, createMemo, For } from "solid-js";

type Props = {
  line: string,
  active?: boolean
}

export const LineRenderer: Component<Props> = props => {
  const words = createMemo(() => {
    // TODO: split on "-" also, but make sure not to append space after these words, and to re-insert the "-"
    return props.line.split(" ");
  });

  return (
    <For each={words()}>
      {word => {
        const emphasized = word.startsWith("*") && word.endsWith("*");
        if(emphasized) {
          word = word.slice(1, -1);
        }

        return (
          <span 
            class={`${emphasized ? "emphasized" : ""} ${props.active ? "active" : ""}`}
          >
            {word}{" "}
          </span>
        );
      }}
    </For>
  );
}