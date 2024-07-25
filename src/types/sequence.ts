export type LineEntry = {
  type: 'space',
  length: number
} | {
  type: 'line',
  id?: string,
  content: string,
  links: string[]
}

export type Section = {
  title: string,
  lines: LineEntry[]
}

export type Sequence = Section[];