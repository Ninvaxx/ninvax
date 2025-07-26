import bot.brain.scheduler as scheduler
from datetime import datetime, timedelta
from unittest.mock import patch


def test_scheduler_due():
    base = datetime(2024, 1, 1, 0, 0, 0)
    with patch.object(scheduler, "datetime") as mock_datetime:
        mock_datetime.utcnow.return_value = base
        sched = scheduler.Scheduler({"job": {"interval": 60}})

        mock_datetime.utcnow.return_value = base
        assert sched.due() == ["job"]

        mock_datetime.utcnow.return_value = base + timedelta(seconds=30)
        assert sched.due() == []

        mock_datetime.utcnow.return_value = base + timedelta(seconds=60)
        assert sched.due() == ["job"]
