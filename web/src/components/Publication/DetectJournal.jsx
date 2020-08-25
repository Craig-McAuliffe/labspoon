import journals from '../../mockdata/journals';

export default function detectJournal(matchedPublication) {
  const journalName = journals.filter((journal) =>
    matchedPublication.url.toLowerCase().includes(journal.name.toLowerCase())
  );
  return journalName;
}
