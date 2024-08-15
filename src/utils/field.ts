import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Field } from "~/types/field";

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

export const createFieldIterator = (
  field: Field,
  startIndex: number,
  delay: number,
  subDelay: number
) => {
  const [index, setIndex] = createSignal(0);
  const [subIndex, setSubIndex] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(true);

  onMount(() => {
    setIndex(startIndex % field.length);
  })

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
    if(!isRunning()) return;

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
    if(!inSubField() || !isRunning()) return;

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

  return {
    word,
    inSubField,
    index,
    setIsRunning
  }
}