// Supabase REST (PostgREST) data access layer for Fibax Pharma.
//
// Mirrors the API of pg.js/db.js so the storage layer (store.js) can use it
// interchangeably. Used when SUPABASE_URL and SUPABASE_API_KEY are present —
// it talks to Supabase over HTTPS (port 443), which works on shared hosting
// where outbound Postgres ports (5432/6543) are often blocked.
//
// Requires the `collections` table to exist (see initSchema note below).

const BASE = () => (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = () => process.env.SUPABASE_API_KEY || '';
const TABLE = 'collections';

const KEY_FIELD = {
  products: 'id',
  orders: 'orderId',
  users: 'id',
  enquiries: 'id'
};

const SINGLETON_KEY = '_singleton';

// Serialize all writes so concurrent saves cannot interleave.
let writeChain = Promise.resolve();
function enqueueWrite(task) {
  writeChain = writeChain.then(task).catch((err) => {
    console.error('❌ Supabase write error:', err.message);
  });
  return writeChain;
}

function headers(extra = {}) {
  return {
    apikey: KEY(),
    Authorization: `Bearer ${KEY()}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function request(path, { method = 'GET', body, prefer } = {}) {
  const url = `${BASE()}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(prefer ? { Prefer: prefer } : {}),
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err.message || err.hint || err.code || '';
    } catch {
      detail = await res.text().catch(() => '');
    }
    const e = new Error(`Supabase ${method} ${path} failed (${res.status}): ${detail}`);
    e.status = res.status;
    throw e;
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function assertConnection() {
  if (!BASE() || !KEY()) {
    throw new Error('SUPABASE_URL or SUPABASE_API_KEY is not set.');
  }
  // The REST root returns the OpenAPI spec when reachable and authorized.
  const res = await fetch(`${BASE()}/rest/v1/`, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Cannot reach Supabase REST API (HTTP ${res.status}). Check SUPABASE_URL / SUPABASE_API_KEY.`);
  }
}

export async function initSchema() {
  // PostgREST cannot run DDL, so the table must be created once via the
  // Supabase dashboard SQL editor. Detect a missing table and fail loudly so
  // store.js falls back to JSON storage with a clear warning.
  try {
    await request(`${TABLE}?select=collection&limit=1`);
  } catch (err) {
    if (err.status === 404) {
      throw new Error(
        'The "collections" table does not exist in Supabase yet. ' +
        'Create it once via the SQL in docs/HOSTINGER_DEPLOYMENT.md (section 1).'
      );
    }
    throw err;
  }
}

export async function loadArray(name) {
  const rows = await request(
    `${TABLE}?collection=eq.${encodeURIComponent(name)}&select=data&order=position.asc`
  );
  return (rows || []).map((r) => r.data).filter((v) => v != null);
}

export async function loadSingleton(name) {
  const rows = await request(
    `${TABLE}?collection=eq.${encodeURIComponent(name)}&item_id=eq.${SINGLETON_KEY}&select=data&limit=1`
  );
  if (!rows || !rows.length) return null;
  return rows[0].data ?? null;
}

function keyFor(name, item, index) {
  const field = KEY_FIELD[name];
  const raw = field && item && item[field] != null ? item[field] : null;
  return String(raw != null ? raw : index);
}

export function saveArray(name, arr) {
  const items = Array.isArray(arr) ? arr : [];
  return enqueueWrite(async () => {
    // Replace the collection: delete existing rows, then bulk insert.
    await request(`${TABLE}?collection=eq.${encodeURIComponent(name)}`, {
      method: 'DELETE',
      prefer: 'return=minimal'
    });
    if (items.length) {
      const rows = items.map((item, i) => ({
        collection: name,
        item_id: keyFor(name, item, i),
        position: i,
        data: item
      }));
      await request(TABLE, { method: 'POST', body: rows, prefer: 'return=minimal' });
    }
  });
}

export function saveSingleton(name, obj) {
  return enqueueWrite(async () => {
    await request(TABLE, {
      method: 'POST',
      body: [{
        collection: name,
        item_id: SINGLETON_KEY,
        position: 0,
        data: obj ?? {}
      }],
      // Upsert on the (collection, item_id) primary key.
      prefer: 'resolution=merge-duplicates,return=minimal'
    });
  });
}

export function flush() {
  return writeChain;
}

export async function closePool() {
  // No persistent connections for the REST driver.
}
