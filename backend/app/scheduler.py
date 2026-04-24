from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .database import SessionLocal
from . import models
from .email_utils import email_medication_reminder, email_pressure_deadline, email_daily_reminder

BR_TZ = ZoneInfo("America/Sao_Paulo")
scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")


def _today_start_utc() -> datetime:
    """Retorna meia-noite de hoje no horário de Brasília, convertido para UTC."""
    now_br = datetime.now(BR_TZ)
    start_br = now_br.replace(hour=0, minute=0, second=0, microsecond=0)
    return start_br.astimezone(timezone.utc)


def _check_reminders():
    current_time = datetime.now(BR_TZ).strftime("%H:00")
    today_start  = _today_start_utc()

    db = SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.is_premium == True).all()

        for user in users:
            name = user.email.split("@")[0]

            # ── Lembrete de pressão (deadline) ───────────────────────────────
            # Envia somente se o usuário NÃO aferiu a pressão ainda hoje
            if user.reminder_time and user.reminder_time == current_time:
                mediu_hoje = db.query(models.Measurement).filter(
                    models.Measurement.user_id == user.id,
                    models.Measurement.measured_at >= today_start,
                ).count() > 0

                if not mediu_hoje:
                    email_pressure_deadline(user.email, name, current_time)

            # ── Lembretes de medicamentos ─────────────────────────────────────
            if not user.med_reminder_enabled:
                continue

            active_meds = [m for m in user.medications if m.active]
            for med in active_meds:
                times = [t.strip() for t in med.times.split(",") if t.strip()]
                if current_time in times:
                    email_medication_reminder(user.email, med.name, med.dosage, current_time)

    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(_check_reminders, "cron", minute=0)
    scheduler.start()
    print("[Scheduler] Iniciado — verificando lembretes a cada hora")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Encerrado")
