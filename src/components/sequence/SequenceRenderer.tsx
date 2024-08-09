import { Accessor, Component, createEffect, createMemo, For } from "solid-js";
import { LineEntry, Section, Sequence } from "~/types/sequence";
import { getMaxIndex } from "~/utils/sequence";

type Props = {
  sequence: Sequence,
  activeIndex: Accessor<number>,
  activeElementCallback: (element: HTMLLIElement, root: HTMLUListElement) => void
}

export const SequenceRenderer: Component<Props> = (props) => {
  const maxIndex = getMaxIndex(props.sequence)

  let root: HTMLUListElement | undefined;
  const lines: (HTMLLIElement | undefined)[] = Array
    .from<HTMLLIElement | undefined>({ length: maxIndex + 1 })
    .fill(undefined);

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
              <span 
                class={`${emphasized ? "emphasized" : ""} ${props.activeIndex() === lineEntry.index ? "active" : ""}`}
              >
                {word}{" "}
              </span>
            );
          }}
        </For>
      );
    }
  }

  const renderSection = (section: Section) => {
    return (
      <ul class="section">
        <For each={section.lines}>
          {(lineEntry, i) => (
            <li
              ref={element => lines[lineEntry.index] = element}
            >
              { renderLineEntry(lineEntry, i()) }
            </li>
          )}
        </For>
      </ul>
    );
  }

  createEffect(() => {
    const element = lines[props.activeIndex()];
    props.activeElementCallback(element!, root!);
  });

  return (
    <ul class="sequence" ref={root}>
      <For each={props.sequence}>{
        section => (
          <li>
            {renderSection(section)}
          </li>
        )
      }</For>
    </ul>
  );
}