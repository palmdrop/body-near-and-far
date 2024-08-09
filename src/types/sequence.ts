export type LineEntry = {
  content: string,
  links: string[]
  index: number,
}

export type Section = {
  title: string,
  lines: LineEntry[]
}

export type Sequence = Section[];