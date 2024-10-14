export function setColors(
  states: Map<number, Record<string, any>>,
  ids: Set<number>
): number[] {
  const stylesheet = document.getElementById("sv-yjs-quill");
  if (!stylesheet) return [];

  let styles = "";

  const idsList = [];
  for (const [id, state] of states) {
    if (ids.has(id) || !state.participant) continue;

    idsList.push(id);

    styles += `
      #ql-cursor-${id} {
        --presence-color: ${state.participant.slot.color};
        --sv-text-color: ${state.participant.slot.textColor};
      }
    `;
  }

  stylesheet.innerText = styles;

  return idsList;
}
