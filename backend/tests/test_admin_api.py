def test_admin_auth_and_dashboard(client, admin_headers):
    # Test /api/auth/me
    me_res = client.get("/api/auth/me", headers=admin_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@amsterdamgroup.co.tz"

    # Test /api/admin/dashboard
    dash_res = client.get("/api/admin/dashboard", headers=admin_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "total_orders" in dash_data
    assert "total_revenue" in dash_data
    assert "low_stock_count" in dash_data
    assert dash_data["total_products"] >= 6


def test_admin_inventory_adjustment_with_audit(client, admin_headers):
    # Fetch a product
    products_res = client.get("/api/products")
    product = products_res.json()[0]
    initial_stock = product["stock_quantity"]

    # Manual stock addition
    adjust_payload = {
        "product_id": product["id"],
        "quantity_change": 50,
        "reason": "Shipment container arrived from factory"
    }
    adj_res = client.post("/api/admin/inventory/adjustments", json=adjust_payload, headers=admin_headers)
    assert adj_res.status_code == 201
    adj_data = adj_res.json()
    assert adj_data["quantity_change"] == 50
    assert adj_data["new_quantity"] == initial_stock + 50
    assert "Shipment container" in adj_data["reason"]

    # Verify inventory transactions log contains this audit entry
    tx_res = client.get(f"/api/admin/inventory/transactions?product_id={product['id']}", headers=admin_headers)
    assert tx_res.status_code == 200
    txs = tx_res.json()
    assert len(txs) >= 1
    assert any("Shipment container" in t["reason"] for t in txs)


def test_admin_order_status_update_and_cancellation_restock(client, admin_headers):
    # 1. Place an order
    product = client.get("/api/products").json()[0]
    initial_stock = product["stock_quantity"]

    order_payload = {
        "customer_name": "Hamisi Salum",
        "customer_phone": "+255 777 000 111",
        "customer_location": "Ilala, Dar es Salaam",
        "product_id": product["id"],
        "quantity": 2
    }
    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 201
    order_id = order_res.json()["id"]

    # Stock should be reduced by 2
    stock_after_order = client.get(f"/api/products/{product['id']}").json()["stock_quantity"]
    assert stock_after_order == initial_stock - 2

    # 2. Update status to CONFIRMED
    status_res = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers=admin_headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "CONFIRMED"

    # 3. Admin cancels order -> items should be restored to stock
    cancel_res = client.patch(
        f"/api/admin/orders/{order_id}/status",
        json={"status": "CANCELLED"},
        headers=admin_headers
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"

    # Verify stock restored
    stock_after_cancel = client.get(f"/api/products/{product['id']}").json()["stock_quantity"]
    assert stock_after_cancel == initial_stock


def test_admin_customers_directory(client, admin_headers):
    customers_res = client.get("/api/admin/customers", headers=admin_headers)
    assert customers_res.status_code == 200
    customers = customers_res.json()
    assert len(customers) >= 1
    
    first_customer_id = customers[0]["id"]
    detail_res = client.get(f"/api/admin/customers/{first_customer_id}", headers=admin_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "orders" in detail


def test_admin_product_wholesale_crud_and_invoice(client, admin_headers):
    # 1. Create product with retail and wholesale pricing
    create_payload = {
        "name": "Super Grower Electrolytes",
        "category": "Feed Grade Vitamins",
        "price": 30000.0,
        "retail_price": 30000.0,
        "wholesale_price": 24000.0,
        "wholesale_minimum_quantity": 12,
        "stock_quantity": 100,
        "low_stock_threshold": 10,
        "is_active": True,
        "is_coming_soon": False,
        "description": "Rapid rehydration formula.",
        "display_order": 99,
        "images": [
            {"image_url": "/vitamix-sample.jpg", "alt_text": "Sample Electrolyte", "is_primary": True}
        ]
    }
    create_res = client.post("/api/admin/products", json=create_payload, headers=admin_headers)
    assert create_res.status_code == 201
    created = create_res.json()
    assert float(created["retail_price"]) == 30000.0
    assert float(created["wholesale_price"]) == 24000.0
    assert created["wholesale_minimum_quantity"] == 12

    # 2. Update wholesale minimum and price
    update_res = client.put(
        f"/api/admin/products/{created['id']}",
        json={"wholesale_price": 23500.0, "wholesale_minimum_quantity": 15},
        headers=admin_headers
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert float(updated["wholesale_price"]) == 23500.0
    assert updated["wholesale_minimum_quantity"] == 15

    # 3. Customer places wholesale order for 15 units
    order_res = client.post("/api/orders", json={
        "customer_name": "Kibo Poultry Farm",
        "customer_phone": "+255 788 444 333",
        "customer_location": "Moshi Rural",
        "product_id": created["id"],
        "quantity": 15,
        "pricing_mode": "WHOLESALE"
    })
    assert order_res.status_code == 201
    order = order_res.json()
    assert order["pricing_mode"] == "WHOLESALE"
    assert float(order["total_amount"]) == 15 * 23500.0

    # 4. Admin views order invoice
    invoice_res = client.get(f"/api/admin/orders/{order['id']}/invoice", headers=admin_headers)
    assert invoice_res.status_code == 200
    inv = invoice_res.json()
    assert inv["pricing_mode"] == "WHOLESALE"
    assert float(inv["total_amount"]) == 15 * 23500.0
    assert inv["customer_name"] == "Kibo Poultry Farm"


def test_admin_product_instructions_add_and_edit(client, admin_headers):
    # 1. Create a product with instructions
    instructions_text = "1. Dissolve 1g per Litre of drinking water.\n2. Administer daily for 5 days.\n3. Discard leftover water after 24 hours."
    create_payload = {
        "name": "Chick Pro Vitality",
        "category": "Feed Grade Vitamins",
        "price": 22000.0,
        "retail_price": 22000.0,
        "wholesale_price": 18000.0,
        "wholesale_minimum_quantity": 10,
        "stock_quantity": 50,
        "low_stock_threshold": 5,
        "is_active": True,
        "is_coming_soon": False,
        "description": "Premium chick vitality powder.",
        "instructions": instructions_text,
        "display_order": 50,
        "images": [
            {"image_url": "/vitamix-sample.jpg", "alt_text": "Chick Pro", "is_primary": True}
        ]
    }
    create_res = client.post("/api/admin/products", json=create_payload, headers=admin_headers)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["instructions"] == instructions_text

    # 2. Verify public endpoint returns instructions as well
    pub_res = client.get(f"/api/products/{created['id']}")
    assert pub_res.status_code == 200
    assert pub_res.json()["instructions"] == instructions_text

    # 3. Edit instructions
    new_instructions = "1. Dissolve 2g per Litre of water.\n2. Store in a dry cool place."
    update_res = client.put(
        f"/api/admin/products/{created['id']}",
        json={"instructions": new_instructions},
        headers=admin_headers
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["instructions"] == new_instructions

    # 4. Verify public endpoint reflects edited instructions
    pub_res_updated = client.get(f"/api/products/{created['id']}")
    assert pub_res_updated.status_code == 200
    assert pub_res_updated.json()["instructions"] == new_instructions


def test_settings_api_and_whatsapp_number(client, admin_headers):
    # 1. Get initial public settings
    pub_res = client.get("/api/settings/public")
    assert pub_res.status_code == 200
    data = pub_res.json()
    assert "whatsapp_number" in data
    assert "whatsapp_display" in data

    # 2. Get admin settings
    admin_res = client.get("/api/admin/settings", headers=admin_headers)
    assert admin_res.status_code == 200
    assert admin_res.json()["whatsapp_number"] == data["whatsapp_number"]

    # 3. Update WhatsApp number via admin settings
    new_num = "0712345678"
    update_res = client.put(
        "/api/admin/settings",
        json={"whatsapp_number": new_num},
        headers=admin_headers
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    # It should sanitize 0712345678 to 255712345678
    assert updated_data["whatsapp_number"] == "255712345678"
    assert "+255 712 345 678" in updated_data["whatsapp_display"]

    # 4. Public endpoint should immediately reflect the change
    pub_check = client.get("/api/settings/public")
    assert pub_check.status_code == 200
    assert pub_check.json()["whatsapp_number"] == "255712345678"

    # 5. Place an order to verify that the WhatsApp URL uses the new number
    prod = client.get("/api/products").json()[0]
    order_payload = {
        "customer_name": "Settings Tester",
        "customer_phone": "0788111222",
        "customer_location": "Dar es Salaam",
        "product_id": prod["id"],
        "quantity": 1,
        "pricing_mode": "RETAIL"
    }
    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert "wa.me/255712345678" in order_data["whatsapp_url"]



