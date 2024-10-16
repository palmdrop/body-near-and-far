type LinkKey = string;

export type Link = {
  sequence: number,
  line: number
};

export type SequenceLinks = Map<
  LinkKey,
  Link[]
>;

export type SequenceLineVisits = Set<
  `${number}.${number}` // #sequence.#line
>;

export type FollowedLink = Link & {
  key: string
  originSequence: number,
  originLine: number,
}