import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: cors });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const resource = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

    // GET /ember → all entries (with annotation counts)
    // GET /ember/entries → all entries
    // GET /ember/entry?date=2026-04-16 → single entry + its annotations
    // GET /ember/annotations?entry_id=uuid → annotations for an entry
    // POST /ember/annotations → create annotation

    if (req.method === "GET") {
      if (resource === "entry") {
        const date = url.searchParams.get("date");
        const id = url.searchParams.get("id");
        let query = supabase.from("ember_entries").select("*");
        if (date) query = query.eq("entry_date", date);
        else if (id) query = query.eq("id", id);
        const { data: entry, error } = await query.single();
        if (error) throw error;

        const { data: anns } = await supabase
          .from("ember_annotations")
          .select("*")
          .eq("entry_id", entry.id)
          .order("created_at");

        return new Response(JSON.stringify({ ...entry, annotations: anns || [] }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      if (resource === "annotations") {
        const entryId = url.searchParams.get("entry_id");
        const { data, error } = await supabase
          .from("ember_annotations")
          .select("*")
          .eq("entry_id", entryId)
          .order("created_at");
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      // default: list all entries with annotation counts
      const { data: entries, error } = await supabase
        .from("ember_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (error) throw error;

      // get annotation counts per entry
      const ids = entries.map((e: any) => e.id);
      let annCounts: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: anns } = await supabase
          .from("ember_annotations")
          .select("entry_id");
        if (anns) {
          anns.forEach((a: any) => {
            annCounts[a.entry_id] = (annCounts[a.entry_id] || 0) + 1;
          });
        }
      }

      const result = entries.map((e: any) => ({
        ...e,
        annotation_count: annCounts[e.id] || 0,
      }));

      return new Response(JSON.stringify(result), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // POST /ember/annotations → create annotation
    if (req.method === "POST" && resource === "annotations") {
      const body = await req.json();
      const { entry_id, quote, quote_start, quote_end, note } = body;

      const { data, error } = await supabase
        .from("ember_annotations")
        .insert({ entry_id, quote, quote_start, quote_end, note })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
