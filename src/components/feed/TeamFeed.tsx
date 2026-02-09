import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Image as ImageIcon,
  MoreHorizontal,
  Trash2,
  X,
  Loader2,
  Camera
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar_url: string | null;
  content: string | null;
  image_url: string | null;
  post_type: string;
  created_at: string;
  reactions: { user_id: string; reaction_type: string }[];
  comments: Comment[];
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar_url: string | null;
  content: string;
  created_at: string;
}

const TeamFeed = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("team-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_posts" }, fetchPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_reactions" }, fetchPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("team_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Fetch reactions and comments for each post
      const postsWithDetails = await Promise.all(
        (postsData || []).map(async (post) => {
          const [reactionsRes, commentsRes] = await Promise.all([
            supabase
              .from("post_reactions")
              .select("user_id, reaction_type")
              .eq("post_id", post.id),
            supabase
              .from("post_comments")
              .select("*")
              .eq("post_id", post.id)
              .order("created_at", { ascending: true }),
          ]);

          return {
            ...post,
            reactions: reactionsRes.data || [],
            comments: commentsRes.data || [],
          };
        })
      );

      setPosts(postsWithDetails);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim() && !selectedImage) {
      toast.error("Add some content or an image");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to post");
      return;
    }

    setPosting(true);
    try {
      let imageUrl: string | null = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("team_posts").insert({
        user_id: user.id,
        user_name: profile?.full_name || "Team Member",
        user_avatar_url: profile?.avatar_url,
        content: newPost.trim() || null,
        image_url: imageUrl,
        post_type: selectedImage ? "dish_photo" : "message",
      });

      if (error) throw error;

      setNewPost("");
      clearImage();
      toast.success("Posted!");
    } catch (error) {
      console.error("Error posting:", error);
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (postId: string) => {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    const hasReacted = post?.reactions.some((r) => r.user_id === user.id);

    if (hasReacted) {
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("post_reactions").insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: "like",
      });
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !user) return;

    try {
      await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        user_name: profile?.full_name || "Team Member",
        user_avatar_url: profile?.avatar_url,
        content,
      });

      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (error) {
      console.error("Error commenting:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from("team_posts").delete().eq("id", postId);
      toast.success("Post deleted");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="card-elevated p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="section-header mb-0">Kitchen Wall</h2>
        <p className="text-sm text-muted-foreground">Share updates, dish photos & messages</p>
      </div>

      {/* Compose Post */}
      {user && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's cooking? Share an update or dish photo..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-40 rounded-lg object-cover"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <div className="p-2 rounded-lg hover:bg-muted transition-colors inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Camera className="w-5 h-5" />
                      <span className="text-sm">Add Photo</span>
                    </div>
                  </label>
                </div>
                <Button 
                  onClick={handleSubmitPost} 
                  disabled={posting || (!newPost.trim() && !selectedImage)}
                  size="sm"
                >
                  {posting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <ScrollArea className="h-[500px]">
        <div className="divide-y divide-border">
          <AnimatePresence>
            {posts.map((post) => {
              const hasLiked = post.reactions.some((r) => r.user_id === user?.id);
              const likeCount = post.reactions.length;
              const commentCount = post.comments.length;
              const isExpanded = expandedComments.has(post.id);
              const isOwnPost = post.user_id === user?.id;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.user_avatar_url || undefined} />
                        <AvatarFallback>{getInitials(post.user_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{post.user_name || "Team Member"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {isOwnPost && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-muted">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                  )}

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="mb-3 rounded-xl overflow-hidden bg-muted">
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        className="w-full max-h-80 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => handleReaction(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-sm transition-colors",
                        hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
                      {likeCount > 0 && <span>{likeCount}</span>}
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {commentCount > 0 && <span>{commentCount}</span>}
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border space-y-3">
                          {/* Existing Comments */}
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarImage src={comment.user_avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(comment.user_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-medium">{comment.user_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* Add Comment */}
                          {user && (
                            <div className="flex gap-2">
                              <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(profile?.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Write a comment..."
                                  value={commentInputs[post.id] || ""}
                                  onChange={(e) => 
                                    setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleComment(post.id);
                                    }
                                  }}
                                  className="h-8 text-sm"
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 px-2"
                                  onClick={() => handleComment(post.id)}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {posts.length === 0 && (
            <div className="p-8 text-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No posts yet</p>
              <p className="text-sm text-muted-foreground/70">Be the first to share something!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TeamFeed;
