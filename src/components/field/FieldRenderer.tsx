import { Title } from "@solidjs/meta";
import { Component, Show } from "solid-js";
import { Field } from "~/types/field";
import { createFieldIterator } from "~/utils/field";

type Props = {
  field: Field,
  startIndex?: number,
  delay: number,
  subDelay?: number,
  setTitle?: boolean
}

export const FieldRenderer: Component<Props> = ({ 
  field, 
  startIndex = 0, 
  delay,
  subDelay = delay / 2,
  setTitle
}) => {
  const { 
    word, 
    inSubField 
  } = createFieldIterator(field, startIndex, delay, subDelay);

  return (
    <p>
      <Show when={setTitle}>
        <Title>{word()?.toUpperCase()}</Title> 
      </Show>
      <Show when={inSubField()}>
        {"[ "}
      </Show>
      {word()}
      <Show when={inSubField()}>
        {" ]"}
      </Show>
    </p>
  );
}