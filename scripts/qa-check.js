const base = process.env.BASE_URL || 'http://localhost:3000';

async function check(name, url, body) {
  const res = await fetch(`${base}${url}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${name} failed: ${res.status} ${text}`);
  }

  console.log(`PASS: ${name}`);
}

async function run() {
  await check('health', '/api/health');
  await check('search button api', '/api/search', { query: 'תאורה' });
  await check('account button api', '/api/ui-action', { action: 'account' });
  await check('favorites button api', '/api/ui-action', { action: 'favorites' });
  await check('promo button api', '/api/ui-action', { action: 'promotions' });
  await check('newsletter button api', '/api/newsletter/subscribe', { email: 'qa@example.com' });

  console.log('All button-backed APIs passed.');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
