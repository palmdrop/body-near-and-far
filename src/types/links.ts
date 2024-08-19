type LinkKey = string;

export type Link = {
  sequence: number,
  line: number
};

export type SequenceLinks = Map<
  LinkKey,
  Link[]
>;

export type SequenceLineVisits = Map<
  `${number}.${number}`, // #sequence.#line
  Date
>;