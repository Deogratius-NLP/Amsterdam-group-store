from typing import Optional
from pydantic import BaseModel


class PublicSettingsOut(BaseModel):
    whatsapp_number: str
    whatsapp_display: str


class AdminSettingsOut(BaseModel):
    whatsapp_number: str
    whatsapp_display: str


class AdminSettingsUpdate(BaseModel):
    whatsapp_number: Optional[str] = None
