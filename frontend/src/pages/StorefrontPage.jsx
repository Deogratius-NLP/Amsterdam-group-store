import React, { useState, useEffect } from 'react';
import Header from '../components/storefront/Header';
import HeroSection from '../components/storefront/HeroSection';
import CategoryFilter from '../components/storefront/CategoryFilter';
import CategoryCardGrid from '../components/storefront/CategoryCardGrid';
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
import { ANIMAL_CATEGORIES, filterProductsByAnimal } from '../utils/animalCategories';
import { Sparkles, ShieldCheck, ArrowLeft, ArrowRight, LayoutGrid, Layers, Search, X } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState([]);
  const [comingSoonProducts, setComingSoonProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pricingMode, setPricingMode] = useState('RETAIL');

  // Amazon-Style Browsing: 'CATEGORIES' (Category Cards Hub) vs 'PRODUCTS' (Product Cards Grid)
  const [browseView, setBrowseView] = useState('CATEGORIES');
  const [selectedAnimalCategory, setSelectedAnimalCategory] = useState('all');

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

  // Main catalog load based on search
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      try {
        setLoading(true);
        const data = await productService.getProducts({
          search: searchQuery,
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
  }, [searchQuery]);

  // When user types a search query in Hero, automatically show products
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setBrowseView('PRODUCTS');
    }
  }, [searchQuery]);

  // Navigation handlers
  const handleSelectAnimalCategory = (animalId) => {
    setSelectedAnimalCategory(animalId);
    setBrowseView('PRODUCTS');
    const target = document.getElementById('products-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToCategories = () => {
    setBrowseView('CATEGORIES');
    setSearchQuery('');
    const target = document.getElementById('products-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewAllProducts = () => {
    setSelectedAnimalCategory('all');
    setBrowseView('PRODUCTS');
    const target = document.getElementById('products-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products by selected animal category or search query
  const displayedProducts = searchQuery.trim().length > 0
    ? products
    : filterProductsByAnimal(products, selectedAnimalCategory);

  const activeCategoryObj = ANIMAL_CATEGORIES.find((c) => c.id === selectedAnimalCategory);

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
            {/* View 1: Amazon-Style Category Cards Hub */}
            {browseView === 'CATEGORIES' && searchQuery.trim().length === 0 ? (
              <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-6 sm:space-y-8">
                {/* Customer Love Note - Green & Stylish without boxy rectangle card */}
                <div className="flex items-start sm:items-center gap-3">
                  <span className="w-1.5 h-8 sm:h-7 rounded-full bg-gradient-to-b from-amsterdam-lime-bright to-amsterdam-olive-dark shrink-0 mt-0.5 sm:mt-0 shadow-2xs" />
                  <p className="text-sm sm:text-base font-semibold text-amsterdam-olive-dark tracking-tight font-display leading-snug">
                    We have simplified the way you can place your order,{' '}
                    <span className="text-amsterdam-olive font-medium italic block sm:inline">because we love our customers</span>
                  </p>
                </div>

                {/* Control Bar: Header & Centered View All Products */}
                <div className="bg-white/85 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-200/70 shadow-sm text-left">
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amsterdam-dark tracking-tight">
                    Browse by Animal Category
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
                    Choose your livestock category below to explore certified veterinary vitamins, boosters, and formulations.
                  </p>

                  {/* Centered View All Products Fast Link */}
                  <div className="flex justify-center mt-5 pt-1">
                    <button
                      type="button"
                      onClick={handleViewAllProducts}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-amsterdam-muted text-amsterdam-dark font-bold text-xs sm:text-sm border border-gray-200/90 shadow-2xs transition-all hover:border-amsterdam-lime/50 group"
                    >
                      <Layers className="w-4 h-4 text-amsterdam-olive group-hover:scale-110 transition-transform" />
                      <span>View All Products ({products.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Category Cards Grid */}
                <CategoryCardGrid
                  products={products}
                  onSelectCategory={handleSelectAnimalCategory}
                />
              </div>
            ) : (
              /* View 2: Category Product Cards & Prices View */
              <div className="space-y-6">
                {/* Back to Categories Navigation Header */}
                <div className="flex flex-col gap-4 bg-white/85 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-gray-200/70 shadow-sm">
                  
                  {/* Top Bar: Back Button, Breadcrumb, and Shopping Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBackToCategories}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-amsterdam-muted text-amsterdam-dark text-xs font-bold border border-gray-200/90 shadow-2xs transition-all hover:border-amsterdam-lime/50 group"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-amsterdam-olive group-hover:-translate-x-0.5 transition-transform" />
                        <span>Back to Categories</span>
                      </button>

                      <div className="text-xs font-medium text-gray-400 hidden sm:flex items-center gap-1.5">
                        <span>Categories</span>
                        <span>/</span>
                        <span className="font-bold text-amsterdam-dark">
                          {searchQuery ? `Search: "${searchQuery}"` : (activeCategoryObj?.name || 'All Products')}
                        </span>
                      </div>
                    </div>

                    {/* Shopping Mode Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Mode:
                      </span>
                      <div className="inline-flex p-1 rounded-2xl bg-gray-100/90 border border-gray-200 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setPricingMode('RETAIL')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                            pricingMode === 'RETAIL'
                              ? 'bg-white text-amsterdam-dark shadow-sm'
                              : 'text-gray-500 hover:text-amsterdam-dark'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${pricingMode === 'RETAIL' ? 'bg-emerald-600' : 'bg-transparent'}`} />
                          <span>RETAIL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPricingMode('WHOLESALE')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
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

                  {/* Active Category Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {activeCategoryObj && !searchQuery && (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amsterdam-lime/40 shadow-xs shrink-0">
                          <img
                            src={activeCategoryObj.image}
                            alt={activeCategoryObj.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amsterdam-dark tracking-tight">
                          {searchQuery
                            ? `Search Results for "${searchQuery}"`
                            : activeCategoryObj
                            ? `${activeCategoryObj.name} Products`
                            : 'All Livestock Products'}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {searchQuery
                            ? `Found ${displayedProducts.length} matching items`
                            : activeCategoryObj
                            ? `${activeCategoryObj.subtitle} • ${displayedProducts.length} products available`
                            : `Displaying all ${displayedProducts.length} verified agricultural & veterinary formulations`}
                        </p>
                      </div>
                    </div>

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleBackToCategories}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors self-start sm:self-auto border border-red-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear Search</span>
                      </button>
                    )}
                  </div>

                  {/* Filter Pills Bar & Mode Notice */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CategoryFilter
                      selectedAnimalCategory={selectedAnimalCategory}
                      onSelectAnimalCategory={setSelectedAnimalCategory}
                      onShowCategoriesOverview={handleBackToCategories}
                    />

                    {pricingMode === 'WHOLESALE' && (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                        Wholesale Pricing Active • Minimum quantities apply
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Grid: Displaying Product Cards and Prices */}
                <ProductGrid
                  products={displayedProducts}
                  loading={loading}
                  onSelectProduct={handleSelectProduct}
                  pricingMode={pricingMode}
                  onResetSearch={handleBackToCategories}
                />
              </div>
            )}

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
