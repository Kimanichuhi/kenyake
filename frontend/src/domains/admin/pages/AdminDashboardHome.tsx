import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, PawPrint, Users, UserSquare2, Sparkles, Newspaper, Image, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface StatDef {
  key: string;
  label: string;
  table: "destinations" | "wildlife_sightings" | "communities" | "guides" | "experiences" | "blog_posts";
  statusColumn: "status" | "is_published";
  path: string;
  icon: typeof Map;
}

const STATS: StatDef[] = [
  { key: "destinations", label: "Destinations", table: "destinations", statusColumn: "status", path: "/admin/destinations", icon: Map },
  { key: "wildlife", label: "Wildlife Sightings", table: "wildlife_sightings", statusColumn: "status", path: "/admin/wildlife", icon: PawPrint },
  { key: "communities", label: "Communities", table: "communities", statusColumn: "is_published", path: "/admin/communities", icon: Users },
  { key: "guides", label: "Guides", table: "guides", statusColumn: "is_published", path: "/admin/guides", icon: UserSquare2 },
  { key: "experiences", label: "Experiences", table: "experiences", statusColumn: "is_published", path: "/admin/experiences", icon: Sparkles },
  { key: "blog", label: "Blog Posts", table: "blog_posts", statusColumn: "status", path: "/admin/blog", icon: Newspaper },
];

function useContentStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const results = await Promise.all(
        STATS.map(async (stat) => {
          const { count: total } = await (supabase.from(stat.table as never) as any).select("*", { count: "exact", head: true });
          const publishedFilter =
            stat.statusColumn === "status"
              ? (supabase.from(stat.table as never) as any).select("*", { count: "exact", head: true }).eq("status", "published")
              : (supabase.from(stat.table as never) as any).select("*", { count: "exact", head: true }).eq("is_published", true);
          const { count: published } = await publishedFilter;
          return { ...stat, total: total ?? 0, published: published ?? 0 };
        }),
      );
      return results;
    },
  });
}

interface RecentItem {
  table: string;
  label: string;
  title: string;
  updated_at: string;
  path: string;
}

function useRecentActivity() {
  return useQuery({
    queryKey: ["admin-dashboard-recent"],
    queryFn: async () => {
      const queries: PromiseLike<RecentItem[]>[] = [
        supabase
          .from("destinations")
          .select("id,name,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then(({ data }) => (data ?? []).map((r) => ({ table: "destinations", label: "Destination", title: r.name, updated_at: r.updated_at, path: `/admin/destinations/${r.id}` }))),
        supabase
          .from("guides")
          .select("id,name,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then(({ data }) => (data ?? []).map((r) => ({ table: "guides", label: "Guide", title: r.name, updated_at: r.updated_at, path: `/admin/guides/${r.id}` }))),
        supabase
          .from("experiences")
          .select("id,title,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then(({ data }) => (data ?? []).map((r) => ({ table: "experiences", label: "Experience", title: r.title, updated_at: r.updated_at, path: `/admin/experiences/${r.id}` }))),
        supabase
          .from("blog_posts")
          .select("id,title,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then(({ data }) => (data ?? []).map((r) => ({ table: "blog_posts", label: "Blog post", title: r.title, updated_at: r.updated_at, path: `/admin/blog/${r.id}` }))),
      ];

      const results = (await Promise.all(queries)).flat();
      return results.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 8);
    },
  });
}

const QUICK_ACTIONS = [
  { label: "New Destination", path: "/admin/destinations/new" },
  { label: "New Blog Post", path: "/admin/blog/new" },
  { label: "New Experience", path: "/admin/experiences/new" },
  { label: "Upload Media", path: "/admin/media" },
];

const AdminDashboardHome = () => {
  const { data: stats, isLoading: statsLoading } = useContentStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your Sync Safaris content.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
          : stats?.map((stat) => (
              <Link key={stat.key} to={stat.path}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-col gap-1.5 pt-6">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-semibold text-foreground">{stat.total}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-[11px] text-muted-foreground/70">{stat.published} published</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recently updated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentLoading && <Skeleton className="h-32 w-full" />}
            {!recentLoading && recent?.length === 0 && (
              <p className="text-sm text-muted-foreground">No content updates yet.</p>
            )}
            {recent?.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted"
              >
                <span className="text-foreground">
                  <span className="text-muted-foreground">{item.label}:</span> {item.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <Button key={action.path} variant="outline" className="w-full justify-start" asChild>
                <Link to={action.path}>
                  <Plus className="mr-1.5 h-4 w-4" /> {action.label}
                </Link>
              </Button>
            ))}
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/media">
                <Image className="mr-1.5 h-4 w-4" /> Browse media library
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
