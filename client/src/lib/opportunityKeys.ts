export type OpportunityKeyInput = { id: string };

export function opportunityCardKey(item: OpportunityKeyInput, index: number) {
  return `${item.id}::${index}`;
}
