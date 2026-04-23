import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'game' },
  });

  const DUMMY_UUID = '00000000-0000-0000-0000-000000000000';

  const { error: answersErr } = await supabase
    .from('answers')
    .delete()
    .neq('id', DUMMY_UUID);

  if (answersErr) {
    return NextResponse.json({ error: answersErr.message }, { status: 500 });
  }

  const { error: resultsErr } = await supabase
    .from('results')
    .delete()
    .neq('id', DUMMY_UUID);

  if (resultsErr) {
    return NextResponse.json({ error: resultsErr.message }, { status: 500 });
  }

  const { error: participantsErr } = await supabase
    .from('participants')
    .delete()
    .neq('id', DUMMY_UUID);

  if (participantsErr) {
    return NextResponse.json({ error: participantsErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
