type Link = string;

export type SequenceLinks = Map<
  Link,
  {
    sequence: number,
    line: number
  }[]
>;