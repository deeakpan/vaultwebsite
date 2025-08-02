import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
    }

    return NextResponse.json({ partners: partners || [] });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const logo = formData.get('logo') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const link = formData.get('link') as string;

    if (!logo || !name || !description || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload logo to Supabase Storage
    const fileName = `partner-logos/${Date.now()}-${logo.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('partner-assets')
      .upload(fileName, logo, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('partner-assets')
      .getPublicUrl(fileName);

    // Insert partner data into database
    const { data: partner, error: insertError } = await supabase
      .from('partners')
      .insert([
        {
          name,
          description,
          link,
          logo_url: publicUrl
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to add partner' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Partner added successfully',
      partner 
    });

  } catch (error) {
    console.error('Error adding partner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 