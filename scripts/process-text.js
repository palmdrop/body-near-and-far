import fs from "fs/promises";

const FIELD_BODY_DATA_PATH = "./src/content/field/body.txt";
const FIELD_BODY_OUTPUT_PATH = "./src/data/field/body.ts";
const FIELD_BODY_NAME = "bodyField";

const SEQUENCE_EARLY_TO_LATE_DATA_PATH = "./src/content/early-to-late.txt";
const SEQUENCE_EARLY_TO_LATE_OUTPUT_PATH = "./src/data/sequence/early-to-late.ts"
const SEQUENCE_EARLY_TO_LATE_NAME = "earlyToLateSequence";

const SEQUENCE_NEAR_TO_FAR_DATA_PATH = "./src/content/near-to-far.txt";
const SEQUENCE_NEAR_TO_FAR_OUTPUT_PATH = "./src/data/sequence/near-to-far.ts"
const SEQUENCE_NEAR_TO_FAR_NAME = "nearToFarSequence";

const SEQUENCE_LOOP_TO_UNLOOP_DATA_PATH = "./src/content/loop-to-unloop.txt";
const SEQUENCE_LOOP_TO_UNLOOP_OUTPUT_PATH = "./src/data/sequence/loop-to-unloop.ts"
const SEQUENCE_LOOP_TO_UNLOOP_NAME = "loopToUnloopSequence";

const toTypescriptObject = (object, name, type, importLine) => {
  return `${importLine}
export const ${name}: ${type} = ${JSON.stringify(object, null, 2)};`;
}

const processField = async (name, path, outputPath) => {
  const data = await fs.readFile(path, "utf8");
  const lines = data.split("\n");

  const field = lines
    .map(subField => {
      const words = subField
        .split("/")
        .map(word => word.trim())
        .filter(word => !!word.length);

      if(!words.length) {
        console.warn("Empty subfield:", subField);
        return undefined;
      }

      if(words.length === 1) return words[0];
      return words;
    })
    .filter(Boolean);
  
  const output = toTypescriptObject(field, name, "Field", 'import { Field } from "~/types/field";');
  await fs.writeFile(outputPath, output);
}

const processSequence = async (name, path, outputPath) => {
  const data = await fs.readFile(path, "utf8");
  const lines = data.split("\n");

  const processLine = (rawLine, i) => {
    const trimmedLine = rawLine.trim();

    return {
      id: undefined,
      content: trimmedLine,
      links: []
    }
  }

  const sequence = [];
  let section;

  let wasEmpty = false;
  for(let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isFirst = i === 0;
    const isEmpty = line.length === 0;
    const isTitleLine = !isEmpty && line.startsWith("#");

    if(isEmpty && isFirst) {
      throw Error("First line cannot be empty");
    }

    if(isTitleLine || isFirst || (!isEmpty && wasEmpty)) {
      section = {
        title: isTitleLine ? line.slice(1).trim() : "",
        lines: []
      };

      sequence.push(section);

      wasEmpty = false;
    }

    if(!isTitleLine) {
      if(!line.trim().length) {
        wasEmpty = true;
      } else {
        wasEmpty = false;
      }

      section
        .lines
        .push(
          processLine(line, i)
        );
    }
  }

  const output = toTypescriptObject(sequence, name, "Sequence", 'import { Sequence } from "~/types/sequence";');
  
  await fs.writeFile(outputPath, output);
}

const main = async () => {
  // Body field
  await processField(
    FIELD_BODY_NAME, 
    FIELD_BODY_DATA_PATH, 
    FIELD_BODY_OUTPUT_PATH
  )

  // Sequence (early to late)
  await processSequence(
    SEQUENCE_EARLY_TO_LATE_NAME,
    SEQUENCE_EARLY_TO_LATE_DATA_PATH,
    SEQUENCE_EARLY_TO_LATE_OUTPUT_PATH
  );

  await processSequence(
    SEQUENCE_NEAR_TO_FAR_NAME,
    SEQUENCE_NEAR_TO_FAR_DATA_PATH,
    SEQUENCE_NEAR_TO_FAR_OUTPUT_PATH
  );

  await processSequence(
    SEQUENCE_LOOP_TO_UNLOOP_NAME,
    SEQUENCE_LOOP_TO_UNLOOP_DATA_PATH,
    SEQUENCE_LOOP_TO_UNLOOP_OUTPUT_PATH
  );
}

main().catch(console.error);

