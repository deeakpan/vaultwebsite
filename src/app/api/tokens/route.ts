import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tokens:', error);
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }

    return NextResponse.json({ tokens: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, address, link } = await request.json();

    if (!name || !address || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate address format (basic check)
    if (!address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid contract address format' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(link);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tokens')
      .insert([
        {
          name: name.trim(),
          address: address.toLowerCase(),
          link: link.trim()
        }
      ])
      .select();

    if (error) {
      console.error('Error adding token:', error);
      return NextResponse.json({ error: 'Failed to add token' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Token added successfully', token: data[0] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Delete specific token
      const { error } = await supabase
        .from('tokens')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting token:', error);
        return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Token deleted successfully' });
    } else {
      // Clear all tokens
      const { error } = await supabase
        .from('tokens')
        .delete()
        .neq('id', 0); // Delete all records

      if (error) {
        console.error('Error clearing tokens:', error);
        return NextResponse.json({ error: 'Failed to clear tokens' }, { status: 500 });
      }

      return NextResponse.json({ message: 'All tokens cleared successfully' });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}