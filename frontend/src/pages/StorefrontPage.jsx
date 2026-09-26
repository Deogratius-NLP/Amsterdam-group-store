import React, { useState, useEffect } from 'react';
import Header from '../components/storefront/Header';
import HeroSection from '../components/storefront/HeroSection';
import CategoryFilter from '../components/storefront/CategoryFilter';
import ProductGrid from '../components/storefront/ProductGrid';
import ProductDetailsModal from '../components/storefront/ProductDetailsModal';
import OrderFormModal from '../components/storefront/OrderFormModal';
import OrderSuccessModal from '../components/storefront/OrderSuccessModal';
import ComingSoonSection from '../components/storefront/ComingSoonSection';
import GetInTouchBanner from '../components/storefront/GetInTouchBanner';
import Footer from '../components/storefront/Footer';
import FloatingCartButton from '../components/storefront/FloatingCartButton';
import CartModal from '../components/storefront/CartModal';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState([]);
  const [comingSoonProducts, setComingSoonProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pricingMode, setPricingMode] = useState('RETAIL');

  // Cart State & Context
  const { isCartOpen, openCart, closeCart, clearCart } = useCart();
  const [cartCheckoutItems, setCartCheckoutItems] = useState(null);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderPackage, setOrderPackage] = useState(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);

  // Initial load: Categories and Coming Soon
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [cats, comingSoon] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ coming_soon: true })
        ]);
        setCategories(cats || []);
        setComingSoonProducts(comingSoon || []);
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    }
    loadInitialData();
  }, []);

  // Main catalog load based on search and category
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      try {
        setLoading(true);
        const data = await productService.getProducts({
          search: searchQuery,
          category: selectedCategory,
          coming_soon: false
        });
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Debounce search slightly for responsive typing
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory]);

  // Handle clicking product card
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  // Handle proceeding from Product Details to Customer Order Form
  const handleProceedToOrder = (product, quantity, selectedPackage = null) => {
    setIsDetailsOpen(false);
    setCartCheckoutItems(null);
    setOrderProduct(product);
    setOrderQuantity(quantity);
    setOrderPackage(selectedPackage);
    setIsOrderFormOpen(true);
  };

  // Handle proceeding from Cart Modal to Customer Order Form
  const handleProceedToCartCheckout = (items) => {
    closeCart();
    setOrderProduct(null);
    setOrderPackage(null);
    setCartCheckoutItems(items);
    setIsOrderFormOpen(true);
  };

  // Handle going back to details or cart from order form
  const handleBackToDetails = () => {
    setIsOrderFormOpen(false);
    if (cartCheckoutItems && cartCheckoutItems.length > 0) {
      openCart();
    } else {
      setIsDetailsOpen(true);
    }
  };

  // Handle successful order creation
  const handleOrderSuccess = (confirmationData) => {
    setIsOrderFormOpen(false);
    setOrderConfirmation(confirmationData);
    setIsOrderSuccessOpen(true);

    if (cartCheckoutItems && cartCheckoutItems.length > 0) {
      // Deduct inventory for all items in the cart
      setProducts((prev) =>
        prev.map((p) => {
          const orderedItem = cartCheckoutItems.find((ci) => ci.product.id === p.id);
          if (orderedItem) {
            return { ...p, stock_quantity: Math.max(0, p.stock_quantity - orderedItem.quantity) };
          }
          return p;
        })
      );
      clearCart();
      setCartCheckoutItems(null);
    } else if (orderProduct) {
      // Update stock locally for single product order
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === orderProduct.id) {
            const newQty = Math.max(0, p.stock_quantity - orderQuantity);
            return { ...p, stock_quantity: newQty };
          }
          return p;
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF7]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with 3D "Shop" Lettering and Pill Search */}
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Product Catalog Section with Static Parallax Poultry Pattern Background */}
        <section
          id="products-section"
          className="relative w-full [clip-path:inset(0)] py-12 sm:py-16 border-b border-gray-100"
          style={{
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Static Parallax Background Pattern */}
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/poultry-pattern.jpg')",
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center top',
              backgroundSize: '480px auto',
              opacity: 0.85,
            }}
          />

          {/* Soft ambient overlay wash for optimal readability */}
          <div className="fixed inset-0 pointer-events-none z-0 bg-[#F9FAF7]/50 backdrop-blur-[0.5px]" />

          {/* Foreground Container with Floating Cards */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Canva Customer Note */}
            <div className="mb-6">
              <div className="inline-block bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-200/70 shadow-xs">
                <p className="text-xs sm:text-sm font-semibold text-amsterdam-dark leading-relaxed">
                  We have simplified the way you can place your order,<br />
                  because we love our customers
                </p>
              </div>
            </div>

            {/* Section Header, Shopping Mode Toggle & Category Filter Bar */}
            <div className="flex flex-col gap-5 mb-8 bg-white/85 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-gray-200/70 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amsterdam-dark tracking-tight">
                    Our Products
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Authentic certified poultry vitamins, additives, and farm management supplies.
                  </p>
                </div>

                {/* Shopping Mode Toggle: Retail vs Wholesale */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-center">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Shopping Mode:
                  </span>
                  <div className="inline-flex p-1 rounded-2xl bg-gray-100/90 border border-gray-200 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setPricingMode('RETAIL')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        pricingMode === 'RETAIL'
                          ? 'bg-white text-amsterdam-dark shadow-sm ring-1 ring-black/[0.04]'
                          : 'text-gray-500 hover:text-amsterdam-dark'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${pricingMode === 'RETAIL' ? 'bg-emerald-600' : 'bg-transparent'}`} />
                      <span>RETAIL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPricingMode('WHOLESALE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        pricingMode === 'WHOLESALE'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-gray-500 hover:text-amber-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${pricingMode === 'WHOLESALE' ? 'bg-white' : 'bg-transparent'}`} />
                      <span>WHOLESALE</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills & Mode Info Banner */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
                {pricingMode === 'WHOLESALE' && (
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                    Wholesale Pricing Active • Minimum quantities apply per product
                  </span>
                )}
              </div>
            </div>

            {/* Product Grid (Cards floating in front of the static background) */}
            <ProductGrid
              products={products}
              loading={loading}
              onSelectProduct={handleSelectProduct}
              pricingMode={pricingMode}
              onResetSearch={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            />

          </div>
        </section>

        {/* Coming Soon Section (Canva 3D layered carousel with 5 dots) */}
        <ComingSoonSection products={comingSoonProducts} />

        {/* Get In Touch Today Banner (Canva Amsterdam Crimson CTA) */}
        <GetInTouchBanner />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Product Details Modal with Multi-Image Carousel */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onProceedToOrder={handleProceedToOrder}
        pricingMode={pricingMode}
      />

      {/* Customer Ordering Form Modal */}
      <OrderFormModal
        product={orderProduct}
        quantity={orderQuantity}
        selectedPackage={orderPackage}
        cartItems={cartCheckoutItems}
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setCartCheckoutItems(null);
          setOrderPackage(null);
        }}
        onBack={handleBackToDetails}
        onOrderSuccess={handleOrderSuccess}
        pricingMode={pricingMode}
      />

      {/* Order Success & WhatsApp Direct Modal */}
      <OrderSuccessModal
        orderConfirmation={orderConfirmation}
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
      />

      {/* Floating Red and White Vector Cart Action Button */}
      <FloatingCartButton />

      {/* Cart Pop-up Modal Window */}
      <CartModal
        isOpen={isCartOpen}
        onClose={closeCart}
        onProceedToCheckout={handleProceedToCartCheckout}
      />
    </div>
  );
}
