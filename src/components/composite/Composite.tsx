import { Component, For } from "solid-js";
import { Field } from "~/types/field";
import { FieldRenderer } from "../field/FieldRenderer";

type Props = {
  field: Field,
  lines: string[],
  fieldDelay: number
}

export const Composite: Component<Props> = (props) => {
  return (
    <article class="composite">
      <For each={props.lines}>
        {line => <p>{line}</p>}
      </For>
      <FieldRenderer 
        field={props.field} 
        delay={props.fieldDelay} 
        subDelay={props.fieldDelay / 2}
        setTitle={true}
      />
    </article>
  );
}