import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST     = os.getenv("SMTP_HOST", "")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL    = os.getenv("FROM_EMAIL", SMTP_USER)

_CARD = """
  max-width:480px;margin:40px auto;background:#2a2a2a;
  border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.1);
"""
_BODY = "font-family:Arial,sans-serif;background:#1E1E1E;margin:0;padding:0;"
_FOOTER = """<p style="color:#A1A1AA;font-size:11px;text-align:center;margin:0;line-height:1.6;">
  Para alterar ou desativar este lembrete, acesse Configurações no app.
</p>"""


def send_email(to: str, subject: str, html: str) -> bool:
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD]):
        print(f"[Email] SMTP não configurado — pulando envio para {to}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"SobrePressão <{FROM_EMAIL}>"
    msg["To"]      = to
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to, msg.as_string())
        print(f"[Email] Enviado para {to}: {subject}")
        return True
    except Exception as e:
        print(f"[Email] Erro ao enviar para {to}: {e}")
        return False


def email_pressure_deadline(to: str, name: str, deadline: str) -> bool:
    """Enviado quando o usuário não aferiu a pressão até o horário limite."""
    html = f"""<!DOCTYPE html><html lang="pt-BR">
<body style="{_BODY}">
  <div style="{_CARD}">
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">❤️</div>
      <h1 style="color:#FF9F1C;font-size:21px;margin:12px 0 4px;">Você ainda não aferiu sua pressão hoje!</h1>
      <p style="color:#A1A1AA;font-size:13px;margin:0;">Lembrete — horário limite: {deadline}</p>
    </div>
    <p style="color:#fff;font-size:14px;line-height:1.7;margin:0 0 16px;">
      Olá, <strong>{name}</strong>! Passamos das {deadline} e ainda não identificamos uma medição sua hoje.
      Leva menos de 1 minuto — faça agora e mantenha seu histórico em dia! 💪
    </p>
    <div style="background:rgba(255,159,28,0.12);border:1px solid rgba(255,159,28,0.3);border-radius:12px;padding:14px 16px;margin-bottom:20px;">
      <p style="color:#A1A1AA;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Dica para medir corretamente</p>
      <ul style="color:#fff;font-size:12px;margin:0;padding-left:18px;line-height:1.9;">
        <li>Fique sentado e descanse 5 minutos antes</li>
        <li>Não fale durante a medição</li>
        <li>Meça no mesmo braço sempre que possível</li>
      </ul>
    </div>
    {_FOOTER}
  </div>
</body></html>"""
    return send_email(to, "❤️ Lembrete: você ainda não aferiu sua pressão hoje!", html)


def email_daily_reminder(to: str, name: str) -> bool:
    """Lembrete proativo (sem checar se já mediu) — mantido para compatibilidade."""
    return email_pressure_deadline(to, name, "hoje")


def email_medication_reminder(to: str, med_name: str, dosage: str | None, time: str) -> bool:
    dosage_line = f"<p style='color:#A1A1AA;font-size:13px;margin:4px 0 0'>{dosage}</p>" if dosage else ""
    html = f"""<!DOCTYPE html><html lang="pt-BR">
<body style="{_BODY}">
  <div style="{_CARD}">
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">💊</div>
      <h1 style="color:#FF9F1C;font-size:21px;margin:12px 0 4px;">Hora do remédio!</h1>
      <p style="color:#A1A1AA;font-size:13px;margin:0;">Lembrete automático — {time}</p>
    </div>
    <div style="background:rgba(255,159,28,0.12);border:1px solid rgba(255,159,28,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
      <p style="font-size:20px;font-weight:700;color:#fff;margin:0;">{med_name}</p>
      {dosage_line}
    </div>
    <p style="color:#A1A1AA;font-size:12px;text-align:center;margin:0 0 12px;line-height:1.6;">
      Abra o app para registrar que tomou o medicamento.
    </p>
    {_FOOTER}
  </div>
</body></html>"""
    return send_email(to, f"💊 Hora do {med_name} — {time}", html)


def email_password_reset(to: str, reset_link: str) -> bool:
    html = f"""<!DOCTYPE html><html lang="pt-BR">
<body style="{_BODY}">
  <div style="{_CARD}">
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">🔐</div>
      <h1 style="color:#FF9F1C;font-size:21px;margin:12px 0 4px;">Redefinir senha</h1>
      <p style="color:#A1A1AA;font-size:13px;margin:0;">Você solicitou a redefinição de senha</p>
    </div>
    <p style="color:#fff;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.
    </p>
    <div style="text-align:center;margin-bottom:20px;">
      <a href="{reset_link}" style="background:#FF9F1C;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;">
        Redefinir minha senha
      </a>
    </div>
    <p style="color:#A1A1AA;font-size:12px;text-align:center;margin:0;line-height:1.6;">
      Se você não solicitou isso, ignore este e-mail com segurança. O link expira em 1 hora.
    </p>
  </div>
</body></html>"""
    return send_email(to, "🔐 Redefinição de senha — SobrePressão", html)
