import { createRoute } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const limit = searchParams.get('limit');
  const includePublic = searchParams.get('includePublic') === 'true';
  
  const supabase = createRoute();
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Base query for user's templates
    let query = supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id);

    // Add type filter if provided
    if (type) {
      query = query.eq('type', type);
    }

    // Add limit if provided
    if (limit) {
      query = query.limit(Number(limit));
    }

    // Include public templates if requested
    if (includePublic) {
      const { data: publicTemplates } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id);

      const { data: userTemplates, error: templatesError } = await query;
      
      if (templatesError) throw templatesError;

      // Combine user's templates with public templates
      const allTemplates = [...(userTemplates || []), ...(publicTemplates || [])];
      return new Response(JSON.stringify(allTemplates), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Just return user's templates
    const { data: templates, error: templatesError } = await query;
    if (templatesError) throw templatesError;

    return new Response(JSON.stringify(templates || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch templates' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRoute();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { title, description, type, content, isPublic } = body;

    // Validate required fields
    if (!title || !type) {
      return new Response(
        JSON.stringify({ error: 'Title and type are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: template, error } = await supabase
      .from('templates')
      .insert([
        { 
          user_id: user.id,
          title,
          description: description || null,
          type,
          content: content || {},
          is_public: Boolean(isPublic),
          is_default: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create template' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(template), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create template' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
