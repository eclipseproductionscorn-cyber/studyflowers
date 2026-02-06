import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 5 } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not configured");
    }

    if (!query || typeof query !== "string") {
      throw new Error("Query is required");
    }

    const searchQuery = encodeURIComponent(`${query} aula explicação educação`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&relevanceLanguage=pt&key=${YOUTUBE_API_KEY}`;

    console.log("Searching YouTube for:", query);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube API error:", response.status, errorText);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const videos = (data.items || []).map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
    }));

    console.log(`Found ${videos.length} videos for query: ${query}`);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("YouTube search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
