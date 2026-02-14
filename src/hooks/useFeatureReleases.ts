import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeatureRelease {
  module_slug: string;
  status: string;
}

export const useFeatureReleases = () => {
  return useQuery({
    queryKey: ["feature-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_releases")
        .select("module_slug, status")
        .eq("release_type", "new");

      if (error) throw error;
      return (data || []) as FeatureRelease[];
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
};

export const useIsModuleReleased = () => {
  const { data: releases } = useFeatureReleases();

  return (moduleSlug: string) => {
    if (!releases) return false;
    return releases.some(
      (r) => r.module_slug === moduleSlug && r.status === "released"
    );
  };
};
