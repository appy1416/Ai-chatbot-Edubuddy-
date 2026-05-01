const key = 'AIzaSyAsnOKh6WSLaugGZ3B7VW1nVCgWFOi4iJU';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

fetch(url)
  .then(async (r) => {
    const data = await r.json();
    const names = data.models.map(m => m.name).filter(n => n.includes('gemini'));
    names.forEach(n => console.log(n));
  })
  .catch(console.error);
