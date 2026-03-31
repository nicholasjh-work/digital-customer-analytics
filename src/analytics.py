"""
Analytics engine for digital customer behavior insights.

Computes the exact types of analyses the Fidelity CKSI Director role
requires: funnel analysis, behavioral cohorts, A/B test evaluation,
channel attribution, and customer segmentation insights.
"""

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pandas as pd
import numpy as np
from scipy import stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"


def load_data() -> dict[str, pd.DataFrame]:
    logger.info("Loading datasets...")
    customers = pd.read_csv(DATA_DIR / "customers.csv")
    sessions = pd.read_csv(DATA_DIR / "sessions.csv")
    events = pd.read_csv(DATA_DIR / "events.csv")
    transactions = pd.read_csv(DATA_DIR / "transactions.csv")

    sessions["session_start"] = pd.to_datetime(sessions["session_start"])
    sessions["session_date"] = pd.to_datetime(sessions["session_date"])
    events["event_timestamp"] = pd.to_datetime(events["event_timestamp"])
    transactions["transaction_timestamp"] = pd.to_datetime(transactions["transaction_timestamp"])

    logger.info(
        f"Loaded: {len(customers)} customers, {len(sessions)} sessions, "
        f"{len(events)} events, {len(transactions)} transactions"
    )
    return {
        "customers": customers,
        "sessions": sessions,
        "events": events,
        "transactions": transactions,
    }


# --- Funnel Analysis ---

FUNNEL_ORDER = [
    "session_start",
    "feature_browse",
    "feature_engage",
    "action_initiate",
    "action_complete",
]
FUNNEL_LABELS = [
    "Session Start",
    "Feature Browse",
    "Feature Engage",
    "Action Initiate",
    "Action Complete",
]


def compute_funnel(sessions: pd.DataFrame, group_col: str | None = None) -> pd.DataFrame:
    """Compute conversion funnel with optional grouping."""
    stage_map = {s: i for i, s in enumerate(FUNNEL_ORDER)}
    sessions = sessions.copy()
    sessions["stage_idx"] = sessions["max_funnel_stage"].map(stage_map)

    def _funnel_for_group(df: pd.DataFrame) -> list[dict]:
        total = len(df)
        rows = []
        for i, (stage, label) in enumerate(zip(FUNNEL_ORDER, FUNNEL_LABELS)):
            count = (df["stage_idx"] >= i).sum()
            rows.append({
                "stage": stage,
                "label": label,
                "count": int(count),
                "pct_of_total": round(count / total * 100, 1) if total > 0 else 0,
                "stage_conversion": round(count / rows[-1]["count"] * 100, 1) if i > 0 and rows[-1]["count"] > 0 else 100.0,
            })
        return rows

    if group_col:
        results = []
        for group_val, group_df in sessions.groupby(group_col):
            funnel_rows = _funnel_for_group(group_df)
            for row in funnel_rows:
                row[group_col] = group_val
            results.extend(funnel_rows)
        return pd.DataFrame(results)

    return pd.DataFrame(_funnel_for_group(sessions))


# --- Channel Attribution ---

def compute_channel_metrics(sessions: pd.DataFrame) -> pd.DataFrame:
    """Attribution metrics by acquisition channel."""
    metrics = sessions.groupby("acquisition_channel").agg(
        total_sessions=("session_id", "count"),
        avg_pages=("pages_viewed", "mean"),
        avg_duration=("session_duration_seconds", "mean"),
        bounce_rate=("is_bounce", "mean"),
        conversion_rate=("has_transaction", "mean"),
    ).reset_index()

    metrics["avg_pages"] = metrics["avg_pages"].round(1)
    metrics["avg_duration"] = metrics["avg_duration"].round(0).astype(int)
    metrics["bounce_rate"] = (metrics["bounce_rate"] * 100).round(1)
    metrics["conversion_rate"] = (metrics["conversion_rate"] * 100).round(2)
    metrics["session_share_pct"] = (metrics["total_sessions"] / metrics["total_sessions"].sum() * 100).round(1)

    return metrics.sort_values("total_sessions", ascending=False)


# --- Segment Behavior Analysis ---

def compute_segment_behavior(
    sessions: pd.DataFrame, customers: pd.DataFrame
) -> pd.DataFrame:
    """Behavioral metrics by customer segment."""
    merged = sessions.merge(
        customers[["customer_id", "segment", "aum_usd", "digital_propensity_score"]],
        on="customer_id",
        how="left",
        suffixes=("", "_cust"),
    )

    # Use the customer-level segment column (from customers df)
    seg_col = "segment" if "segment" in merged.columns else "customer_segment"

    metrics = merged.groupby(seg_col).agg(
        total_sessions=("session_id", "count"),
        unique_customers=("customer_id", "nunique"),
        avg_pages=("pages_viewed", "mean"),
        avg_duration=("session_duration_seconds", "mean"),
        bounce_rate=("is_bounce", "mean"),
        conversion_rate=("has_transaction", "mean"),
        avg_aum=("aum_usd", "mean"),
        avg_propensity=("digital_propensity_score", "mean"),
    ).reset_index()

    metrics.rename(columns={seg_col: "segment"}, inplace=True)
    metrics["sessions_per_customer"] = (metrics["total_sessions"] / metrics["unique_customers"]).round(1)
    metrics["avg_pages"] = metrics["avg_pages"].round(1)
    metrics["avg_duration"] = metrics["avg_duration"].round(0).astype(int)
    metrics["bounce_rate"] = (metrics["bounce_rate"] * 100).round(1)
    metrics["conversion_rate"] = (metrics["conversion_rate"] * 100).round(2)
    metrics["avg_aum"] = metrics["avg_aum"].round(0).astype(int)
    metrics["avg_propensity"] = metrics["avg_propensity"].round(3)

    return metrics


# --- Page Engagement Heatmap ---

def compute_page_engagement(events: pd.DataFrame, sessions: pd.DataFrame) -> pd.DataFrame:
    """Page-level engagement metrics."""
    merged = events.merge(
        sessions[["session_id", "customer_segment"]],
        on="session_id",
        how="left",
    )

    metrics = merged.groupby(["page_category", "page_name"]).agg(
        total_views=("event_id", "count"),
        avg_time_seconds=("time_on_page_seconds", "mean"),
        median_time_seconds=("time_on_page_seconds", "median"),
        landing_count=("is_landing_page", "sum"),
        exit_count=("is_exit_page", "sum"),
    ).reset_index()

    metrics["avg_time_seconds"] = metrics["avg_time_seconds"].round(1)
    metrics["median_time_seconds"] = metrics["median_time_seconds"].round(1)
    metrics["exit_rate"] = (metrics["exit_count"] / metrics["total_views"] * 100).round(1)
    metrics["landing_rate"] = (metrics["landing_count"] / metrics["total_views"] * 100).round(1)

    return metrics.sort_values("total_views", ascending=False)


# --- A/B Test Results ---

def compute_ab_test_results(sessions: pd.DataFrame, events: pd.DataFrame) -> list[dict]:
    """Statistical evaluation of A/B tests."""
    with open(DATA_DIR / "ab_tests.json") as f:
        tests = json.load(f)

    results = []
    for test in tests:
        test_sessions = sessions[sessions["ab_test_id"] == test["test_id"]].copy()
        if test_sessions.empty:
            continue

        variants = {}
        for variant_name, variant_df in test_sessions.groupby("ab_variant"):
            variants[variant_name] = {
                "sessions": len(variant_df),
                "avg_pages": round(variant_df["pages_viewed"].mean(), 2),
                "avg_duration": round(variant_df["session_duration_seconds"].mean(), 1),
                "bounce_rate": round(variant_df["is_bounce"].mean() * 100, 1),
                "conversion_rate": round(variant_df["has_transaction"].mean() * 100, 3),
            }

        # Statistical significance (control vs first variant)
        control_data = test_sessions[test_sessions["ab_variant"] == "control"]
        variant_a_data = test_sessions[test_sessions["ab_variant"] == "variant_a"]

        sig_test = None
        if len(control_data) > 30 and len(variant_a_data) > 30:
            t_stat, p_value = stats.ttest_ind(
                control_data["session_duration_seconds"],
                variant_a_data["session_duration_seconds"],
            )
            sig_test = {
                "metric": "session_duration_seconds",
                "t_statistic": round(float(t_stat), 3),
                "p_value": round(float(p_value), 4),
                "significant_at_95": p_value < 0.05,
                "control_mean": round(float(control_data["session_duration_seconds"].mean()), 1),
                "variant_a_mean": round(float(variant_a_data["session_duration_seconds"].mean()), 1),
                "lift_pct": round(
                    (variant_a_data["session_duration_seconds"].mean() - control_data["session_duration_seconds"].mean())
                    / control_data["session_duration_seconds"].mean() * 100,
                    2,
                ),
            }

        results.append({
            "test_id": test["test_id"],
            "name": test["name"],
            "description": test["description"],
            "date_range": f"{test['start_date']} to {test['end_date']}",
            "total_sessions": len(test_sessions),
            "variants": variants,
            "significance": sig_test,
        })

    return results


# --- Monthly Trends ---

def compute_monthly_trends(sessions: pd.DataFrame) -> pd.DataFrame:
    """Monthly KPI trends."""
    sessions = sessions.copy()
    monthly = sessions.groupby("session_month").agg(
        total_sessions=("session_id", "count"),
        unique_customers=("customer_id", "nunique"),
        avg_pages=("pages_viewed", "mean"),
        avg_duration=("session_duration_seconds", "mean"),
        bounce_rate=("is_bounce", "mean"),
        conversion_rate=("has_transaction", "mean"),
        transactions=("has_transaction", "sum"),
    ).reset_index()

    monthly["avg_pages"] = monthly["avg_pages"].round(1)
    monthly["avg_duration"] = monthly["avg_duration"].round(0).astype(int)
    monthly["bounce_rate"] = (monthly["bounce_rate"] * 100).round(1)
    monthly["conversion_rate"] = (monthly["conversion_rate"] * 100).round(2)
    monthly["sessions_per_customer"] = (monthly["total_sessions"] / monthly["unique_customers"]).round(1)

    return monthly.sort_values("session_month")


# --- Cohort Retention ---

def compute_cohort_retention(sessions: pd.DataFrame) -> pd.DataFrame:
    """Monthly cohort retention analysis."""
    sessions = sessions.copy()
    sessions["month"] = sessions["session_date"].dt.to_period("M")

    first_month = sessions.groupby("customer_id")["month"].min().reset_index()
    first_month.columns = ["customer_id", "cohort_month"]

    merged = sessions.merge(first_month, on="customer_id")
    merged["months_since_first"] = (
        merged["month"].astype(int) - merged["cohort_month"].astype(int)
    )

    cohort_sizes = merged.groupby("cohort_month")["customer_id"].nunique().reset_index()
    cohort_sizes.columns = ["cohort_month", "cohort_size"]

    retention = merged.groupby(["cohort_month", "months_since_first"])["customer_id"].nunique().reset_index()
    retention.columns = ["cohort_month", "months_since_first", "active_customers"]
    retention = retention.merge(cohort_sizes, on="cohort_month")
    retention["retention_rate"] = (retention["active_customers"] / retention["cohort_size"] * 100).round(1)
    retention["cohort_month"] = retention["cohort_month"].astype(str)

    return retention


# --- Device/Region Breakdown ---

def compute_device_breakdown(sessions: pd.DataFrame) -> pd.DataFrame:
    return sessions.groupby("device_type").agg(
        sessions=("session_id", "count"),
        avg_duration=("session_duration_seconds", "mean"),
        bounce_rate=("is_bounce", "mean"),
        conversion_rate=("has_transaction", "mean"),
    ).reset_index().assign(
        avg_duration=lambda x: x["avg_duration"].round(0).astype(int),
        bounce_rate=lambda x: (x["bounce_rate"] * 100).round(1),
        conversion_rate=lambda x: (x["conversion_rate"] * 100).round(2),
        share_pct=lambda x: (x["sessions"] / x["sessions"].sum() * 100).round(1),
    )


def compute_region_breakdown(sessions: pd.DataFrame) -> pd.DataFrame:
    return sessions.groupby("customer_region").agg(
        sessions=("session_id", "count"),
        unique_customers=("customer_id", "nunique"),
        avg_duration=("session_duration_seconds", "mean"),
        conversion_rate=("has_transaction", "mean"),
    ).reset_index().assign(
        avg_duration=lambda x: x["avg_duration"].round(0).astype(int),
        conversion_rate=lambda x: (x["conversion_rate"] * 100).round(2),
    )


# --- Export All Analytics ---

def run_all_analytics() -> dict[str, Any]:
    """Run complete analytics pipeline and return results dict."""
    data = load_data()

    results = {
        "funnel_overall": compute_funnel(data["sessions"]).to_dict(orient="records"),
        "funnel_by_segment": compute_funnel(data["sessions"], "customer_segment").to_dict(orient="records"),
        "funnel_by_channel": compute_funnel(data["sessions"], "acquisition_channel").to_dict(orient="records"),
        "funnel_by_device": compute_funnel(data["sessions"], "device_type").to_dict(orient="records"),
        "channel_metrics": compute_channel_metrics(data["sessions"]).to_dict(orient="records"),
        "segment_behavior": compute_segment_behavior(data["sessions"], data["customers"]).to_dict(orient="records"),
        "page_engagement": compute_page_engagement(data["events"], data["sessions"]).to_dict(orient="records"),
        "ab_test_results": compute_ab_test_results(data["sessions"], data["events"]),
        "monthly_trends": compute_monthly_trends(data["sessions"]).to_dict(orient="records"),
        "cohort_retention": compute_cohort_retention(data["sessions"]).to_dict(orient="records"),
        "device_breakdown": compute_device_breakdown(data["sessions"]).to_dict(orient="records"),
        "region_breakdown": compute_region_breakdown(data["sessions"]).to_dict(orient="records"),
    }

    # Summary stats
    results["summary"] = {
        "total_customers": int(data["customers"].shape[0]),
        "total_sessions": int(data["sessions"].shape[0]),
        "total_events": int(data["events"].shape[0]),
        "total_transactions": int(data["transactions"].shape[0]),
        "overall_bounce_rate": round(data["sessions"]["is_bounce"].mean() * 100, 1),
        "overall_conversion_rate": round(data["sessions"]["has_transaction"].mean() * 100, 2),
        "avg_session_duration": int(data["sessions"]["session_duration_seconds"].mean()),
        "avg_pages_per_session": round(data["sessions"]["pages_viewed"].mean(), 1),
        "date_range": f"{data['sessions']['session_date'].min().strftime('%Y-%m-%d')} to {data['sessions']['session_date'].max().strftime('%Y-%m-%d')}",
    }

    return results


def export_analytics_json(output_path: Path | None = None) -> Path:
    """Run analytics and export to JSON for dashboard consumption."""
    results = run_all_analytics()
    output = output_path or DATA_DIR / "analytics_results.json"
    with open(output, "w") as f:
        json.dump(results, f, indent=2, default=str)
    logger.info(f"Exported analytics to {output}")
    return output


if __name__ == "__main__":
    export_analytics_json()
