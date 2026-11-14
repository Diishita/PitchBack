export const filterMatches = (matches, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return matches;

  return matches.filter((match) => {
    const title = String(match.title || '').toLowerCase();
    const place = String(match.place || '').toLowerCase();
    return title.includes(normalizedQuery) || place.includes(normalizedQuery);
  });
};

export const normalizeVoiceSearchCommand = (text) => text
  .toLowerCase()
  .replace(/(find|search|show|matches?|match|खोज|शोध|सापडवा|शोधा|मॅच|मैच)/g, '')
  .replace(/(for me|for the|for|के लिए|साठी|का|ची|ना|मे)/g, '')
  .trim();
