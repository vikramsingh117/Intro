// Formats persisted sticky-note timestamps for the editor and painted wall-note texture.
// Missing or invalid values return an empty label so callers can omit the date without error UI.
export default function noteDate(value) {
  if(!value)return '';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'':date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}
