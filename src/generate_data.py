"""
Generate synthetic clickstream and customer behavior data
modeled after a wealth management digital platform.

Produces datasets that mirror what Fidelity's CKSI team would analyze:
- Customer attributes and segments
- Digital session/event data (page views, clicks, feature engagement)
- Transactional activity (trades, transfers, account opens)
- Funnel progression events
- A/B test assignments and outcomes
"""

import csv
import hashlib
import json
import logging
import random
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# --- Configuration ---

OUTPUT_DIR = Path(__file__).parent.parent / "data"
NUM_CUSTOMERS = 12_000
NUM_SESSIONS = 180_000
DATE_START = datetime(2025, 1, 1)
DATE_END = datetime(2025, 12, 31)
SEED = 42

# Customer segments modeled after wealth management tiers
SEGMENTS = {
    "mass_market": {"weight": 0.45, "aum_range": (5_000, 100_000), "digital_propensity": 0.6},
    "mass_affluent": {"weight": 0.30, "aum_range": (100_000, 500_000), "digital_propensity": 0.75},
    "high_net_worth": {"weight": 0.18, "aum_range": (500_000, 2_000_000), "digital_propensity": 0.55},
    "ultra_hnw": {"weight": 0.07, "aum_range": (2_000_000, 25_000_000), "digital_propensity": 0.35},
}

ACQUISITION_CHANNELS = [
    ("organic_search", 0.28),
    ("direct", 0.22),
    ("paid_search", 0.18),
    ("email_campaign", 0.12),
    ("social_media", 0.08),
    ("referral", 0.07),
    ("display_ads", 0.05),
]

DEVICES = [("desktop", 0.52), ("mobile", 0.38), ("tablet", 0.10)]

BROWSERS = [
    ("chrome", 0.58),
    ("safari", 0.24),
    ("edge", 0.10),
    ("firefox", 0.06),
    ("other", 0.02),
]

REGIONS = [
    ("northeast", 0.28),
    ("southeast", 0.22),
    ("midwest", 0.18),
    ("west", 0.20),
    ("southwest", 0.12),
]

AGE_BRACKETS = [
    ("18-29", 0.12),
    ("30-39", 0.22),
    ("40-49", 0.25),
    ("50-59", 0.23),
    ("60-69", 0.13),
    ("70+", 0.05),
]

# Page taxonomy for a wealth management platform
PAGES = {
    "home": {"category": "navigation", "avg_time_sec": 15},
    "portfolio_overview": {"category": "portfolio", "avg_time_sec": 45},
    "holdings_detail": {"category": "portfolio", "avg_time_sec": 60},
    "performance_chart": {"category": "portfolio", "avg_time_sec": 35},
    "trade_stocks": {"category": "trading", "avg_time_sec": 90},
    "trade_etfs": {"category": "trading", "avg_time_sec": 75},
    "trade_mutual_funds": {"category": "trading", "avg_time_sec": 80},
    "trade_options": {"category": "trading", "avg_time_sec": 120},
    "transfer_funds": {"category": "money_movement", "avg_time_sec": 50},
    "deposit": {"category": "money_movement", "avg_time_sec": 40},
    "bill_pay": {"category": "money_movement", "avg_time_sec": 55},
    "retirement_planner": {"category": "planning", "avg_time_sec": 120},
    "goal_tracker": {"category": "planning", "avg_time_sec": 90},
    "tax_center": {"category": "planning", "avg_time_sec": 70},
    "research_stocks": {"category": "research", "avg_time_sec": 100},
    "research_funds": {"category": "research", "avg_time_sec": 85},
    "market_news": {"category": "research", "avg_time_sec": 50},
    "alerts_settings": {"category": "settings", "avg_time_sec": 30},
    "profile_settings": {"category": "settings", "avg_time_sec": 25},
    "contact_support": {"category": "support", "avg_time_sec": 40},
    "help_center": {"category": "support", "avg_time_sec": 55},
    "digital_advisor": {"category": "advisory", "avg_time_sec": 150},
    "crypto_overview": {"category": "digital_assets", "avg_time_sec": 60},
}

# Funnel stages
FUNNEL_STAGES = [
    "session_start",
    "feature_browse",
    "feature_engage",
    "action_initiate",
    "action_complete",
]

# A/B test configurations
AB_TESTS = [
    {
        "test_id": "EXP-2025-001",
        "name": "portfolio_dashboard_redesign",
        "description": "New portfolio overview with performance attribution breakdown",
        "start_date": "2025-03-01",
        "end_date": "2025-04-30",
        "variants": ["control", "variant_a"],
        "metric": "portfolio_page_engagement_seconds",
    },
    {
        "test_id": "EXP-2025-002",
        "name": "simplified_trade_flow",
        "description": "Reduced steps in stock trading flow from 5 to 3",
        "start_date": "2025-05-01",
        "end_date": "2025-06-30",
        "variants": ["control", "variant_a", "variant_b"],
        "metric": "trade_completion_rate",
    },
    {
        "test_id": "EXP-2025-003",
        "name": "personalized_insights_banner",
        "description": "ML-driven personalized insights on home page",
        "start_date": "2025-07-01",
        "end_date": "2025-08-31",
        "variants": ["control", "variant_a"],
        "metric": "home_to_action_conversion_rate",
    },
    {
        "test_id": "EXP-2025-004",
        "name": "retirement_planner_v2",
        "description": "Interactive retirement projection tool with scenario modeling",
        "start_date": "2025-09-01",
        "end_date": "2025-10-31",
        "variants": ["control", "variant_a"],
        "metric": "planner_completion_rate",
    },
]


def weighted_choice(choices: list[tuple[str, float]]) -> str:
    items, weights = zip(*choices)
    return random.choices(items, weights=weights, k=1)[0]


def generate_customer_id(index: int) -> str:
    return hashlib.md5(f"customer_{index}_{SEED}".encode()).hexdigest()[:12].upper()


@dataclass
class Customer:
    customer_id: str
    segment: str
    aum: float
    age_bracket: str
    region: str
    account_open_date: str
    preferred_device: str
    preferred_browser: str
    primary_channel: str
    digital_propensity: float
    has_advisor: bool
    account_types: list[str] = field(default_factory=list)
    risk_tolerance: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "customer_id": self.customer_id,
            "segment": self.segment,
            "aum_usd": round(self.aum, 2),
            "age_bracket": self.age_bracket,
            "region": self.region,
            "account_open_date": self.account_open_date,
            "preferred_device": self.preferred_device,
            "preferred_browser": self.preferred_browser,
            "primary_acquisition_channel": self.primary_channel,
            "digital_propensity_score": round(self.digital_propensity, 3),
            "has_financial_advisor": self.has_advisor,
            "account_types": "|".join(self.account_types),
            "risk_tolerance": self.risk_tolerance,
        }


def generate_customers(n: int) -> list[Customer]:
    logger.info(f"Generating {n} customers...")
    customers = []
    segment_items = list(SEGMENTS.items())
    segment_names = [s[0] for s in segment_items]
    segment_weights = [s[1]["weight"] for s in segment_items]

    account_type_options = ["individual_brokerage", "ira", "roth_ira", "401k_rollover", "joint", "trust", "529"]
    risk_levels = ["conservative", "moderate_conservative", "moderate", "moderate_aggressive", "aggressive"]

    for i in range(n):
        seg_name = random.choices(segment_names, weights=segment_weights, k=1)[0]
        seg = SEGMENTS[seg_name]
        aum = random.uniform(*seg["aum_range"])
        propensity = seg["digital_propensity"] + random.gauss(0, 0.1)
        propensity = max(0.05, min(0.98, propensity))

        open_date = DATE_START - timedelta(days=random.randint(30, 3650))

        has_advisor = seg_name in ("high_net_worth", "ultra_hnw") and random.random() < 0.7
        num_accounts = random.choices([1, 2, 3, 4], weights=[0.4, 0.35, 0.2, 0.05], k=1)[0]
        accounts = random.sample(account_type_options, min(num_accounts, len(account_type_options)))

        c = Customer(
            customer_id=generate_customer_id(i),
            segment=seg_name,
            aum=aum,
            age_bracket=weighted_choice(AGE_BRACKETS),
            region=weighted_choice(REGIONS),
            account_open_date=open_date.strftime("%Y-%m-%d"),
            preferred_device=weighted_choice(DEVICES),
            preferred_browser=weighted_choice(BROWSERS),
            primary_channel=weighted_choice(ACQUISITION_CHANNELS),
            digital_propensity=propensity,
            has_advisor=has_advisor,
            account_types=accounts,
            risk_tolerance=random.choice(risk_levels),
        )
        customers.append(c)

    logger.info(f"Generated {len(customers)} customers across {len(SEGMENTS)} segments")
    return customers


def generate_sessions(customers: list[Customer], n_sessions: int) -> tuple[list[dict], list[dict], list[dict]]:
    """Generate session, event, and transaction records."""
    logger.info(f"Generating {n_sessions} sessions...")
    sessions = []
    events = []
    transactions = []
    total_days = (DATE_END - DATE_START).days

    for _ in range(n_sessions):
        customer = random.choice(customers)
        session_date = DATE_START + timedelta(
            days=random.randint(0, total_days),
            hours=random.randint(6, 23),
            minutes=random.randint(0, 59),
        )

        # Higher propensity customers have more pages per session
        base_pages = max(1, int(random.gauss(4, 2) * customer.digital_propensity))
        num_pages = min(base_pages, 25)

        session_id = str(uuid.uuid4())[:16]
        device = customer.preferred_device if random.random() < 0.7 else weighted_choice(DEVICES)
        channel = customer.primary_channel if random.random() < 0.6 else weighted_choice(ACQUISITION_CHANNELS)

        # Determine landing page
        landing_weights = {
            "home": 0.40,
            "portfolio_overview": 0.20,
            "market_news": 0.10,
            "research_stocks": 0.08,
            "trade_stocks": 0.07,
            "retirement_planner": 0.05,
            "crypto_overview": 0.04,
            "help_center": 0.03,
            "digital_advisor": 0.03,
        }
        landing_page = random.choices(
            list(landing_weights.keys()),
            weights=list(landing_weights.values()),
            k=1,
        )[0]

        # Build page sequence
        page_list = list(PAGES.keys())
        page_sequence = [landing_page]
        current_page = landing_page
        for _ in range(num_pages - 1):
            # Navigation tends to follow category patterns
            current_cat = PAGES[current_page]["category"]
            same_cat_pages = [p for p in page_list if PAGES[p]["category"] == current_cat and p != current_page]
            if same_cat_pages and random.random() < 0.4:
                next_page = random.choice(same_cat_pages)
            else:
                next_page = random.choice(page_list)
            page_sequence.append(next_page)
            current_page = next_page

        # Calculate session metrics
        total_time = 0
        is_bounced = num_pages == 1 and random.random() < 0.35

        # Determine funnel progression
        max_funnel_stage = 0
        if not is_bounced:
            if num_pages >= 2:
                max_funnel_stage = 1
            if num_pages >= 3:
                max_funnel_stage = 2
            if num_pages >= 5 and random.random() < 0.4:
                max_funnel_stage = 3
            if max_funnel_stage == 3 and random.random() < 0.5 * customer.digital_propensity:
                max_funnel_stage = 4

        # Generate events for this session
        event_time = session_date
        for idx, page in enumerate(page_sequence):
            page_info = PAGES[page]
            time_on_page = max(
                3,
                int(random.gauss(page_info["avg_time_sec"], page_info["avg_time_sec"] * 0.4)),
            )
            if is_bounced:
                time_on_page = random.randint(2, 8)

            total_time += time_on_page

            # Determine interaction events on this page
            interactions = []
            if random.random() < 0.3:
                interactions.append("scroll_deep")
            if random.random() < 0.15:
                interactions.append("click_cta")
            if page_info["category"] == "research" and random.random() < 0.2:
                interactions.append("add_watchlist")
            if page_info["category"] == "portfolio" and random.random() < 0.1:
                interactions.append("export_data")
            if page_info["category"] == "planning" and random.random() < 0.12:
                interactions.append("save_scenario")

            event = {
                "event_id": str(uuid.uuid4())[:16],
                "session_id": session_id,
                "customer_id": customer.customer_id,
                "event_timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                "page_name": page,
                "page_category": page_info["category"],
                "page_sequence_number": idx + 1,
                "time_on_page_seconds": time_on_page,
                "interactions": "|".join(interactions) if interactions else "",
                "is_landing_page": idx == 0,
                "is_exit_page": idx == len(page_sequence) - 1,
            }
            events.append(event)
            event_time += timedelta(seconds=time_on_page + random.randint(1, 5))

        # Check if session generated a transaction
        has_transaction = False
        if max_funnel_stage == 4:
            trading_pages = [p for p in page_sequence if PAGES[p]["category"] == "trading"]
            money_pages = [p for p in page_sequence if PAGES[p]["category"] == "money_movement"]

            if trading_pages:
                txn_type = random.choice(["stock_trade", "etf_trade", "mutual_fund_trade", "options_trade"])
                txn_amount = random.uniform(500, 50000) if customer.segment != "ultra_hnw" else random.uniform(10000, 500000)
                has_transaction = True
            elif money_pages:
                txn_type = random.choice(["deposit", "transfer_in", "transfer_out", "bill_pay"])
                txn_amount = random.uniform(100, 25000)
                has_transaction = True

            if has_transaction:
                transactions.append({
                    "transaction_id": str(uuid.uuid4())[:16],
                    "session_id": session_id,
                    "customer_id": customer.customer_id,
                    "transaction_timestamp": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "transaction_type": txn_type,
                    "amount_usd": round(txn_amount, 2),
                    "status": random.choices(["completed", "pending", "failed"], weights=[0.92, 0.05, 0.03], k=1)[0],
                })

        # A/B test assignment
        ab_variant = ""
        ab_test_id = ""
        for test in AB_TESTS:
            test_start = datetime.strptime(test["start_date"], "%Y-%m-%d")
            test_end = datetime.strptime(test["end_date"], "%Y-%m-%d")
            if test_start <= session_date <= test_end:
                # Deterministic assignment based on customer_id hash
                hash_val = int(hashlib.md5(f"{customer.customer_id}_{test['test_id']}".encode()).hexdigest(), 16)
                variant_idx = hash_val % len(test["variants"])
                ab_test_id = test["test_id"]
                ab_variant = test["variants"][variant_idx]
                break

        session = {
            "session_id": session_id,
            "customer_id": customer.customer_id,
            "session_start": session_date.strftime("%Y-%m-%d %H:%M:%S"),
            "session_date": session_date.strftime("%Y-%m-%d"),
            "session_month": session_date.strftime("%Y-%m"),
            "device_type": device,
            "browser": customer.preferred_browser if random.random() < 0.8 else weighted_choice(BROWSERS),
            "acquisition_channel": channel,
            "landing_page": landing_page,
            "pages_viewed": num_pages,
            "session_duration_seconds": total_time,
            "is_bounce": is_bounced,
            "max_funnel_stage": FUNNEL_STAGES[max_funnel_stage],
            "has_transaction": has_transaction,
            "ab_test_id": ab_test_id,
            "ab_variant": ab_variant,
            "customer_segment": customer.segment,
            "customer_region": customer.region,
        }
        sessions.append(session)

    logger.info(
        f"Generated {len(sessions)} sessions, {len(events)} events, {len(transactions)} transactions"
    )
    return sessions, events, transactions


def write_csv(data: list[dict], filepath: Path) -> None:
    if not data:
        logger.warning(f"No data to write for {filepath}")
        return
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    logger.info(f"Wrote {len(data)} rows to {filepath}")


def generate_ab_test_config(output_dir: Path) -> None:
    config_path = output_dir / "ab_tests.json"
    with open(config_path, "w") as f:
        json.dump(AB_TESTS, f, indent=2)
    logger.info(f"Wrote A/B test config to {config_path}")


def main() -> None:
    random.seed(SEED)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    customers = generate_customers(NUM_CUSTOMERS)
    write_csv([c.to_dict() for c in customers], OUTPUT_DIR / "customers.csv")

    sessions, events, transactions = generate_sessions(customers, NUM_SESSIONS)
    write_csv(sessions, OUTPUT_DIR / "sessions.csv")
    write_csv(events, OUTPUT_DIR / "events.csv")
    write_csv(transactions, OUTPUT_DIR / "transactions.csv")

    generate_ab_test_config(OUTPUT_DIR)

    # Summary stats
    logger.info("--- Data Generation Summary ---")
    logger.info(f"Customers:    {len(customers):,}")
    logger.info(f"Sessions:     {len(sessions):,}")
    logger.info(f"Events:       {len(events):,}")
    logger.info(f"Transactions: {len(transactions):,}")

    bounce_rate = sum(1 for s in sessions if s["is_bounce"]) / len(sessions)
    conv_rate = sum(1 for s in sessions if s["has_transaction"]) / len(sessions)
    logger.info(f"Bounce rate:  {bounce_rate:.1%}")
    logger.info(f"Txn rate:     {conv_rate:.1%}")


if __name__ == "__main__":
    main()
