import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Loader2, Youtube, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
}

const YouTubeSearch = () => {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const searchVideos = async () => {
    if (!query.trim()) {
      toast.error("Digite o que deseja buscar!");
      return;
    }

    setLoading(true);
    setSelectedVideo(null);

    try {
      const response = await supabase.functions.invoke("youtube-search", {
        body: { query, maxResults: 6 },
      });

      if (response.error) throw new Error(response.error.message);

      setVideos(response.data.videos || []);
      if (response.data.videos?.length === 0) {
        toast.info("Nenhum vídeo encontrado. Tente outro termo!");
      }
    } catch (error) {
      console.error("YouTube search error:", error);
      toast.error("Erro ao buscar vídeos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aulas no YouTube... Ex: equação do 2º grau"
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && !loading && searchVideos()}
          />
        </div>
        <Button onClick={searchVideos} disabled={loading} className="bg-destructive hover:bg-destructive/90">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube size={18} />}
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </Button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {["Frações", "Revolução Francesa", "Fotossíntese", "Verbos em inglês"].map((s) => (
          <Badge
            key={s}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => { setQuery(s); }}
          >
            {s}
          </Badge>
        ))}
      </div>

      {/* Embedded Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden border border-border"
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, i) => (
            <motion.div
              key={video.videoId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer hover:border-primary/50 transition-all group overflow-hidden ${
                  selectedVideo === video.videoId ? "border-primary ring-2 ring-primary/20" : ""
                }`}
                onClick={() => setSelectedVideo(video.videoId)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="text-white" size={40} />
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 text-foreground" dangerouslySetInnerHTML={{ __html: video.title }} />
                  <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;
