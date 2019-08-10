export async function loadData() {
  const data = await (await fetch('data.json')).json();
  return data;
}
