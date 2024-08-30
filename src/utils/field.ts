import { createMemo, createSignal, onMount } from "solid-js";
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
) => {
  const [index, setIndex] = createSignal(0);
  const [subIndex, setSubIndex] = createSignal(0);

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

  const incrementMainIndex = () => {
    setIndex(i => (i + 1) % field.length);
  }

  const update = () => {
    if(!inSubField()) {
      incrementMainIndex();
      setSubIndex(0);
    } else {
      setSubIndex(i => {
        if(i + 1 >= line().length) {
          incrementMainIndex();
          return 0;
        }

        return i + 1;
      });
    }
  }

  return {
    word,
    inSubField,
    index,
    update,
  }
}