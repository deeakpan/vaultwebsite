import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('details')
      .select('total, snapshot')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch details' },
        { status: 500 }
      );
    }

    // If no data exists, return default values
    if (!data || data.length === 0) {
      return NextResponse.json({
        total: '1,250,000',
        snapshot: new Date().toISOString()
      });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { total, snapshot } = await request.json();

    // Validate input
    if (!total || !snapshot) {
      return NextResponse.json(
        { error: 'Both total and snapshot are required' },
        { status: 400 }
      );
    }

    // First, try to update existing row
    let { data, error } = await supabase
      .from('details')
      .update({ total, snapshot })
      .eq('id', 1)
      .select()
      .single();

    // If no rows were updated (table is empty), insert a new row
    if (error && error.code === 'PGRST116') {
      const insertResult = await supabase
        .from('details')
        .insert({ id: 1, total, snapshot })
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update details' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}