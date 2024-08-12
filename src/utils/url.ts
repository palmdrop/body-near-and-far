export const indicesToUrlHash = (
  fieldIndex: number,
  ...sequenceIndices: number[]
) => {
  return `${sequenceIndices.join(".")}.(${fieldIndex})`;
}

export const parseIndicesFromString = (indices: string) => {
  const sections = indices.split(".");

  const sequenceOneIndex = Number(sections.at(0));
  const sequenceTwoIndex = Number(sections.at(1));
  const sequenceThreeIndex = Number(sections.at(2));
  const fieldIndex = Number(
    sections.at(3)?.substring(1, sections.at(3)!.length - 1)
  );

  return {
    sequenceOneIndex,
    sequenceTwoIndex,
    sequenceThreeIndex,
    fieldIndex
  }
}