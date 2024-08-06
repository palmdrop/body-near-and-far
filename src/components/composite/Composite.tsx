import { Component, For } from "solid-js";

type Props = {
  lines: string[]
}

export const Composite: Component<Props> = ({ lines }) => {
  return (
    <article class="composite">
      <For each={lines}>
        {line => <p>{line}</p>}
      </For>
    </article>
  );
}