"""Tests for digital customer analytics pipeline."""

import json
from pathlib import Path

import pandas as pd
import pytest

DATA_DIR = Path(__file__).parent.parent / "data"


@pytest.fixture
def customers():
    return pd.read_csv(DATA_DIR / "customers.csv")


@pytest.fixture
def sessions():
    return pd.read_csv(DATA_DIR / "sessions.csv")


@pytest.fixture
def events():
    return pd.read_csv(DATA_DIR / "events.csv")


@pytest.fixture
def transactions():
    return pd.read_csv(DATA_DIR / "transactions.csv")


@pytest.fixture
def analytics_results():
    with open(DATA_DIR / "analytics_results.json") as f:
        return json.load(f)


class TestDataGeneration:
    def test_customer_count(self, customers):
        assert len(customers) == 12_000

    def test_session_count(self, sessions):
        assert len(sessions) == 180_000

    def test_customer_segments(self, customers):
        segments = set(customers["segment"].unique())
        expected = {"mass_market", "mass_affluent", "high_net_worth", "ultra_hnw"}
        assert segments == expected

    def test_no_null_customer_ids(self, customers):
        assert customers["customer_id"].notna().all()

    def test_no_null_session_ids(self, sessions):
        assert sessions["session_id"].notna().all()

    def test_session_customer_ids_exist(self, sessions, customers):
        valid_ids = set(customers["customer_id"])
        session_ids = set(sessions["customer_id"])
        assert session_ids.issubset(valid_ids)

    def test_event_session_ids_exist(self, events, sessions):
        valid_ids = set(sessions["session_id"])
        event_ids = set(events["session_id"])
        assert event_ids.issubset(valid_ids)

    def test_transaction_session_ids_exist(self, transactions, sessions):
        valid_ids = set(sessions["session_id"])
        txn_ids = set(transactions["session_id"])
        assert txn_ids.issubset(valid_ids)

    def test_bounce_rate_reasonable(self, sessions):
        bounce_rate = sessions["is_bounce"].mean()
        assert 0.05 < bounce_rate < 0.40

    def test_aum_positive(self, customers):
        assert (customers["aum_usd"] > 0).all()

    def test_funnel_stages_valid(self, sessions):
        valid_stages = {"session_start", "feature_browse", "feature_engage", "action_initiate", "action_complete"}
        assert set(sessions["max_funnel_stage"].unique()).issubset(valid_stages)


class TestAnalytics:
    def test_funnel_monotonically_decreasing(self, analytics_results):
        funnel = analytics_results["funnel_overall"]
        counts = [f["count"] for f in funnel]
        for i in range(1, len(counts)):
            assert counts[i] <= counts[i - 1], f"Funnel not monotonic at stage {i}"

    def test_funnel_starts_at_total_sessions(self, analytics_results):
        funnel = analytics_results["funnel_overall"]
        assert funnel[0]["count"] == analytics_results["summary"]["total_sessions"]

    def test_channel_metrics_sum_to_total(self, analytics_results):
        channels = analytics_results["channel_metrics"]
        total = sum(c["total_sessions"] for c in channels)
        assert total == analytics_results["summary"]["total_sessions"]

    def test_segment_behavior_covers_all_segments(self, analytics_results):
        segments = {s["segment"] for s in analytics_results["segment_behavior"]}
        expected = {"mass_market", "mass_affluent", "high_net_worth", "ultra_hnw"}
        assert segments == expected

    def test_ab_test_results_have_significance(self, analytics_results):
        for test in analytics_results["ab_test_results"]:
            assert test["significance"] is not None
            assert "p_value" in test["significance"]
            assert 0 <= test["significance"]["p_value"] <= 1

    def test_monthly_trends_12_months(self, analytics_results):
        assert len(analytics_results["monthly_trends"]) == 12

    def test_summary_metrics_positive(self, analytics_results):
        s = analytics_results["summary"]
        assert s["total_customers"] > 0
        assert s["total_sessions"] > 0
        assert s["overall_bounce_rate"] > 0
        assert s["avg_session_duration"] > 0

    def test_no_negative_conversion_rates(self, analytics_results):
        for seg in analytics_results["segment_behavior"]:
            assert seg["conversion_rate"] >= 0
        for ch in analytics_results["channel_metrics"]:
            assert ch["conversion_rate"] >= 0
