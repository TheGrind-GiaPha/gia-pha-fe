import type { Person, PersonNode } from '@/types/person'

export function flattenTree(node: PersonNode): Person[] {
  return [node.person, ...node.children.flatMap(flattenTree)]
}
