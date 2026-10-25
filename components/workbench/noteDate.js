export default function noteDate(value) {
  if(!value)return '';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'':date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}
