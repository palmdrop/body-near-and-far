import { Component, For } from "solid-js";

type Props = {
  lines: string[],
  fieldWord: string,
  index: string
}

export const Composite: Component<Props> = (props) => {
  return (
    <article class="composite">
      <For each={props.lines}>
        {line => <p>{line}</p>}
      </For>
      <p class="field">
        { props.fieldWord }
      </p>
      <p class="index">
        { props.index }
      </p>
    </article>
  );
}