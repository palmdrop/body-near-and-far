import { Component, createSignal, For } from "solid-js";
import { LineEntry, Section, Sequence } from "~/types/sequence";

type Props = {
  sequence: Sequence
}

export const SequenceRenderer: Component<Props> = ({ sequence }) => {
  const renderLineEntry = (lineEntry: LineEntry, i: number) => {
    if(!lineEntry.content.length) {
      return <></>;
    } else {
      const words = lineEntry.content.split(" ");

      return (
        <For each={words}>
          {word => {
            const emphasized = word.startsWith("*") && word.endsWith("*");
            if(emphasized) {
              word = word.slice(1, -1);
            }

            return (
              <span class={`${emphasized ? "emphasized" : ""}`}>
                {word}{" "}
              </span>
            );
          }}
        </For>
      );
    }
  }

  const renderSection = (section: Section) => {
      { /* <h1>{section.title}</h1> */ }
    return (
      <ul class="section">
        <For each={section.lines}>
          {(lineEntry, i) => (
            <li>
              { renderLineEntry(lineEntry, i()) }
            </li>
          )}
        </For>
      </ul>
    );
  }

  return (
    <ul class="sequence">
      <For each={sequence}>{
        section => (
          <li>
            {renderSection(section)}
          </li>
        )
      }</For>
    </ul>
  );
}