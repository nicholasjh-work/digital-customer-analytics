import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie } from "recharts";

// Embedded analytics data (generated from 12K customers, 180K sessions, 385K events)
const DATA = {"funnel_overall":[{"stage":"session_start","label":"Session Start","count":180000,"pct_of_total":100.0,"stage_conversion":100.0},{"stage":"feature_browse","label":"Feature Browse","count":109591,"pct_of_total":60.9,"stage_conversion":60.9},{"stage":"feature_engage","label":"Feature Engage","count":59264,"pct_of_total":32.9,"stage_conversion":54.1},{"stage":"action_initiate","label":"Action Initiate","count":3265,"pct_of_total":1.8,"stage_conversion":5.5},{"stage":"action_complete","label":"Action Complete","count":1266,"pct_of_total":0.7,"stage_conversion":38.8}],"funnel_by_segment":[{"stage":"session_start","label":"Session Start","count":32737,"pct_of_total":100.0,"stage_conversion":100.0,"customer_segment":"high_net_worth"},{"stage":"feature_browse","label":"Feature Browse","count":18073,"pct_of_total":55.2,"stage_conversion":55.2,"customer_segment":"high_net_worth"},{"stage":"feature_engage","label":"Feature Engage","count":7919,"pct_of_total":24.2,"stage_conversion":43.8,"customer_segment":"high_net_worth"},{"stage":"action_initiate","label":"Action Initiate","count":210,"pct_of_total":0.6,"stage_conversion":2.7,"customer_segment":"high_net_worth"},{"stage":"action_complete","label":"Action Complete","count":76,"pct_of_total":0.2,"stage_conversion":36.2,"customer_segment":"high_net_worth"},{"stage":"session_start","label":"Session Start","count":53741,"pct_of_total":100.0,"stage_conversion":100.0,"customer_segment":"mass_affluent"},{"stage":"feature_browse","label":"Feature Browse","count":39558,"pct_of_total":73.6,"stage_conversion":73.6,"customer_segment":"mass_affluent"},{"stage":"feature_engage","label":"Feature Engage","count":26246,"pct_of_total":48.8,"stage_conversion":66.3,"customer_segment":"mass_affluent"},{"stage":"action_initiate","label":"Action Initiate","count":2141,"pct_of_total":4.0,"stage_conversion":8.2,"customer_segment":"mass_affluent"},{"stage":"action_complete","label":"Action Complete","count":853,"pct_of_total":1.6,"stage_conversion":39.8,"customer_segment":"mass_affluent"},{"stage":"session_start","label":"Session Start","count":80309,"pct_of_total":100.0,"stage_conversion":100.0,"customer_segment":"mass_market"},{"stage":"feature_browse","label":"Feature Browse","count":49146,"pct_of_total":61.2,"stage_conversion":61.2,"customer_segment":"mass_market"},{"stage":"feature_engage","label":"Feature Engage","count":24596,"pct_of_total":30.6,"stage_conversion":50.0,"customer_segment":"mass_market"},{"stage":"action_initiate","label":"Action Initiate","count":913,"pct_of_total":1.1,"stage_conversion":3.7,"customer_segment":"mass_market"},{"stage":"action_complete","label":"Action Complete","count":336,"pct_of_total":0.4,"stage_conversion":36.8,"customer_segment":"mass_market"},{"stage":"session_start","label":"Session Start","count":13213,"pct_of_total":100.0,"stage_conversion":100.0,"customer_segment":"ultra_hnw"},{"stage":"feature_browse","label":"Feature Browse","count":2814,"pct_of_total":21.3,"stage_conversion":21.3,"customer_segment":"ultra_hnw"},{"stage":"feature_engage","label":"Feature Engage","count":503,"pct_of_total":3.8,"stage_conversion":17.9,"customer_segment":"ultra_hnw"},{"stage":"action_initiate","label":"Action Initiate","count":1,"pct_of_total":0.0,"stage_conversion":0.2,"customer_segment":"ultra_hnw"},{"stage":"action_complete","label":"Action Complete","count":1,"pct_of_total":0.0,"stage_conversion":100.0,"customer_segment":"ultra_hnw"}],"channel_metrics":[{"acquisition_channel":"organic_search","total_sessions":51174,"avg_pages":2.1,"avg_duration":119,"bounce_rate":13.4,"conversion_rate":0.49,"session_share_pct":28.4},{"acquisition_channel":"direct","total_sessions":38945,"avg_pages":2.1,"avg_duration":118,"bounce_rate":13.7,"conversion_rate":0.41,"session_share_pct":21.6},{"acquisition_channel":"paid_search","total_sessions":32659,"avg_pages":2.1,"avg_duration":118,"bounce_rate":13.9,"conversion_rate":0.45,"session_share_pct":18.1},{"acquisition_channel":"email_campaign","total_sessions":21966,"avg_pages":2.1,"avg_duration":118,"bounce_rate":14.1,"conversion_rate":0.46,"session_share_pct":12.2},{"acquisition_channel":"social_media","total_sessions":13911,"avg_pages":2.1,"avg_duration":119,"bounce_rate":13.6,"conversion_rate":0.52,"session_share_pct":7.7},{"acquisition_channel":"referral","total_sessions":12352,"avg_pages":2.1,"avg_duration":118,"bounce_rate":14.6,"conversion_rate":0.49,"session_share_pct":6.9},{"acquisition_channel":"display_ads","total_sessions":8993,"avg_pages":2.1,"avg_duration":116,"bounce_rate":14.0,"conversion_rate":0.36,"session_share_pct":5.0}],"segment_behavior":[{"segment":"high_net_worth","total_sessions":32737,"unique_customers":2189,"avg_pages":1.9,"avg_duration":101,"bounce_rate":15.8,"conversion_rate":0.17,"avg_aum":1245641,"avg_propensity":0.554,"sessions_per_customer":15.0},{"segment":"mass_affluent","total_sessions":53741,"unique_customers":3585,"avg_pages":2.6,"avg_duration":152,"bounce_rate":9.1,"conversion_rate":1.03,"avg_aum":296524,"avg_propensity":0.75,"sessions_per_customer":15.0},{"segment":"mass_market","total_sessions":80309,"unique_customers":5355,"avg_pages":2.1,"avg_duration":113,"bounce_rate":13.8,"conversion_rate":0.26,"avg_aum":52822,"avg_propensity":0.602,"sessions_per_customer":15.0},{"segment":"ultra_hnw","total_sessions":13213,"unique_customers":871,"avg_pages":1.3,"avg_duration":53,"bounce_rate":27.7,"conversion_rate":0.01,"avg_aum":13509503,"avg_propensity":0.348,"sessions_per_customer":15.2}],"page_engagement":[{"page_category":"navigation","page_name":"home","total_views":78738,"avg_time_seconds":13.4,"exit_rate":40.4},{"page_category":"portfolio","page_name":"portfolio_overview","total_views":44644,"avg_time_seconds":40.2,"exit_rate":42.3},{"page_category":"research","page_name":"market_news","total_views":28140,"avg_time_seconds":45.7,"exit_rate":45.1},{"page_category":"research","page_name":"research_stocks","total_views":25093,"avg_time_seconds":92.0,"exit_rate":44.8},{"page_category":"trading","page_name":"trade_stocks","total_views":20741,"avg_time_seconds":82.9,"exit_rate":45.2},{"page_category":"planning","page_name":"retirement_planner","total_views":16965,"avg_time_seconds":111.7,"exit_rate":45.7},{"page_category":"digital_assets","page_name":"crypto_overview","total_views":13540,"avg_time_seconds":55.4,"exit_rate":45.6},{"page_category":"support","page_name":"help_center","total_views":13449,"avg_time_seconds":52.1,"exit_rate":48.7},{"page_category":"portfolio","page_name":"holdings_detail","total_views":12859,"avg_time_seconds":59.4,"exit_rate":51.9},{"page_category":"portfolio","page_name":"performance_chart","total_views":12855,"avg_time_seconds":34.5,"exit_rate":51.0},{"page_category":"research","page_name":"research_funds","total_views":12254,"avg_time_seconds":84.3,"exit_rate":52.1},{"page_category":"advisory","page_name":"digital_advisor","total_views":11881,"avg_time_seconds":140.6,"exit_rate":45.8},{"page_category":"planning","page_name":"goal_tracker","total_views":9185,"avg_time_seconds":89.7,"exit_rate":53.6},{"page_category":"trading","page_name":"trade_options","total_views":9164,"avg_time_seconds":120.5,"exit_rate":52.8},{"page_category":"support","page_name":"contact_support","total_views":9152,"avg_time_seconds":39.2,"exit_rate":53.4},{"page_category":"trading","page_name":"trade_mutual_funds","total_views":9143,"avg_time_seconds":79.9,"exit_rate":52.7},{"page_category":"planning","page_name":"tax_center","total_views":9073,"avg_time_seconds":69.5,"exit_rate":53.3},{"page_category":"trading","page_name":"trade_etfs","total_views":8966,"avg_time_seconds":74.3,"exit_rate":53.5},{"page_category":"settings","page_name":"profile_settings","total_views":7993,"avg_time_seconds":24.4,"exit_rate":54.6},{"page_category":"money_movement","page_name":"transfer_funds","total_views":7895,"avg_time_seconds":49.3,"exit_rate":54.9},{"page_category":"money_movement","page_name":"deposit","total_views":7844,"avg_time_seconds":39.8,"exit_rate":53.6},{"page_category":"money_movement","page_name":"bill_pay","total_views":7770,"avg_time_seconds":54.4,"exit_rate":54.9},{"page_category":"settings","page_name":"alerts_settings","total_views":7737,"avg_time_seconds":29.7,"exit_rate":54.3}],"ab_test_results":[{"test_id":"EXP-2025-001","name":"portfolio_dashboard_redesign","description":"New portfolio overview with performance attribution breakdown","date_range":"2025-03-01 to 2025-04-30","total_sessions":29581,"variants":{"control":{"sessions":14752,"avg_pages":2.14,"avg_duration":118.8,"bounce_rate":13.6,"conversion_rate":0.508},"variant_a":{"sessions":14829,"avg_pages":2.16,"avg_duration":119.5,"bounce_rate":13.5,"conversion_rate":0.425}},"significance":{"metric":"session_duration_seconds","t_statistic":-0.56,"p_value":0.5754,"significant_at_95":"False","control_mean":118.8,"variant_a_mean":119.5,"lift_pct":0.6}},{"test_id":"EXP-2025-002","name":"simplified_trade_flow","description":"Reduced steps in stock trading flow from 5 to 3","date_range":"2025-05-01 to 2025-06-30","total_sessions":30133,"variants":{"control":{"sessions":9748,"avg_pages":2.15,"avg_duration":118.4,"bounce_rate":13.8,"conversion_rate":0.503},"variant_a":{"sessions":9972,"avg_pages":2.15,"avg_duration":119.1,"bounce_rate":13.8,"conversion_rate":0.371},"variant_b":{"sessions":10413,"avg_pages":2.14,"avg_duration":119.1,"bounce_rate":13.4,"conversion_rate":0.519}},"significance":{"metric":"session_duration_seconds","t_statistic":-0.459,"p_value":0.6465,"significant_at_95":"False","control_mean":118.4,"variant_a_mean":119.1,"lift_pct":0.6}},{"test_id":"EXP-2025-003","name":"personalized_insights_banner","description":"ML-driven personalized insights on home page","date_range":"2025-07-01 to 2025-08-31","total_sessions":30088,"variants":{"control":{"sessions":15152,"avg_pages":2.12,"avg_duration":117.1,"bounce_rate":14.0,"conversion_rate":0.515},"variant_a":{"sessions":14936,"avg_pages":2.12,"avg_duration":116.9,"bounce_rate":13.9,"conversion_rate":0.482}},"significance":{"metric":"session_duration_seconds","t_statistic":0.2,"p_value":0.8414,"significant_at_95":"False","control_mean":117.1,"variant_a_mean":116.9,"lift_pct":-0.21}},{"test_id":"EXP-2025-004","name":"retirement_planner_v2","description":"Interactive retirement projection tool with scenario modeling","date_range":"2025-09-01 to 2025-10-31","total_sessions":29396,"variants":{"control":{"sessions":14765,"avg_pages":2.15,"avg_duration":118.9,"bounce_rate":13.5,"conversion_rate":0.44},"variant_a":{"sessions":14631,"avg_pages":2.15,"avg_duration":119.7,"bounce_rate":13.7,"conversion_rate":0.526}},"significance":{"metric":"session_duration_seconds","t_statistic":-0.654,"p_value":0.513,"significant_at_95":"False","control_mean":118.9,"variant_a_mean":119.7,"lift_pct":0.7}}],"monthly_trends":[{"session_month":"2025-01","total_sessions":15208,"unique_customers":8598,"avg_pages":2.1,"avg_duration":117,"bounce_rate":13.8,"conversion_rate":0.41,"transactions":62},{"session_month":"2025-02","total_sessions":13681,"unique_customers":8165,"avg_pages":2.1,"avg_duration":117,"bounce_rate":14.3,"conversion_rate":0.39,"transactions":54},{"session_month":"2025-03","total_sessions":15380,"unique_customers":8629,"avg_pages":2.1,"avg_duration":118,"bounce_rate":13.7,"conversion_rate":0.46,"transactions":71},{"session_month":"2025-04","total_sessions":14710,"unique_customers":8466,"avg_pages":2.2,"avg_duration":120,"bounce_rate":13.4,"conversion_rate":0.46,"transactions":68},{"session_month":"2025-05","total_sessions":15495,"unique_customers":8685,"avg_pages":2.1,"avg_duration":118,"bounce_rate":13.6,"conversion_rate":0.44,"transactions":68},{"session_month":"2025-06","total_sessions":15131,"unique_customers":8609,"avg_pages":2.2,"avg_duration":120,"bounce_rate":13.7,"conversion_rate":0.50,"transactions":75},{"session_month":"2025-07","total_sessions":15318,"unique_customers":8662,"avg_pages":2.1,"avg_duration":117,"bounce_rate":14.1,"conversion_rate":0.56,"transactions":86},{"session_month":"2025-08","total_sessions":15263,"unique_customers":8680,"avg_pages":2.1,"avg_duration":117,"bounce_rate":13.8,"conversion_rate":0.43,"transactions":66},{"session_month":"2025-09","total_sessions":14836,"unique_customers":8541,"avg_pages":2.2,"avg_duration":119,"bounce_rate":13.9,"conversion_rate":0.46,"transactions":68},{"session_month":"2025-10","total_sessions":15051,"unique_customers":8532,"avg_pages":2.1,"avg_duration":119,"bounce_rate":13.4,"conversion_rate":0.49,"transactions":74},{"session_month":"2025-11","total_sessions":14526,"unique_customers":8425,"avg_pages":2.1,"avg_duration":118,"bounce_rate":13.9,"conversion_rate":0.43,"transactions":63},{"session_month":"2025-12","total_sessions":15401,"unique_customers":8686,"avg_pages":2.1,"avg_duration":118,"bounce_rate":13.8,"conversion_rate":0.45,"transactions":69}],"segment_behavior_full":[{"segment":"high_net_worth","total_sessions":32737,"unique_customers":2189,"avg_pages":1.9,"avg_duration":101,"bounce_rate":15.8,"conversion_rate":0.17,"avg_aum":1245641,"avg_propensity":0.554},{"segment":"mass_affluent","total_sessions":53741,"unique_customers":3585,"avg_pages":2.6,"avg_duration":152,"bounce_rate":9.1,"conversion_rate":1.03,"avg_aum":296524,"avg_propensity":0.75},{"segment":"mass_market","total_sessions":80309,"unique_customers":5355,"avg_pages":2.1,"avg_duration":113,"bounce_rate":13.8,"conversion_rate":0.26,"avg_aum":52822,"avg_propensity":0.602},{"segment":"ultra_hnw","total_sessions":13213,"unique_customers":871,"avg_pages":1.3,"avg_duration":53,"bounce_rate":27.7,"conversion_rate":0.01,"avg_aum":13509503,"avg_propensity":0.348}],"device_breakdown":[{"device_type":"desktop","sessions":93750,"avg_duration":118,"bounce_rate":13.8,"conversion_rate":0.47,"share_pct":52.1},{"device_type":"mobile","sessions":68377,"avg_duration":118,"bounce_rate":13.6,"conversion_rate":0.43,"share_pct":38.0},{"device_type":"tablet","sessions":17873,"avg_duration":117,"bounce_rate":14.1,"conversion_rate":0.48,"share_pct":9.9}],"summary":{"total_customers":12000,"total_sessions":180000,"total_events":385081,"total_transactions":824,"overall_bounce_rate":13.8,"overall_conversion_rate":0.46,"avg_session_duration":118,"avg_pages_per_session":2.1,"date_range":"2025-01-01 to 2025-12-31"}};

const SEGMENT_COLORS = { mass_market: "#3b82f6", mass_affluent: "#8b5cf6", high_net_worth: "#f59e0b", ultra_hnw: "#ef4444" };
const CHANNEL_COLORS = { organic_search: "#10b981", direct: "#3b82f6", paid_search: "#f59e0b", email_campaign: "#8b5cf6", social_media: "#ec4899", referral: "#06b6d4", display_ads: "#f97316" };
const CAT_COLORS = { navigation: "#64748b", portfolio: "#3b82f6", research: "#8b5cf6", trading: "#10b981", planning: "#f59e0b", money_movement: "#06b6d4", digital_assets: "#ec4899", advisory: "#f97316", support: "#ef4444", settings: "#94a3b8" };

const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n);
const fmtUsd = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
const segLabel = (s) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Hnw","HNW").replace("Uhnw","UHNW");
const chanLabel = (s) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const pageLabel = (s) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const TABS = ["Overview", "Funnel", "Segments", "Channels", "Pages", "Experiments", "Trends"];

function KPI({ label, value, sub, accent }) {
  return (
    <div style={{ padding: "20px 24px", background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Card({ title, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)", padding: "24px", overflow: "hidden" }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.01em" }}>{title}</div>}
      {children}
    </div>
  );
}

function Overview() {
  const s = DATA.summary;
  const trends = DATA.monthly_trends;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <KPI label="Total Sessions" value={fmt(s.total_sessions)} sub={s.date_range} />
        <KPI label="Unique Customers" value={fmt(s.total_customers)} />
        <KPI label="Bounce Rate" value={`${s.overall_bounce_rate}%`} accent={s.overall_bounce_rate > 15 ? "#ef4444" : "#10b981"} />
        <KPI label="Conversion Rate" value={`${s.overall_conversion_rate}%`} accent="#8b5cf6" />
        <KPI label="Avg Duration" value={`${s.avg_session_duration}s`} />
        <KPI label="Transactions" value={fmt(s.total_transactions)} />
      </div>
      <Card title="Monthly Sessions and Conversions" span={2}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis dataKey="session_month" tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={fmt} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="total_sessions" stroke="#3b82f6" fill="url(#gSessions)" strokeWidth={2} name="Sessions" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Sessions by Device">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={DATA.device_breakdown} dataKey="sessions" nameKey="device_type" cx="50%" cy="50%" outerRadius={80} label={({ device_type, share_pct }) => `${chanLabel(device_type)} ${share_pct}%`} labelLine={false} fontSize={11}>
                {DATA.device_breakdown.map((d, i) => <Cell key={i} fill={["#3b82f6","#8b5cf6","#f59e0b"][i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Segment Distribution">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DATA.segment_behavior.map(s => (
              <div key={s.segment}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{segLabel(s.segment)}</span>
                  <span style={{ color: "var(--muted)" }}>{fmt(s.total_sessions)} sessions / {fmt(s.unique_customers)} customers</span>
                </div>
                <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.total_sessions/DATA.summary.total_sessions)*100}%`, background: SEGMENT_COLORS[s.segment], borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Funnel() {
  const [groupBy, setGroupBy] = useState("overall");
  const segments = ["mass_market","mass_affluent","high_net_worth","ultra_hnw"];
  
  const funnelData = useMemo(() => {
    if (groupBy === "overall") return DATA.funnel_overall;
    return DATA.funnel_by_segment.filter(r => r.customer_segment === groupBy);
  }, [groupBy]);

  const barColors = ["#3b82f6","#6366f1","#8b5cf6","#a855f7","#c084fc"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["overall", ...segments].map(g => (
          <button key={g} onClick={() => setGroupBy(g)} style={{ padding: "6px 14px", borderRadius: 6, border: groupBy === g ? "2px solid #3b82f6" : "1px solid var(--border)", background: groupBy === g ? "rgba(59,130,246,0.1)" : "var(--card)", color: groupBy === g ? "#3b82f6" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {g === "overall" ? "All Segments" : segLabel(g)}
          </button>
        ))}
      </div>
      <Card title={`Conversion Funnel${groupBy !== "overall" ? ` / ${segLabel(groupBy)}` : ""}`}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 120 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={fmt} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "var(--text)" }} width={110} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [fmt(v), n]} />
            <Bar dataKey="count" radius={[0,6,6,0]} name="Sessions">
              {funnelData.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Stage-to-Stage Conversion Rates">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {funnelData.filter(r => r.stage !== "session_start").map(r => (
            <div key={r.stage} style={{ padding: 16, borderRadius: 8, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: r.stage_conversion < 10 ? "#ef4444" : r.stage_conversion < 50 ? "#f59e0b" : "#10b981" }}>
                {r.stage_conversion}%
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmt(r.count)} sessions</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Segments() {
  const data = DATA.segment_behavior;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title="Segment Performance Comparison">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {["Segment","Customers","Sessions","Avg AUM","Avg Pages","Duration","Bounce","CVR","Propensity"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.segment} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: SEGMENT_COLORS[s.segment], marginRight: 8 }} />
                    {segLabel(s.segment)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{fmt(s.unique_customers)}</td>
                  <td style={{ padding: "10px 12px" }}>{fmt(s.total_sessions)}</td>
                  <td style={{ padding: "10px 12px" }}>{fmtUsd(s.avg_aum)}</td>
                  <td style={{ padding: "10px 12px" }}>{s.avg_pages}</td>
                  <td style={{ padding: "10px 12px" }}>{s.avg_duration}s</td>
                  <td style={{ padding: "10px 12px", color: s.bounce_rate > 20 ? "#ef4444" : "var(--text)" }}>{s.bounce_rate}%</td>
                  <td style={{ padding: "10px 12px", color: s.conversion_rate > 0.5 ? "#10b981" : "var(--text)", fontWeight: 600 }}>{s.conversion_rate}%</td>
                  <td style={{ padding: "10px 12px" }}>{s.avg_propensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Avg Session Duration by Segment">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.map(s => ({ ...s, label: segLabel(s.segment) }))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg_duration" name="Avg Duration (s)" radius={[6,6,0,0]}>
                {data.map((s, i) => <Cell key={i} fill={SEGMENT_COLORS[s.segment]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Conversion Rate by Segment">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.map(s => ({ ...s, label: segLabel(s.segment) }))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="conversion_rate" name="CVR (%)" radius={[6,6,0,0]}>
                {data.map((s, i) => <Cell key={i} fill={SEGMENT_COLORS[s.segment]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Key Insight">
        <div style={{ padding: "16px 20px", background: "rgba(139,92,246,0.06)", borderRadius: 8, border: "1px solid rgba(139,92,246,0.15)", fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>
          <strong>Mass Affluent is the highest-value digital segment.</strong> They have the highest conversion rate (1.03%), longest average session duration (152s), lowest bounce rate (9.1%), and highest digital propensity (0.75). Despite having 3x fewer customers than Mass Market, they generate disproportionate transaction volume. Recommendation: prioritize personalization experiments targeting this segment.
        </div>
      </Card>
    </div>
  );
}

function Channels() {
  const data = DATA.channel_metrics;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title="Channel Attribution Metrics">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {["Channel","Sessions","Share","Avg Pages","Duration","Bounce","CVR"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c.acquisition_channel} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: CHANNEL_COLORS[c.acquisition_channel], marginRight: 8 }} />
                    {chanLabel(c.acquisition_channel)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{fmt(c.total_sessions)}</td>
                  <td style={{ padding: "10px 12px" }}>{c.session_share_pct}%</td>
                  <td style={{ padding: "10px 12px" }}>{c.avg_pages}</td>
                  <td style={{ padding: "10px 12px" }}>{c.avg_duration}s</td>
                  <td style={{ padding: "10px 12px" }}>{c.bounce_rate}%</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: c.conversion_rate > 0.48 ? "#10b981" : "var(--text)" }}>{c.conversion_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Session Volume by Channel">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.map(c => ({ ...c, label: chanLabel(c.acquisition_channel) }))} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)", angle: -35, textAnchor: "end" }} height={60} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={fmt} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="total_sessions" name="Sessions" radius={[6,6,0,0]}>
              {data.map((c, i) => <Cell key={i} fill={CHANNEL_COLORS[c.acquisition_channel]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Pages() {
  const data = DATA.page_engagement;
  const categories = [...new Set(data.map(p => p.page_category))];
  const [filterCat, setFilterCat] = useState("all");
  const filtered = filterCat === "all" ? data : data.filter(p => p.page_category === filterCat);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setFilterCat("all")} style={{ padding: "6px 14px", borderRadius: 6, border: filterCat === "all" ? "2px solid #3b82f6" : "1px solid var(--border)", background: filterCat === "all" ? "rgba(59,130,246,0.1)" : "var(--card)", color: filterCat === "all" ? "#3b82f6" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "6px 14px", borderRadius: 6, border: filterCat === c ? "2px solid #3b82f6" : "1px solid var(--border)", background: filterCat === c ? "rgba(59,130,246,0.1)" : "var(--card)", color: filterCat === c ? "#3b82f6" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {chanLabel(c)}
          </button>
        ))}
      </div>
      <Card title="Page Engagement (Time on Page vs Views)">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filtered.slice(0, 15).map(p => ({ ...p, label: pageLabel(p.page_name) }))} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 140 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "var(--text)" }} width={130} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="avg_time_seconds" name="Avg Time (s)" radius={[0,6,6,0]}>
              {filtered.slice(0, 15).map((p, i) => <Cell key={i} fill={CAT_COLORS[p.page_category] || "#64748b"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Exit Rate by Page">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filtered.sort((a,b) => b.exit_rate - a.exit_rate).slice(0, 12).map(p => ({ ...p, label: pageLabel(p.page_name) }))} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted)", angle: -40, textAnchor: "end" }} height={70} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} domain={[0, 60]} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="exit_rate" name="Exit Rate (%)" radius={[6,6,0,0]} fill="#ef4444" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Experiments() {
  const tests = DATA.ab_test_results;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {tests.map(test => {
        const sig = test.significance;
        const isSig = sig && sig.significant_at_95 === true;
        return (
          <Card key={test.test_id} title={`${test.test_id}: ${chanLabel(test.name)}`}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, marginTop: -8 }}>{test.description}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, background: "var(--bg)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Date Range</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{test.date_range}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: "var(--bg)", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Total Sessions</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{fmt(test.total_sessions)}</div>
              </div>
              {sig && (
                <>
                  <div style={{ padding: 12, borderRadius: 8, background: "var(--bg)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Lift</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: sig.lift_pct > 0 ? "#10b981" : "#ef4444" }}>{sig.lift_pct > 0 ? "+" : ""}{sig.lift_pct}%</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: isSig ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.06)", textAlign: "center", border: `1px solid ${isSig ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)"}` }}>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>p-value</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: isSig ? "#10b981" : "#ef4444" }}>{sig.p_value}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{isSig ? "Significant at 95%" : "Not significant"}</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.03em" }}>Variant Comparison</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Variant","Sessions","Avg Pages","Duration","Bounce","CVR"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(test.variants).map(([name, v]) => (
                    <tr key={name} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{chanLabel(name)}</td>
                      <td style={{ padding: "8px 10px" }}>{fmt(v.sessions)}</td>
                      <td style={{ padding: "8px 10px" }}>{v.avg_pages}</td>
                      <td style={{ padding: "8px 10px" }}>{v.avg_duration}s</td>
                      <td style={{ padding: "8px 10px" }}>{v.bounce_rate}%</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{v.conversion_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
      <Card title="Experiment Program Insight">
        <div style={{ padding: "16px 20px", background: "rgba(59,130,246,0.06)", borderRadius: 8, border: "1px solid rgba(59,130,246,0.15)", fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>
          <strong>No experiments reached statistical significance at 95% confidence.</strong> With ~15K sessions per variant across 2-month windows, the experiments had sufficient power to detect moderate effect sizes (>5% lift). The small observed lifts (0.6-0.7%) suggest either the treatments had minimal impact, or the metric (session duration) was not the right primary metric. Recommendation: reframe experiments around conversion rate or feature adoption rate, and consider longer run times or targeting specific segments (e.g., Mass Affluent where digital propensity is highest).
        </div>
      </Card>
    </div>
  );
}

function Trends() {
  const data = DATA.monthly_trends;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title="Monthly Session Volume">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis dataKey="session_month" tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={fmt} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="total_sessions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} name="Sessions" />
            <Line type="monotone" dataKey="unique_customers" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: "#8b5cf6" }} name="Unique Customers" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Bounce Rate Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
              <XAxis dataKey="session_month" tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} domain={[12, 16]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="bounce_rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Bounce %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Conversion Rate Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
              <XAxis dataKey="session_month" tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} domain={[0.3, 0.6]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="conversion_rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="CVR %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card title="Monthly Transactions">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
            <XAxis dataKey="session_month" tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="transactions" name="Transactions" radius={[6,6,0,0]} fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

const TAB_COMPONENTS = { Overview, Funnel, Segments, Channels, Pages, Experiments, Trends };

export default function App() {
  const [tab, setTab] = useState("Overview");
  const TabContent = TAB_COMPONENTS[tab];

  return (
    <div style={{ "--bg": "#0c0f1a", "--card": "#131728", "--border": "#1e2540", "--text": "#e2e8f0", "--muted": "#64748b", "--grid": "rgba(100,116,139,0.12)", minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Digital Customer Analytics</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Wealth Platform Behavioral Insights</h1>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            12K customers / 180K sessions / 385K events / Jan-Dec 2025
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 2, marginBottom: 28, borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 18px", border: "none", borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent", background: "transparent", color: tab === t ? "#3b82f6" : "var(--muted)", fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s, border-color 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        <TabContent />

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)" }}>
          <div>Built by Nicholas Hidalgo / Synthetic data modeled after wealth management digital platform</div>
          <div>Python + pandas + React + Recharts / github.com/nicholasjh-work/digital-customer-analytics</div>
        </div>
      </div>
    </div>
  );
}
