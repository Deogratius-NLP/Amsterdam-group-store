def test_successful_customer_order_flow(client):
    # 1. Fetch Vitamix Plus
    res = client.get("/api/products?search=Vitamix")
    assert res.status_code == 200
    vitamix = res.json()[0]
    initial_stock = vitamix["stock_quantity"]
    assert initial_stock >= 10

    # 2. Place Order for 3 units
    order_payload = {
        "customer_name": "Juma Bakari",
        "customer_phone": "+255 754 123 456",
        "customer_location": "Kinondoni, Dar es Salaam",
        "product_id": vitamix["id"],
        "quantity": 3
    }

    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()

    # Check order details
    assert order_data["order_number"].startswith("AMG-")
    assert order_data["customer_name"] == "Juma Bakari"
    assert order_data["customer_location"] == "Kinondoni, Dar es Salaam"
    assert order_data["status"] == "PENDING"
    assert float(order_data["total_amount"]) == 3 * float(vitamix["price"])

    # Check WhatsApp payload
    assert "whatsapp_url" in order_data
    assert "https://wa.me/" in order_data["whatsapp_url"]
    assert "Hello Amsterdam Group" in order_data["whatsapp_message"]
    assert order_data["order_number"] in order_data["whatsapp_message"]
    assert "Kinondoni, Dar es Salaam" in order_data["whatsapp_message"]

    # 3. Verify Stock Decreased Immediately
    updated_res = client.get(f"/api/products/{vitamix['id']}")
    assert updated_res.status_code == 200
    updated_stock = updated_res.json()["stock_quantity"]
    assert updated_stock == initial_stock - 3


def test_order_rejection_on_insufficient_stock(client):
    # Fetch a product
    res = client.get("/api/products")
    product = res.json()[0]
    current_stock = product["stock_quantity"]

    # Attempt to order more than available stock
    excess_qty = current_stock + 50
    order_payload = {
        "customer_name": "Fatma Ally",
        "customer_phone": "+255 712 999 888",
        "customer_location": "Mbezi Beach, Dar es Salaam",
        "product_id": product["id"],
        "quantity": excess_qty
    }

    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 400
    error_detail = order_res.json()["detail"]
    assert "Insufficient inventory" in error_detail

    # Verify stock was untouched
    verify_res = client.get(f"/api/products/{product['id']}")
    assert verify_res.json()["stock_quantity"] == current_stock


def test_cannot_order_coming_soon_product(client):
    res = client.get("/api/products?coming_soon=true")
    coming_soon_item = res.json()[0]

    order_payload = {
        "customer_name": "Amina Said",
        "customer_phone": "+255 688 111 222",
        "customer_location": "Arusha City",
        "product_id": coming_soon_item["id"],
        "quantity": 1
    }

    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 400
    assert "Coming Soon" in order_res.json()["detail"]


def test_wholesale_order_success_and_invoice(client):
    # 1. Fetch Vitamix Plus
    res = client.get("/api/products?search=Vitamix")
    assert res.status_code == 200
    product = res.json()[0]
    initial_stock = product["stock_quantity"]
    min_qty = product["wholesale_minimum_quantity"]
    assert min_qty >= 10
    wholesale_price = float(product["wholesale_price"])
    assert wholesale_price > 0

    # 2. Place Wholesale Order for 15 units (>= min_qty)
    order_payload = {
        "customer_name": "Tanzania Agro Supplies",
        "customer_phone": "+255 754 888 777",
        "customer_location": "Ilala, Dar es Salaam",
        "product_id": product["id"],
        "quantity": 15,
        "pricing_mode": "WHOLESALE"
    }

    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()

    # Check wholesale fields
    assert order_data["pricing_mode"] == "WHOLESALE"
    assert float(order_data["total_amount"]) == 15 * wholesale_price
    assert "Type: Wholesale" in order_data["whatsapp_message"]

    # 3. Check Stock Decreased from Single Shared Pool
    updated_res = client.get(f"/api/products/{product['id']}")
    assert updated_res.json()["stock_quantity"] == initial_stock - 15

    # 4. Fetch Invoice by Order Number
    invoice_res = client.get(f"/api/orders/{order_data['order_number']}/invoice")
    assert invoice_res.status_code == 200
    inv = invoice_res.json()
    assert inv["order_number"] == order_data["order_number"]
    assert inv["pricing_mode"] == "WHOLESALE"
    assert inv["customer_name"] == "Tanzania Agro Supplies"
    assert float(inv["total_amount"]) == 15 * wholesale_price
    assert len(inv["items"]) == 1
    assert float(inv["items"][0]["unit_price"]) == wholesale_price
    assert inv["items"][0]["quantity"] == 15


def test_wholesale_order_rejected_below_minimum(client):
    res = client.get("/api/products?search=Vitamix")
    product = res.json()[0]
    min_qty = product["wholesale_minimum_quantity"]
    assert min_qty >= 10

    # Order below wholesale minimum
    order_payload = {
        "customer_name": "Retailer Shop",
        "customer_phone": "+255 754 111 222",
        "customer_location": "Morogoro Town",
        "product_id": product["id"],
        "quantity": min_qty - 1,
        "pricing_mode": "WHOLESALE"
    }

    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 400
    detail = order_res.json()["detail"]
    assert f"Wholesale orders require a minimum of {min_qty} units" in detail


def test_multi_item_cart_order_success(client):
    # Fetch active products
    res = client.get("/api/products")
    assert res.status_code == 200
    products = [p for p in res.json() if p.get("stock_quantity", 0) >= 15]
    assert len(products) >= 2
    p1 = products[0]
    p2 = products[1]

    p1_initial_stock = p1["stock_quantity"]
    p2_initial_stock = p2["stock_quantity"]

    # Place multi-item cart order
    order_payload = {
        "customer_name": "Amina Multi-Buyer",
        "customer_phone": "+255 777 654 321",
        "customer_location": "Mikocheni, Dar es Salaam",
        "customer_notes": "Deliver all items together please",
        "pricing_mode": "RETAIL",
        "items": [
            {"product_id": p1["id"], "quantity": 2, "pricing_mode": "RETAIL"},
            {"product_id": p2["id"], "quantity": 3, "pricing_mode": "RETAIL"}
        ]
    }

    order_res = client.post("/api/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()

    assert order_data["order_number"].startswith("AMG-")
    assert order_data["customer_name"] == "Amina Multi-Buyer"
    assert len(order_data["items"]) == 2

    expected_total = (2 * float(p1["price"])) + (3 * float(p2["price"]))
    assert float(order_data["total_amount"]) == expected_total

    # Verify WhatsApp message contains both items
    assert p1["name"] in order_data["whatsapp_message"]
    assert p2["name"] in order_data["whatsapp_message"]

    # Verify inventory was decremented for both products
    p1_updated = client.get(f"/api/products/{p1['id']}").json()
    p2_updated = client.get(f"/api/products/{p2['id']}").json()
    assert p1_updated["stock_quantity"] == p1_initial_stock - 2
    assert p2_updated["stock_quantity"] == p2_initial_stock - 3

    # Verify invoice returns multi-item structure
    invoice_res = client.get(f"/api/orders/{order_data['order_number']}/invoice")
    assert invoice_res.status_code == 200
    inv = invoice_res.json()
    assert len(inv["items"]) == 2
    assert float(inv["total_amount"]) == expected_total

