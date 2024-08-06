export type LineEntry = {
  content: string,
  links: string[]
}

export type Section = {
  title: string,
  lines: LineEntry[]
}

export type Sequence = Section[];