const hashIndexRegex = /\d+\.\d+.\d+\.\(\d+\)/;

export const indicesToUrlHash = (
  fieldIndex: number,
  ...sequenceIndices: number[]
) => {
  const paddedSequenceIndices = sequenceIndices.map(index => `${index + 1}`.padStart(3, "0"));
  const paddedFieldIndex = String(fieldIndex + 1).padStart(3, "0");
  return `${paddedSequenceIndices.join(".")}.(${paddedFieldIndex})`;
}

export const parseIndicesFromString = (indicesString: string) => {
  if(!hashIndexRegex.test(indicesString)) {
    throw new Error("Invalid indices string");
  }

  const indices = indicesString
    .split(".")
    .map(
      index => (index.startsWith("(") && index.endsWith(")"))
        ? Number(index.slice(1, -1))
        : Number(index)
    )
    .map(index => index - 1);

  return indices;
}

export const indicesFromURL = (defaultIndices?: [number, number, number, number]) => {
  try {
    return parseIndicesFromString(window.location.hash.slice(1));
  } catch(_) {
    console.log(defaultIndices)
    return defaultIndices ?? [0, 0, 0, 0];
  }
}