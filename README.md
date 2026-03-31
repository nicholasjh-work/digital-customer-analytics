<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/nh-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/nh-logo-light.svg">
    <img alt="NH" src="assets/nh-logo-dark.svg" width="80">
  </picture>
</p>

<h1 align="center">digital-customer-analytics</h1>
<p align="center"><strong>Behavioral insights from wealth management digital platform clickstream data</strong></p>

<p align="center">
  <a href="https://digitalanalytics.nicholashidalgo.com"><img src="https://img.shields.io/badge/Live_Demo-blue?style=for-the-badge" alt="Demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/pandas-150458?style=flat&logo=pandas&logoColor=white" alt="pandas">
  <img src="https://img.shields.io/badge/SciPy-8CAAE6?style=flat&logo=scipy&logoColor=white" alt="SciPy">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Recharts-22b5bf?style=flat" alt="Recharts">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/dbt-FF694B?style=flat&logo=dbt&logoColor=white" alt="dbt">
</p>

---

### What This Is

End-to-end digital customer analytics pipeline: synthetic clickstream data generation, behavioral analysis engine, and interactive dashboard. Models the kind of work a Customer Knowledge & Strategic Insights (CKSI) team does at a large wealth management firm.

### What It Demonstrates

- **Digital funnel analysis** with stage-to-stage conversion rates across customer segments
- **Behavioral segmentation** by wealth tier (Mass Market, Mass Affluent, HNW, Ultra-HNW)
- **Channel attribution** metrics (organic, paid, email, social, referral, display)
- **A/B test evaluation** with statistical significance testing (t-tests, p-values, lift calculation)
- **Page engagement analytics** (time on page, exit rates, category-level patterns)
- **Monthly trend monitoring** (sessions, bounce rate, conversion rate, transactions)
- **Cohort retention analysis** (monthly cohorts, retention curves)

### Data Pipeline

```
Synthetic Generator (Python/Faker)
    → 12K customers, 180K sessions, 385K events, 824 transactions
    → CSV exports (customers, sessions, events, transactions)

Analytics Engine (pandas + SciPy)
    → Funnel computation (overall + by segment/channel/device)
    → Channel attribution metrics
    → Segment behavioral profiling
    → A/B test statistical evaluation
    → Cohort retention curves
    → JSON export for dashboard

React Dashboard (Recharts)
    → 7-tab interactive analytics interface
    → Segment/channel filtering
    → Funnel visualization with drill-down
    → Experiment results with p-value display
```

### Quickstart

```bash
git clone https://github.com/nicholasjh-work/digital-customer-analytics.git
cd digital-customer-analytics

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Generate synthetic data
python src/generate_data.py

# Run analytics pipeline
python src/analytics.py

# Run tests
pytest tests/ -v
```

### Project Structure

```
├── src/
│   ├── generate_data.py      # Synthetic clickstream data generator
│   └── analytics.py          # Analytics engine (funnel, attribution, A/B tests)
├── data/
│   ├── customers.csv          # 12K customer profiles
│   ├── sessions.csv           # 180K session records
│   ├── events.csv             # 385K page-level events
│   ├── transactions.csv       # 824 transactions
│   ├── ab_tests.json          # A/B test configuration
│   └── analytics_results.json # Computed analytics output
├── dashboard/
│   └── App.jsx                # React dashboard (single-file, embedded data)
├── tests/
│   └── test_analytics.py      # pytest suite
├── requirements.txt
└── README.md
```

### Key Findings (from synthetic data)

| Metric | Value | Insight |
|---|---|---|
| Overall bounce rate | 13.8% | Healthy for wealth platform |
| Mass Affluent CVR | 1.03% | 4x higher than Mass Market (0.26%) |
| Ultra-HNW bounce rate | 27.7% | Prefer advisor channel over digital |
| Funnel drop: Engage to Initiate | 5.5% | Biggest friction point |
| A/B test significance | 0/4 significant | Need longer runs or different metrics |

---

<p align="center">
  <a href="https://www.linkedin.com/in/nicholashidalgo"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>&nbsp;&nbsp;
  <a href="https://nicholashidalgo.com"><img src="https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white" alt="Website"></a>&nbsp;&nbsp;
  <a href="mailto:analytics@nicholashidalgo.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>
</p>
