import { Accessor, Component, createEffect, createMemo, For } from "solid-js";
import { LineEntry, Section, Sequence } from "~/types/sequence";
import { getMaxIndex } from "~/utils/sequence";
import { LineRenderer } from "../line/LineRenderer";

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

  const renderLineEntry = (lineEntry: LineEntry) => {
    if(!lineEntry.content.length) {
      return <></>;
    } else {
      return (
        <LineRenderer 
          line={lineEntry.content} 
          active={props.activeIndex() === lineEntry.index} 
        />
      );
    }
  }

  const renderSection = (section: Section) => {
    return (
      <ul class="section">
        <For each={section.lines}>
          {lineEntry => (
            <li
              ref={element => lines[lineEntry.index] = element}
            >
              { renderLineEntry(lineEntry) }
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
    <ul class="sequence filtered" ref={root}>
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