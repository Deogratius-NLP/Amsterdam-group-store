import urllib.parse
import re
from app.core.config import settings


def sanitize_phone_for_whatsapp(phone: str) -> str:
    """
    Sanitizes phone number into international E.164 digits without '+' or symbols.
    For Tanzania (starts with 07 or 06), converts to 255...
    """
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("0") and len(digits) == 10:
        digits = "255" + digits[1:]
    return digits


def format_tsh_amount(amount) -> str:
    try:
        return f"TSh {int(amount):,}"
    except (ValueError, TypeError):
        return f"TSh {amount}"


def build_whatsapp_order_message(
    order_number: str,
    total_amount: float,
    customer_name: str,
    customer_phone: str,
    customer_location: str,
    pricing_mode: str = "RETAIL",
    product_name: str = None,
    quantity: int = None,
    unit_price: float = None,
    items: list = None,
    wa_number: str = None
) -> tuple[str, str]:
    """
    Returns: (plain_message, whatsapp_url)
    Supports either single item (product_name, quantity, unit_price) or multiple items (items list of dicts).
    """
    total_formatted = format_tsh_amount(total_amount)
    mode_title = "Wholesale" if (pricing_mode or "").upper() == "WHOLESALE" else "Retail"
    
    if items and len(items) > 0:
        item_lines = []
        for it in items:
            p_name = it.get("name") or it.get("product_name") or it.get("product_name_snapshot", "Product")
            qty = it.get("quantity", 1)
            u_price = format_tsh_amount(it.get("unit_price", 0))
            item_lines.append(f"• {p_name} × {qty} — {u_price}")
        items_block = "\n".join(item_lines)
    else:
        unit_price_formatted = format_tsh_amount(unit_price or 0)
        items_block = f"{product_name} × {quantity} — {unit_price_formatted}"
    
    message = (
        f"Hello Amsterdam Group,\n\n"
        f"I would like to place an order.\n\n"
        f"Order: {order_number}\n"
        f"Type: {mode_title}\n\n"
        f"Customer:\n"
        f"{customer_name}\n\n"
        f"Phone:\n"
        f"{customer_phone}\n\n"
        f"Location:\n"
        f"{customer_location}\n\n"
        f"Items:\n"
        f"{items_block}\n\n"
        f"Total:\n"
        f"{total_formatted}\n\n"
        f"Please confirm my order.\n\n"
        f"Thank you."
    )

    target_number = wa_number if wa_number else settings.WHATSAPP_NUMBER
    clean_wa_number = sanitize_phone_for_whatsapp(target_number)
    encoded_text = urllib.parse.quote(message)
    whatsapp_url = f"https://wa.me/{clean_wa_number}?text={encoded_text}"
    
    return message, whatsapp_url
