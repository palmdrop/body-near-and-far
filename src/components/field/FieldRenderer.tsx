import { Title } from "@solidjs/meta";
import { Component, Show, Switch, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Field } from "~/types/field";

type Props = {
  field: Field,
  startIndex?: number,
  delay: number,
  subDelay?: number,
  setTitle?: boolean
}


const getWord = (field: Field, index: number, subIndex: number): string => {
  const line = field[index];
  if(isSubField(line)) {
    return line[subIndex];
  }

  return line;
}

const isSubField = (line: Field[number]): line is string[] => {
  return Array.isArray(line); 
}

export const FieldRenderer: Component<Props> = ({ 
  field, 
  startIndex = 0, 
  delay,
  subDelay = delay / 2,
  setTitle
}) => {
  const [index, setIndex] = createSignal(startIndex);
  const [subIndex, setSubIndex] = createSignal(0);

  const inSubField = createMemo(() => {
    return isSubField(field[index()]);
  });

  const line = createMemo(() => {
    return field[index()];
  })

  const word = createMemo(() => {
    return getWord(field, index(), subIndex());
  });

  createEffect(() => {
    let interval: NodeJS.Timeout;
    if(!inSubField()) {
      interval = setInterval(() => {
        setIndex(i => (i + 1) % field.length);
        setSubIndex(0);
      }, delay);
    }

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  createEffect(() => {
    if(!inSubField()) return;

    const interval = setInterval(() => {
      setSubIndex(i => {
        if(i + 1 >= line().length) {
          setIndex(i => (i + 1) % field.length);
          return 0;
        }

        return i + 1;
      });
    }, subDelay);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

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