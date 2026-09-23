from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.system_setting import SystemSetting
from app.schemas.setting import PublicSettingsOut, AdminSettingsOut, AdminSettingsUpdate
from app.services.whatsapp_service import sanitize_phone_for_whatsapp
from app.core.config import settings as app_settings


public_router = APIRouter(prefix="/settings", tags=["Public Settings"])
admin_router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])


def _format_display_phone(raw_phone: str) -> str:
    clean = sanitize_phone_for_whatsapp(raw_phone)
    if clean.startswith("255") and len(clean) == 12:
        return f"+255 {clean[3:6]} {clean[6:9]} {clean[9:]}"
    elif clean.startswith("254") and len(clean) == 12:
        return f"+254 {clean[3:6]} {clean[6:9]} {clean[9:]}"
    return f"+{clean}" if clean else ""


def _get_whatsapp_number(db: Session) -> str:
    s = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
    return s.value if s and s.value else app_settings.WHATSAPP_NUMBER


@public_router.get("/public", response_model=PublicSettingsOut)
def get_public_settings(db: Session = Depends(get_db)):
    wa_num = _get_whatsapp_number(db)
    return PublicSettingsOut(
        whatsapp_number=wa_num,
        whatsapp_display=_format_display_phone(wa_num)
    )


@admin_router.get("", response_model=AdminSettingsOut)
def get_admin_settings(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    wa_num = _get_whatsapp_number(db)
    return AdminSettingsOut(
        whatsapp_number=wa_num,
        whatsapp_display=_format_display_phone(wa_num)
    )


@admin_router.put("", response_model=AdminSettingsOut)
def update_admin_settings(
    data: AdminSettingsUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    if data.whatsapp_number is not None:
        clean = sanitize_phone_for_whatsapp(data.whatsapp_number.strip())
        if not clean or len(clean) < 9:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid WhatsApp phone number. Please provide a valid phone number (e.g. 255651728851 or 0651728851)."
            )

        setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
        if not setting:
            setting = SystemSetting(
                key="whatsapp_number",
                value=clean,
                description="Official WhatsApp business recipient phone for orders"
            )
            db.add(setting)
        else:
            setting.value = clean

        db.commit()
        db.refresh(setting)

    wa_num = _get_whatsapp_number(db)
    return AdminSettingsOut(
        whatsapp_number=wa_num,
        whatsapp_display=_format_display_phone(wa_num)
    )
