import { Component, For } from "solid-js";
import { LineEntry, Section, Sequence } from "~/types/sequence";

type Props = {
  sequence: Sequence
}

export const SequenceRenderer: Component<Props> = ({ sequence }) => {

  const renderLineEntry = (lineEntry: LineEntry) => {
    if(lineEntry.type === 'space') {
      return <div style={{
        height: `${lineEntry.length ** 2}ch`
      }} />
    } else {
      return <span>{`${lineEntry.content} `}</span>;
    }
  }

  const renderSection = (section: Section) => {
    return <div class="section">
      <h1>{section.title}</h1>
      <ul>
        <For each={section.lines}>
          {lineEntry => (
            <li>
              { renderLineEntry(lineEntry) }
            </li>
          )}
        </For>
      </ul>
    </div>
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