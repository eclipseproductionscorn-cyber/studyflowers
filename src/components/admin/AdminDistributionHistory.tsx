import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { History, Filter, Calendar, Zap, Coins, Package, Sparkles, Users, Crown, Loader2, PieChart as PieIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: string | null;
  created_at: string;
}

interface UserMap {
  [userId: string]: string;
}

const ACTION_META: Record<string, { label: string; icon: any; color: string; gradient: string }> = {
  give_resources: { label: "Recursos", icon: Zap, color: "text-amber-500", gradient: "from-amber-500 to-orange-600" },
  give_item: { label: "Item", icon: Package, color: "text-purple-500", gradient: "from-purple-500 to-pink-600" },
  god_mode_self: { label: "Modo Deus", icon: Crown, color: "text-yellow-500", gradient: "from-yellow-500 to-amber-600" },
  broadcast_reward: { label: "Broadcast", icon: Users, color: "text-blue-500", gradient: "from-blue-500 to-cyan-600" },
};

const ALL_DISTRIBUTION_ACTIONS = Object.keys(ACTION_META);

const AdminDistributionHistory = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, today, 7d, 30d
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const { data: logsData } = await supabase
      .from("admin_logs")
      .select("*")
      .in("action", ALL_DISTRIBUTION_ACTIONS)
      .order("created_at", { ascending: false })
      .limit(500);

    if (logsData) {
      setLogs(logsData);
      const userIds = Array.from(new Set(
        logsData.flatMap(l => [l.admin_id, l.target_user_id]).filter(Boolean) as string[]
      ));
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, public_name")
          .in("user_id", userIds);
        if (profiles) {
          const map: UserMap = {};
          profiles.forEach(p => { map[p.user_id] = p.public_name; });
          setUserMap(map);
        }
      }
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = logs;
    if (typeFilter !== "all") result = result.filter(l => l.action === typeFilter);
    if (dateFilter !== "all") {
      const now = Date.now();
      const cutoffs: Record<string, number> = {
        today: 86400000, "7d": 604800000, "30d": 2592000000,
      };
      const cutoff = cutoffs[dateFilter];
      if (cutoff) result = result.filter(l => now - new Date(l.created_at).getTime() <= cutoff);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => 
        (l.details || "").toLowerCase().includes(s) ||
        (userMap[l.target_user_id || ""] || "").toLowerCase().includes(s) ||
        (userMap[l.admin_id] || "").toLowerCase().includes(s)
      );
    }
    return result;
  }, [logs, typeFilter, dateFilter, search, userMap]);

  // Stats por tipo
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_DISTRIBUTION_ACTIONS.forEach(a => { counts[a] = 0; });
    filtered.forEach(l => { counts[l.action] = (counts[l.action] || 0) + 1; });
    return counts;
  }, [filtered]);

  // Totais distribuídos para o gráfico de pizza
  const distribution = useMemo(() => {
    let xp = 0, coins = 0, items = 0;
    const xpRe = /\+?(\d+)\s*XP/i;
    const coinRe = /\+?(\d+)\s*(?:coins?|moedas?)/i;
    const usersRe = /(\d+)\s*users?/i;
    filtered.forEach(l => {
      const d = l.details || "";
      if (l.action === "give_item") { items += 1; return; }
      if (l.action === "god_mode_self") { xp += 999999; coins += 999999; return; }
      const xpM = d.match(xpRe);
      const coinM = d.match(coinRe);
      const userM = l.action === "broadcast_reward" ? d.match(usersRe) : null;
      const mult = userM ? parseInt(userM[1]) : 1;
      if (xpM) xp += parseInt(xpM[1]) * mult;
      if (coinM) coins += parseInt(coinM[1]) * mult;
    });
    return { xp, coins, items };
  }, [filtered]);

  const pieData = useMemo(() => ([
    { name: "XP", value: distribution.xp, color: "hsl(var(--primary))" },
    { name: "Moedas", value: distribution.coins, color: "#f59e0b" },
    { name: "Itens", value: distribution.items, color: "#a855f7" },
  ].filter(d => d.value > 0)), [distribution]);

  const totalSum = pieData.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <History size={32} />
          <div>
            <h2 className="text-2xl font-bold">Histórico de Distribuições</h2>
            <p className="text-white/90 text-sm">Auditoria visual de todas as recompensas concedidas</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ALL_DISTRIBUTION_ACTIONS.map(action => {
          const meta = ACTION_META[action];
          const Icon = meta.icon;
          return (
            <motion.div
              key={action}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${meta.gradient} rounded-xl p-4 text-white shadow-md`}
            >
              <Icon size={20} className="mb-2 opacity-90" />
              <div className="text-2xl font-bold">{stats[action]}</div>
              <div className="text-xs text-white/80">{meta.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Pie chart - proporção XP/Moedas/Itens */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
          <PieIcon size={18} className="text-primary" /> Proporção Distribuída
          <span className="text-xs text-muted-foreground font-normal ml-auto">
            Baseado nos filtros atuais
          </span>
        </div>
        {pieData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Sem dados para exibir
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    label={(e: any) => `${Math.round((e.value / totalSum) * 100)}%`}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => v.toLocaleString("pt-BR")}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
                <span className="flex items-center gap-2 text-sm font-medium"><Zap size={16} className="text-primary" /> XP total</span>
                <span className="font-bold">{distribution.xp.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10">
                <span className="flex items-center gap-2 text-sm font-medium"><Coins size={16} className="text-amber-500" /> Moedas totais</span>
                <span className="font-bold">{distribution.coins.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10">
                <span className="flex items-center gap-2 text-sm font-medium"><Package size={16} className="text-purple-500" /> Itens entregues</span>
                <span className="font-bold">{distribution.items.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Filter size={18} /> Filtros
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {ALL_DISTRIBUTION_ACTIONS.map(a => (
                <SelectItem key={a} value={a}>{ACTION_META[a].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="today">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Buscar por usuário ou detalhe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} distribuição(ões) encontradas</span>
          <Button variant="ghost" size="sm" onClick={loadHistory}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <Sparkles size={40} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma distribuição encontrada com esses filtros</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, idx) => {
            const meta = ACTION_META[log.action] || ACTION_META.give_resources;
            const Icon = meta.icon;
            const targetName = log.target_user_id ? userMap[log.target_user_id] : null;
            const adminName = userMap[log.admin_id] || "Admin";
            const date = new Date(log.created_at);
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div className={`bg-gradient-to-br ${meta.gradient} p-3 rounded-xl flex-shrink-0`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={meta.color}>{meta.label}</Badge>
                    <span className="font-semibold text-foreground truncate">
                      {targetName || (log.action === "broadcast_reward" ? "Todos os usuários" : "—")}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1 break-words">{log.details}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Crown size={12} /> {adminName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDistributionHistory;
