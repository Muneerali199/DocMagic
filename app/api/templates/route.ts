import { logger } from "@/lib/logger";
import { createRoute } from "@/lib/supabase/server";
import {
  RequestValidationError,
  safeParseBody,
  templateCreateSchema,
} from "@/lib/validation";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = searchParams.get("limit");
  const includePublic = searchParams.get("includePublic") === "true";
  const supabase = await createRoute();
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      // If no user is authenticated, return public templates only
      let query = supabase
        .from("templates")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      // Add type filter if provided
      if (type) {
        query = query.eq("type", type);
      }
      // Add limit if provided
      if (limit) {
        query = query.limit(Number(limit));
      }
      const { data: templates, error: templatesError } = await query;
      if (templatesError) {
        console.error("Database error:", templatesError.message);
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(templates || []), {
        headers: { "Content-Type": "application/json" },
      });
    }
    // Base query for user's templates
    let query = supabase.from("templates").select("*").eq("user_id", user.id);
    // Add type filter if provided
    if (type) {
      query = query.eq("type", type);
    }
    // Add limit if provided
    if (limit) {
      query = query.limit(Number(limit));
    }
    // Include public templates if requested
    if (includePublic) {
      let publicQuery = supabase
        .from("templates")
        .select("*")
        .eq("is_public", true)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (type) {
        publicQuery = publicQuery.eq("type", type);
      }
      if (limit) {
        publicQuery = publicQuery.limit(Number(limit));
      }

      const { data: publicTemplates, error: publicError } = await publicQuery;
      if (publicError) throw publicError;

      const { data: userTemplates, error: templatesError } = await query;
      if (templatesError) throw templatesError;
      // Combine user's templates with public templates
      const allTemplates = [
        ...(userTemplates || []),
        ...(publicTemplates || []),
      ];
      return new Response(JSON.stringify(allTemplates), {
        headers: { "Content-Type": "application/json" },
      });
    }
    // Just return user's templates
    const { data: templates, error: templatesError } = await query;
    if (templatesError) {
      console.error("Database error:", templatesError.message);
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(templates || []), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(
      { route: "app/api/templates/route.ts" },
      "Error fetching templates:",
      error,
    );
    return new Response(
      JSON.stringify({ error: "Failed to fetch templates" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
export async function POST(request: Request) {
  const supabase = await createRoute();
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = await safeParseBody(request, templateCreateSchema);
    const { title, description, type, content, isPublic } = body;

    // Generate a unique ID for the template
    const templateId = crypto.randomUUID();

    const { data: template, error } = await supabase
      .from("templates")
      .insert([
        {
          id: templateId,
          user_id: user.id,
          title,
          description: description || null,
          type,
          content: content || {},
          is_public: Boolean(isPublic),
          is_default: false,
        },
      ])
      .select()
      .single();
    if (error) {
      logger.error(
        { route: "app/api/templates/route.ts" },
        "Error creating template:",
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to create template",
          details: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify(template), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, details: error.details }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    logger.error(
      { route: "app/api/templates/route.ts" },
      "Error creating template:",
      error,
    );
    return new Response(
      JSON.stringify({ error: "Failed to create template" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
