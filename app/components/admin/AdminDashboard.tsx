import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';

interface UserWebsite {
  id: string;
  user_id: string;
  website_url: string;
  title: string;
  description: string;
  created_at: string;
  view_count: number;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  user_id: string;
}

interface ShowcaseSubmission {
  id: string;
  title: string;
  status: string;
  live_url: string;
  created_at: string;
  view_count: number;
  like_count: number;
}

export function AdminDashboard() {
  const [websites, setWebsites] = useState<UserWebsite[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showcase, setShowcase] = useState<ShowcaseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalTickets: 0,
    openTickets: 0,
    totalShowcase: 0,
    pendingShowcase: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      };

      const [websitesRes, ticketsRes, showcaseRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/user_websites?order=created_at.desc&limit=100`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/support_tickets?order=created_at.desc&limit=100`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/showcase_submissions?order=created_at.desc&limit=100`, { headers }),
      ]);

      if (websitesRes.ok) {
        const data = await websitesRes.json() as UserWebsite[];
        setWebsites(Array.isArray(data) ? data : []);
        setStats(prev => ({ ...prev, totalWebsites: data.length }));
      }

      if (ticketsRes.ok) {
        const data = await ticketsRes.json() as SupportTicket[];
        setTickets(Array.isArray(data) ? data : []);
        const openCount = data.filter((t) => t.status === 'open').length;
        setStats(prev => ({ ...prev, totalTickets: data.length, openTickets: openCount }));
      }

      if (showcaseRes.ok) {
        const data = await showcaseRes.json() as ShowcaseSubmission[];
        setShowcase(Array.isArray(data) ? data : []);
        const pendingCount = data.filter((s) => s.status === 'pending').length;
        setStats(prev => ({ ...prev, totalShowcase: data.length, pendingShowcase: pendingCount }));
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bolt-elements-background-depth-1">
      <div className="p-6 border-b border-bolt-elements-borderColor">
        <h1 className="text-3xl font-bold text-bolt-elements-textPrimary mb-2">Admin Dashboard</h1>
        <p className="text-bolt-elements-textSecondary">Platform management and monitoring</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bolt-elements-textSecondary">Total Websites</p>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">{stats.totalWebsites}</p>
            </div>
            <div className="i-ph:globe text-3xl text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bolt-elements-textSecondary">Total Tickets</p>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">{stats.totalTickets}</p>
            </div>
            <div className="i-ph:ticket text-3xl text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bolt-elements-textSecondary">Open Tickets</p>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">{stats.openTickets}</p>
            </div>
            <div className="i-ph:warning text-3xl text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bolt-elements-textSecondary">Showcase Items</p>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">{stats.totalShowcase}</p>
            </div>
            <div className="i-ph:star text-3xl text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-bolt-elements-textSecondary">Pending Review</p>
              <p className="text-2xl font-bold text-bolt-elements-textPrimary">{stats.pendingShowcase}</p>
            </div>
            <div className="i-ph:clock text-3xl text-green-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="websites" className="flex-1 flex flex-col">
        <div className="px-6 border-b border-bolt-elements-borderColor">
          <TabsList>
            <TabsTrigger value="websites">
              <div className="i-ph:globe mr-2" />
              Websites
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <div className="i-ph:ticket mr-2" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="showcase">
              <div className="i-ph:star mr-2" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value="models">
              <div className="i-ph:robot mr-2" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="roles">
              <div className="i-ph:user-gear mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-6">
          <TabsContent value="websites">
            <WebsitesTable websites={websites} onRefresh={loadDashboardData} />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsTable tickets={tickets} onRefresh={loadDashboardData} />
          </TabsContent>

          <TabsContent value="showcase">
            <ShowcaseTable showcase={showcase} onRefresh={loadDashboardData} />
          </TabsContent>

          <TabsContent value="models">
            <AIModelsManager />
          </TabsContent>

          <TabsContent value="roles">
            <RolesManager />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function WebsitesTable({ websites, onRefresh }: { websites: UserWebsite[]; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-bolt-elements-textPrimary">User Websites</h2>
        <Button onClick={onRefresh} variant="secondary">
          <div className="i-ph:arrow-clockwise mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border border-bolt-elements-borderColor rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-bolt-elements-background-depth-2">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-bolt-elements-textPrimary">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-bolt-elements-textPrimary">URL</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-bolt-elements-textPrimary">Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-bolt-elements-textPrimary">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-bolt-elements-textPrimary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {websites.map((website) => (
              <tr key={website.id} className="border-t border-bolt-elements-borderColor hover:bg-bolt-elements-background-depth-2">
                <td className="px-4 py-3 text-sm text-bolt-elements-textPrimary">{website.title || 'Untitled'}</td>
                <td className="px-4 py-3">
                  <a
                    href={website.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    {website.website_url}
                    <div className="i-ph:arrow-square-out" />
                  </a>
                </td>
                <td className="px-4 py-3 text-sm text-bolt-elements-textSecondary">{website.view_count}</td>
                <td className="px-4 py-3 text-sm text-bolt-elements-textSecondary">
                  {new Date(website.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <div className="i-ph:eye" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TicketsTable({ tickets, onRefresh }: { tickets: SupportTicket[]; onRefresh: () => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-bolt-elements-textPrimary">Support Tickets</h2>
        <Button onClick={onRefresh} variant="secondary">
          <div className="i-ph:arrow-clockwise mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{ticket.ticket_number}</Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  <Badge variant="outline">{ticket.category}</Badge>
                </div>
                <h3 className="font-semibold text-bolt-elements-textPrimary mb-1">{ticket.subject}</h3>
                <p className="text-sm text-bolt-elements-textSecondary">
                  Created {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
              <Button variant="default" size="sm">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ShowcaseTable({ showcase, onRefresh }: { showcase: ShowcaseSubmission[]; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-bolt-elements-textPrimary">Showcase Submissions</h2>
        <Button onClick={onRefresh} variant="secondary">
          <div className="i-ph:arrow-clockwise mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {showcase.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-bolt-elements-textPrimary">{item.title}</h3>
                <Badge
                  className={
                    item.status === 'approved'
                      ? 'bg-green-500/20 text-green-400'
                      : item.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }
                >
                  {item.status}
                </Badge>
              </div>

              <a
                href={item.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                View Live
                <div className="i-ph:arrow-square-out" />
              </a>

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

              {item.status === 'pending' && (
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1">
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AIModelsManager() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-bolt-elements-textPrimary">AI Model Management</h2>
      <p className="text-bolt-elements-textSecondary">Configure and update AI models for the platform</p>
      {/* This will be implemented in the next component */}
    </div>
  );
}

function RolesManager() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-bolt-elements-textPrimary">Role Management</h2>
      <p className="text-bolt-elements-textSecondary">Create and manage admin roles and permissions</p>
      {/* This will be implemented in the next component */}
    </div>
  );
}
