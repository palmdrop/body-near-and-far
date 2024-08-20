const hashIndexRegex = /\d+\.\d+.\d+\.\(\d+\)/;

export const indicesToUrlHash = (
  fieldIndex: number,
  ...sequenceIndices: number[]
) => {
  return `${sequenceIndices.map(index => index + 1).join(".")}.(${fieldIndex + 1})`;
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

export const indicesFromURL = () => {
  try {
    return parseIndicesFromString(window.location.hash.slice(1));
  } catch(_) {
    return [0, 0, 0, 0];
  }
}