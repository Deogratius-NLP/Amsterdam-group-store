from decimal import Decimal


def test_list_active_products(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 6
    # Verify Vitamix Plus is present
    vitamix = next((p for p in products if "vitamix" in p["slug"].lower()), None)
    assert vitamix is not None
    assert Decimal(str(vitamix["price"])) == Decimal("25000.00")
    assert len(vitamix["images"]) >= 3


def test_search_products(client):
    response = client.get("/api/products?search=Vitamix")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert "vitamix" in results[0]["name"].lower()


def test_filter_coming_soon(client):
    response = client.get("/api/products?coming_soon=true")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 3
    for item in items:
        assert item["is_coming_soon"] is True


def test_get_product_detail(client):
    list_res = client.get("/api/products")
    product_id = list_res.json()[0]["id"]

    detail_res = client.get(f"/api/products/{product_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == product_id
    assert "images" in detail
    assert len(detail["images"]) > 0
