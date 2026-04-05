import { useState, useEffect } from 'react';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  live_url: string;
  github_url: string;
  screenshot_url: string;
  tags: string[];
  view_count: number;
  like_count: number;
  created_at: string;
  featured: boolean;
}

export default function ShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadShowcase();
  }, []);

  const loadShowcase = async () => {
    try {
      setLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/showcase_submissions?status=eq.approved&order=featured.desc,created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load showcase:', error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(new Set(items.flatMap((item) => item.tags || [])));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = !selectedTag || (item.tags || []).includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const featuredItems = filteredItems.filter((item) => item.featured);
  const regularItems = filteredItems.filter((item) => !item.featured);

  return (
    <div className="min-h-screen bg-bolt-elements-background-depth-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-4">Community Showcase</h1>
          <p className="text-xl opacity-90">
            Discover amazing websites built by our community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="max-w-md"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="i-ph:spinner animate-spin text-5xl text-bolt-elements-loader-progress" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Section */}
            {featuredItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="i-ph:star-fill text-2xl text-yellow-500" />
                  <h2 className="text-3xl font-bold text-bolt-elements-textPrimary">Featured</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredItems.map((item) => (
                    <ShowcaseCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Regular Items */}
            {regularItems.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-bolt-elements-textPrimary mb-6">
                  Community Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularItems.map((item) => (
                    <ShowcaseCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <div className="i-ph:magnifying-glass text-6xl text-bolt-elements-textTertiary mb-4 opacity-20" />
                <p className="text-xl text-bolt-elements-textSecondary">
                  No projects found matching your criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-shadow">
      {/* Placeholder for screenshot */}
      <div className="h-48 bg-gradient-to-br from-blue-500/20 via-teal-500/20 to-cyan-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="i-ph:globe text-6xl opacity-20" />
        {item.featured && (
          <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-900">
            <div className="i-ph:star-fill mr-1" />
            Featured
          </Badge>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-bolt-elements-textPrimary mb-2 group-hover:text-blue-500 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-bolt-elements-textSecondary line-clamp-2">
            {item.description}
          </p>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-bolt-elements-textSecondary">
          <span className="flex items-center gap-1">
            <div className="i-ph:eye" />
            {item.view_count}
          </span>
          <span className="flex items-center gap-1">
            <div className="i-ph:heart" />
            {item.like_count}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => window.open(item.live_url, '_blank')}
          >
            <div className="i-ph:arrow-square-out mr-2" />
            Visit Site
          </Button>
          {item.github_url && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(item.github_url, '_blank')}
            >
              <div className="i-ph:github-logo" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
