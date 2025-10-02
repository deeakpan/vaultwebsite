import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching votes:', error);
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
    }

    // Count votes per token
    const voteCounts: { [key: string]: number } = {};
    data?.forEach((vote: any) => {
      voteCounts[vote.name] = (voteCounts[vote.name] || 0) + 1;
    });

    return NextResponse.json({ 
      votes: data || [], 
      voteCounts 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, tokenName } = await request.json();

    if (!address || !tokenName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('address', address.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing vote:', checkError);
      return NextResponse.json({ error: 'Failed to check existing vote' }, { status: 500 });
    }

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 400 });
    }

    // Add the vote
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          address: address.toLowerCase(),
          name: tokenName.trim()
        }
      ])
      .select();

    if (error) {
      console.error('Error adding vote:', error);
      return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vote added successfully', vote: data[0] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear all votes
    const { error } = await supabase
      .from('votes')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) {
      console.error('Error clearing votes:', error);
      return NextResponse.json({ error: 'Failed to clear votes' }, { status: 500 });
    }

    return NextResponse.json({ message: 'All votes cleared successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}