export async function askAI(prompt){
  const key = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if(!key) return 'Mock AI (no key): ' + prompt;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model:'gpt-4o-mini',
      messages:[{role:'system',content:'You are a helpful assistant for teachers.'},{role:'user',content:prompt}],
      temperature:0.7
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
