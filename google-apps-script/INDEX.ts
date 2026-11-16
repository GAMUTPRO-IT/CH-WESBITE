// ════════════════════════════════════════════════════════════════════════════
//  Children Home admin page: user management (Supabase Edge Function "ch-admin-users")
//
//  Lets ADMINS add people (as Admin or Staff), change roles, set new passwords
//  and remove people, from admin.html → Users. It runs on Supabase's servers,
//  so the secret key it needs never reaches the website.
//
//  Deploy it once (full steps in ADMIN-GUIDE.md):
//    Supabase → Edge Functions → Deploy a new function → Via Editor →
//    name it exactly  ch-admin-users  → paste this file → Deploy.
//    Then, in the function's settings, turn OFF "Verify JWT" (JWT verification):
//    this function checks for itself that the caller is a signed-in Admin.
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const ROLES = ['admin', 'staff'];
const ROLE_NAME = { admin: 'Admin', staff: 'Staff' };
const okEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

// the project's secret key: the new kind first, then the older service_role key
function serverKey() {
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    if (keys && keys.default) return keys.default;
  } catch (_) { /* not set */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
}

// every login in the project (Supabase lists them page by page)
async function allLogins(db) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = (data && data.users) || [];
    out.push(...users);
    if (users.length < 200) break;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply({ error: 'Not allowed.' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'), key = serverKey();
    if (!url || !key) return reply({ error: 'The function is missing its Supabase settings.' }, 500);
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    // 1. who is asking? They must be signed in, and an Admin on the team
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return reply({ error: 'Please sign in again.' }, 401);
    const { data: auth, error: authErr } = await db.auth.getUser(token);
    const caller = auth && auth.user;
    if (authErr || !caller) return reply({ error: 'Please sign in again.' }, 401);
    const { data: me } = await db.from('ch_admins').select('role').eq('user_id', caller.id).maybeSingle();
    if (!me || me.role !== 'admin') return reply({ error: 'Only Admins can manage users.' }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const log = (summary) => db.from('ch_activity').insert({ actor_id: caller.id, actor_email: caller.email, area: 'users', action, summary });
    const team = async () => {
      const { data, error } = await db.from('ch_admins').select('user_id, email, role, display_name, created_at').order('created_at');
      if (error) throw error;
      return data || [];
    };
    const nameOf = (m) => (m.display_name && m.display_name.trim()) || m.email;
    const findMember = async (id) => (await team()).find((m) => m.user_id === id);

    // 2. what do they want to do?
    if (action === 'list') {
      const list = await team();
      const lastIn = {};
      (await allLogins(db)).forEach((u) => { lastIn[u.id] = u.last_sign_in_at || null; });
      return reply({ ok: true, me: caller.id, users: list.map((m) => ({ ...m, last_sign_in_at: lastIn[m.user_id] || null })) });
    }

    if (action === 'create') {
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim().slice(0, 80);
      const role = String(body.role || '');
      const password = String(body.password || '');
      if (!okEmail(email)) return reply({ error: 'Please enter a valid email address.' }, 400);
      if (!ROLES.includes(role)) return reply({ error: 'Please choose Admin or Staff.' }, 400);
      if (password.length < 10) return reply({ error: 'The temporary password needs at least 10 characters.' }, 400);

      let userId = null, existed = false;
      const { data: made, error: makeErr } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
      if (makeErr) {
        if (!/already|exists|registered/i.test(makeErr.message || '')) return reply({ error: makeErr.message || 'Could not create the login.' }, 400);
        // a login with this email already exists: add it to the team (its password stays the same)
        const found = (await allLogins(db)).find((u) => String(u.email || '').toLowerCase() === email);
        if (!found) return reply({ error: 'A login with this email already exists, but it could not be found.' }, 400);
        if (await findMember(found.id)) return reply({ error: 'This person is already on the team.' }, 400);
        userId = found.id; existed = true;
      } else {
        userId = made.user.id;
      }
      const { error: addErr } = await db.from('ch_admins').insert({ user_id: userId, email, role, display_name: name || null });
      if (addErr) return reply({ error: addErr.message }, 400);
      await log('Added ' + (name || email) + ' as ' + ROLE_NAME[role]);
      return reply({ ok: true, existed });
    }

    // the rest act on one person already on the team
    const target = await findMember(String(body.user_id || ''));
    if (!target) return reply({ error: 'That person is not on the team.' }, 404);
    const admins = (await team()).filter((m) => m.role === 'admin').length;

    if (action === 'set_role') {
      const role = String(body.role || '');
      if (!ROLES.includes(role)) return reply({ error: 'Please choose Admin or Staff.' }, 400);
      if (target.user_id === caller.id) return reply({ error: 'You can’t change your own role. Ask another Admin.' }, 400);
      if (target.role === role) return reply({ ok: true });
      if (target.role === 'admin' && admins <= 1) return reply({ error: 'There must always be at least one Admin.' }, 400);
      const { error } = await db.from('ch_admins').update({ role }).eq('user_id', target.user_id);
      if (error) return reply({ error: error.message }, 400);
      await log('Changed ' + nameOf(target) + ' from ' + ROLE_NAME[target.role] + ' to ' + ROLE_NAME[role]);
      return reply({ ok: true });
    }

    if (action === 'rename') {
      const name = String(body.name || '').trim().slice(0, 80);
      const { error } = await db.from('ch_admins').update({ display_name: name || null }).eq('user_id', target.user_id);
      if (error) return reply({ error: error.message }, 400);
      await log('Renamed ' + nameOf(target) + ' to ' + (name || target.email));
      return reply({ ok: true });
    }

    if (action === 'reset_password') {
      const password = String(body.password || '');
      if (password.length < 10) return reply({ error: 'The new password needs at least 10 characters.' }, 400);
      const { error } = await db.auth.admin.updateUserById(target.user_id, { password });
      if (error) return reply({ error: error.message }, 400);
      await log('Set a new password for ' + nameOf(target));
      return reply({ ok: true });
    }

    if (action === 'remove') {
      if (target.user_id === caller.id) return reply({ error: 'You can’t remove yourself. Ask another Admin.' }, 400);
      if (target.role === 'admin' && admins <= 1) return reply({ error: 'There must always be at least one Admin.' }, 400);
      // deleting the login also takes them off the team; responses assigned to them become unassigned
      const { error } = await db.auth.admin.deleteUser(target.user_id);
      if (error) return reply({ error: error.message }, 400);
      await log('Removed ' + nameOf(target) + ' (' + ROLE_NAME[target.role] + ')');
      return reply({ ok: true });
    }

    return reply({ error: 'Unknown request.' }, 400);
  } catch (e) {
    return reply({ error: String((e && e.message) || e) }, 500);
  }
});