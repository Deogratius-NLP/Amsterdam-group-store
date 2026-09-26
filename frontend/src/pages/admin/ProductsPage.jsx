import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import { formatTsh } from '../../utils/currency';
import { getProductImageUrl } from '../../utils/imageUrl';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Package, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2,
  RefreshCw,
  Upload,
  BookOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Recommended veterinary instructions based on category / keywords
const getDefaultInstructionsFor = (name = '', category = '', desc = '') => {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const d = (desc || '').toLowerCase();

  if (n.includes('cleanse') || n.includes('sanitizer') || n.includes('shield') || n.includes('disinfect') || c.includes('biosecurity')) {
    return [
      "Thoroughly clean and rinse drinkers, water pipes, and storage tanks prior to sanitizing.",
      "Dilute 1ml to 2ml per 10 Litres of fresh drinking water (or 5ml per 1L for terminal house disinfection).",
      "Allow the treated solution to circulate through the system for at least 30 minutes before poultry access.",
      "Administer continuously during clean-out periods, or 2 to 3 days per week during production cycles.",
      "Store the concentrated bottle tightly sealed in a cool, dry place away from direct sunlight."
    ];
  }

  if (n.includes('electrolyte') || n.includes('aqua-vita') || n.includes('vita-chick') || d.includes('electrolyte') || d.includes('rehydration')) {
    return [
      "Dissolve 100g in 200 Litres of clean drinking water (or approx. 1 teaspoon per 5 Litres).",
      "Mix thoroughly until completely dissolved before filling drinking fountains or bell drinkers.",
      "Provide as the exclusive drinking water source during hot weather, post-vaccination, or transit arrival.",
      "Prepare fresh electrolyte solution daily; discard any remaining unconsumed solution after 24 hours.",
      "Administer for 3 to 5 consecutive days during stress periods or high ambient temperatures."
    ];
  }

  if (n.includes('chick') || d.includes('day-old') || d.includes('starter pack')) {
    return [
      "Mix 1g to 2g per Litre of clean drinking water for the first 5 to 7 days of the chick's arrival.",
      "Ensure drinking water is at room temperature (20°C - 25°C) before introducing to the brooder.",
      "Provide ad-libitum access alongside starter crumbs to jumpstart digestive enzyme secretion.",
      "Replace drinking water twice daily (morning and evening) to maintain maximum freshness and hygiene.",
      "Transition chicks to Vitamix Plus or standard grower regimen after the initial first week."
    ];
  }

  if (n.includes('layer') || n.includes('egg') || n.includes('calci') || n.includes('shell') || d.includes('layer') || d.includes('shell fractures')) {
    return [
      "For Feed Mixing: Blend 1kg to 2kg thoroughly per 100kg of finished commercial layer feed.",
      "For Drinking Water: Dissolve 1g per 2 Litres of water during peak laying or cracked shell alerts.",
      "Ensure uniform dispersion in mash or pellet feed to avoid uneven mineral consumption.",
      "Administer daily throughout the active egg production cycle, especially from week 18 onwards.",
      "Store in an airtight container in a dry location to prevent moisture absorption and caking."
    ];
  }

  if (n.includes('toxi') || n.includes('binder') || n.includes('mycotoxin') || d.includes('aflatoxin')) {
    return [
      "Incorporate 1kg to 2kg per metric ton (1,000kg) of complete poultry feed during milling.",
      "For small-scale farms: Thoroughly pre-mix 100g with 5kg of feed before blending into the full 100kg batch.",
      "Ensure homogeneous blending so every bird receives balanced mycotoxin defense.",
      "Use continuously whenever humidity is elevated or feed grain storage moisture exceeds 13%.",
      "Keep the sack tightly closed to protect the active aluminosilicates from ambient moisture."
    ];
  }

  if (n.includes('herbal') || n.includes('immuno') || n.includes('botanical') || d.includes('essential oils')) {
    return [
      "Mix 1kg per 500kg of feed (or 2g per Litre of warm drinking water for liquid dispersal).",
      "Administer for 5 to 7 consecutive days during seasonal weather shifts or viral challenge outbreaks.",
      "Stir or agitate thoroughly to ensure active botanical essential oils remain evenly suspended.",
      "Safe to use concurrently with routine vaccination and nutritional programs.",
      "Seal container securely after each use to preserve essential aromatic phytonutrients."
    ];
  }

  if (c.includes('vitamin') || n.includes('vitamix') || n.includes('vital') || n.includes('booster')) {
    return [
      "Drinking Water Dosage: Dissolve 1g per 2 to 4 Litres of fresh drinking water.",
      "Feed Dosage: Mix 100g to 200g per 100kg of complete poultry feed or mash.",
      "Administer for 5 to 7 consecutive days during stress, brooding, molting, or peak growth stages.",
      "Prepare fresh solution each morning and protect drinkers from direct heat and direct sunlight.",
      "Store in a cool, dark, and dry environment below 25°C to preserve vitamin potency."
    ];
  }

  return [
    "Carefully measure the recommended dosage according to the flock size and age bracket.",
    "Dissolve evenly in clean drinking water (1g to 2g per Litre) or blend thoroughly into finished feed.",
    "Provide fresh mixture daily and ensure clean drinkers are accessible to all birds.",
    "Continue standard administration for 5 to 7 consecutive days or as advised by your veterinary officer.",
    "Store in a cool, dry place away from direct sunlight, sealed tightly after every use."
  ];
};

const parseInstructions = (inst) => {
  if (!inst) return [];
  if (Array.isArray(inst)) return inst.map(s => String(s).trim().replace(/^\d+[\.\)]\s*/, '')).filter(Boolean);
  if (typeof inst === 'string') {
    return inst.split('\n').map(s => s.trim().replace(/^\d+[\.\)]\s*/, '')).filter(Boolean);
  }
  return [];
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reordering, setReordering] = useState(false);
  
  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadingGlobal, setUploadingGlobal] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Feed Grade Vitamins',
    price: '',
    retail_price: '',
    wholesale_price: '',
    wholesale_minimum_quantity: 10,
    stock_quantity: 0,
    low_stock_threshold: 5,
    is_active: true,
    is_coming_soon: false,
    description: '',
    instructions: getDefaultInstructionsFor('', 'Feed Grade Vitamins', ''),
    packages: [],
    images: [
      { image_url: '/vitamix-sample.jpg', alt_text: 'Front Pack', is_primary: true },
      { image_url: '/vitamix-sample.jpg', alt_text: 'Nutritional Detail', is_primary: false },
      { image_url: '/vitamix-sample.jpg', alt_text: 'Packaging Seal', is_primary: false },
    ]
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProducts({ search });
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Product Reordering: Move Up / Down
  const handleMoveProduct = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;
    setProducts(newProducts);

    try {
      setReordering(true);
      const productIds = newProducts.map((p) => p.id);
      await adminService.reorderProducts(productIds);
    } catch (err) {
      console.error('Failed to persist product order:', err);
      fetchProducts();
    } finally {
      setReordering(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Feed Grade Vitamins',
      price: '',
      retail_price: '',
      wholesale_price: '',
      wholesale_minimum_quantity: 10,
      stock_quantity: 50,
      low_stock_threshold: 5,
      is_active: true,
      is_coming_soon: false,
      description: '',
      instructions: getDefaultInstructionsFor('', 'Feed Grade Vitamins', ''),
      packages: [],
      images: [
        { image_url: '/vitamix-sample.jpg', alt_text: 'Front Pack', is_primary: true },
        { image_url: '/vitamix-sample.jpg', alt_text: 'Back Pack', is_primary: false },
        { image_url: '/vitamix-sample.jpg', alt_text: 'Side Pack', is_primary: false },
      ]
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    const existingInstructions = parseInstructions(prod.instructions);
    const initialInstructions = existingInstructions.length > 0 
      ? existingInstructions 
      : getDefaultInstructionsFor(prod.name, prod.category, prod.description);

    const existingPackages = prod.packages && prod.packages.length > 0
      ? prod.packages.map((pkg) => ({
          id: pkg.id,
          package_name: pkg.package_name,
          retail_price: pkg.retail_price,
          wholesale_price: pkg.wholesale_price
        }))
      : [];

    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.retail_price || prod.price,
      retail_price: prod.retail_price || prod.price,
      wholesale_price: prod.wholesale_price || '',
      wholesale_minimum_quantity: prod.wholesale_minimum_quantity || 10,
      stock_quantity: prod.stock_quantity,
      low_stock_threshold: prod.low_stock_threshold,
      is_active: prod.is_active,
      is_coming_soon: prod.is_coming_soon,
      description: prod.description || '',
      instructions: initialInstructions,
      packages: existingPackages,
      images: prod.images && prod.images.length > 0 ? prod.images.map(img => ({
        image_url: img.image_url,
        alt_text: img.alt_text || prod.name,
        is_primary: img.is_primary
      })) : [
        { image_url: '/vitamix-sample.jpg', alt_text: 'Product Packshot', is_primary: true }
      ]
    });
    setFormError('');
    setModalOpen(true);
  };

  // Package builder handlers
  const addPackageField = () => {
    setFormData({
      ...formData,
      packages: [
        ...(formData.packages || []),
        {
          package_name: '',
          retail_price: formData.retail_price || '',
          wholesale_price: formData.wholesale_price || ''
        }
      ]
    });
  };

  const removePackageField = (index) => {
    const updated = (formData.packages || []).filter((_, i) => i !== index);
    setFormData({ ...formData, packages: updated });
  };

  const handlePackageChange = (index, field, value) => {
    const updated = [...(formData.packages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, packages: updated });
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...formData.images];
    updated[index].image_url = value;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        { image_url: '/vitamix-sample.jpg', alt_text: `Image ${formData.images.length + 1}`, is_primary: false }
      ]
    });
  };

  const removeImageField = (index) => {
    if (formData.images.length <= 1) return;
    const updated = formData.images.filter((_, i) => i !== index);
    if (!updated.some(img => img.is_primary)) {
      updated[0].is_primary = true;
    }
    setFormData({ ...formData, images: updated });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingIndex(index);
      const res = await adminService.uploadProductImage(file);
      const updated = [...formData.images];
      updated[index].image_url = res.image_url;
      setFormData({ ...formData, images: updated });
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(err.response?.data?.detail || 'Failed to upload image from computer.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleMultipleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setUploadingGlobal(true);
      const uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await adminService.uploadProductImage(file);
        uploadedImages.push({
          image_url: res.image_url,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          is_primary: false
        });
      }

      // If current images only contain default placeholder /vitamix-sample.jpg, replace them
      const isOnlyPlaceholder = formData.images.length === 1 && formData.images[0].image_url === '/vitamix-sample.jpg';
      let newImages = isOnlyPlaceholder ? uploadedImages : [...formData.images, ...uploadedImages];
      if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
        newImages[0].is_primary = true;
      }
      setFormData({ ...formData, images: newImages });
    } catch (err) {
      console.error('Failed to upload images:', err);
      alert(err.response?.data?.detail || 'Failed to upload images from computer.');
    } finally {
      setUploadingGlobal(false);
    }
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...(formData.instructions || [])];
    updated[index] = value;
    setFormData({ ...formData, instructions: updated });
  };

  const addInstructionStep = () => {
    setFormData({
      ...formData,
      instructions: [...(formData.instructions || []), '']
    });
  };

  const removeInstructionStep = (index) => {
    const updated = (formData.instructions || []).filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: updated });
  };

  const moveInstructionStep = (index, direction) => {
    const list = [...(formData.instructions || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData({ ...formData, instructions: list });
  };

  const handleAutoSuggestInstructions = () => {
    const suggested = getDefaultInstructionsFor(formData.name, formData.category, formData.description);
    setFormData({ ...formData, instructions: suggested });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    const retailPrice = parseFloat(formData.retail_price || formData.price);
    if (!retailPrice || retailPrice <= 0) {
      setFormError('A valid Retail Price in TSh is required.');
      return;
    }
    const wholesalePrice = parseFloat(formData.wholesale_price) || Math.round(retailPrice * 0.85);
    const wholesaleMin = parseInt(formData.wholesale_minimum_quantity, 10) || 10;

    try {
      setSaving(true);
      setFormError('');

      // Clean and format instructions
      const cleanSteps = (formData.instructions || [])
        .map(s => typeof s === 'string' ? s.trim() : '')
        .filter(Boolean);

      const instructionsString = cleanSteps.length > 0 
        ? cleanSteps.map((step, i) => `${i + 1}. ${step.replace(/^\d+[\.\)]\s*/, '')}`).join('\n')
        : '';

      // Clean and format packages
      const cleanPackages = (formData.packages || [])
        .filter(p => p.package_name && p.package_name.trim())
        .map((p, idx) => ({
          package_name: p.package_name.trim(),
          retail_price: parseFloat(p.retail_price) || retailPrice,
          wholesale_price: parseFloat(p.wholesale_price) || wholesalePrice,
          display_order: idx,
          is_active: true
        }));

      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: retailPrice,
        retail_price: retailPrice,
        wholesale_price: wholesalePrice,
        wholesale_minimum_quantity: wholesaleMin,
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold, 10) || 5,
        is_active: formData.is_active,
        is_coming_soon: formData.is_coming_soon,
        description: formData.description.trim(),
        instructions: instructionsString,
        images: formData.images.filter(img => img.image_url.trim()),
        packages: cleanPackages
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
      } else {
        await adminService.createProduct(payload);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Save product error:', err);
      setFormError(err.response?.data?.detail || 'Failed to save product details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId, name) => {
    if (window.confirm(`Are you sure you want to deactivate "${name}"? Historical orders will be preserved.`)) {
      try {
        await adminService.deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to deactivate product');
      }
    }
  };

  return (
    <AdminLayout activeTitle="Product Catalog Management">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-amsterdam-dark tracking-tight">
            Products & Inventory Catalog
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage product titles, descriptions, pricing, multi-image galleries, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amsterdam-olive' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-card mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search products by title, category, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-gray-50/50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-card overflow-hidden">
        
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-amsterdam-olive animate-spin mb-2" />
            <p className="text-xs text-gray-400">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-3 w-16 text-center">Order</th>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Retail Price</th>
                  <th className="py-3 px-6">Wholesale Price</th>
                  <th className="py-3 px-6">Stock (Shared)</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {products.map((p, idx) => {
                  const isLow = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
                  const isOut = p.stock_quantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Order Controls */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0 || reordering}
                            onClick={() => handleMoveProduct(idx, -1)}
                            className="p-1 rounded text-gray-500 hover:text-amsterdam-dark hover:bg-gray-100 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === products.length - 1 || reordering}
                            onClick={() => handleMoveProduct(idx, 1)}
                            className="p-1 rounded text-gray-500 hover:text-amsterdam-dark hover:bg-gray-100 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Product Name & Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F2F7EC] p-1 border border-gray-200/80 flex items-center justify-center flex-shrink-0">
                            <img
                              src={getProductImageUrl(p.primary_image_url)}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => { e.currentTarget.src = '/vitamix-sample.jpg'; }}
                            />
                          </div>
                          <div>
                            <span className="font-bold text-amsterdam-dark block">
                              {p.name}
                            </span>
                            {p.packages && p.packages.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.packages.map((pkg) => (
                                  <span
                                    key={pkg.id || pkg.package_name}
                                    className="px-1.5 py-0.2 rounded bg-amsterdam-muted text-amsterdam-olive-dark text-[10px] font-bold"
                                  >
                                    {pkg.package_name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400">
                                {p.images?.length || 1} {p.images?.length === 1 ? 'image' : 'images'}
                              </span>
                              {p.instructions && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amsterdam-olive bg-amsterdam-muted px-1.5 py-0.5 rounded-full">
                                  <BookOpen className="w-2.5 h-2.5" />
                                  <span>{parseInstructions(p.instructions).length} steps</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-gray-600">
                        <span className="px-2.5 py-1 rounded-full bg-amsterdam-muted text-amsterdam-olive-dark text-[11px] font-semibold">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-amsterdam-dark">
                        {formatTsh(p.retail_price ?? p.price)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-amsterdam-olive">
                            {formatTsh(p.wholesale_price ?? Math.round((p.price || 0) * 0.85))}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Min: {p.wholesale_minimum_quantity || 10} pcs
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {p.is_coming_soon ? (
                          <span className="text-gray-400 font-medium">Coming Soon</span>
                        ) : isOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
                            0 (Out of stock)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                            {p.stock_quantity} (Low stock)
                          </span>
                        ) : (
                          <span className="font-bold text-amsterdam-dark">
                            {p.stock_quantity} units
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {p.is_active ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">Deactivated</span>
                          )}
                          {p.is_coming_soon && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full w-max">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amsterdam-olive hover:bg-gray-100"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {p.is_active && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                              title="Deactivate Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 z-10 max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display font-extrabold text-xl text-amsterdam-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vitamix Plus 1kg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Feed Grade Vitamins, Supplements"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                  />
                </div>
              </div>

              {/* Pricing & Minimums */}
              <div className="bg-[#FAFDF6] p-4 rounded-2xl border border-amsterdam-olive/20 space-y-3">
                <div className="text-[11px] font-bold text-amsterdam-dark uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amsterdam-olive"></span>
                  Pricing & Wholesale Configuration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Retail Price (TSh) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      placeholder="25000"
                      value={formData.retail_price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ 
                          ...formData, 
                          retail_price: val, 
                          price: val,
                          wholesale_price: formData.wholesale_price || (val ? Math.round(Number(val) * 0.85) : '')
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark bg-white focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Wholesale Price (TSh) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      placeholder="21250"
                      value={formData.wholesale_price}
                      onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark bg-white focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Wholesale Min Qty *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="10"
                      value={formData.wholesale_minimum_quantity}
                      onChange={(e) => setFormData({ ...formData, wholesale_minimum_quantity: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark bg-white focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                    />
                  </div>
                </div>
              </div>

              {/* Product Packages & Variations (Optional) */}
              <div className="bg-[#FAFDF6] p-4 rounded-2xl border border-amsterdam-olive/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-amsterdam-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amsterdam-olive" />
                    <span>Product Packages & Sizes (Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addPackageField}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amsterdam-muted hover:bg-amsterdam-lime/20 text-amsterdam-olive-dark text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-amsterdam-olive" />
                    <span>Add Package</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  If this product comes in multiple packaging sizes (e.g. 30g, 100g, 250g, 1kg), define individual package names and prices here. Customers can select their preferred package on the storefront.
                </p>

                {(formData.packages || []).length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {formData.packages.map((pkg, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-200">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Package Size / Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. 100g, 250g, 1kg"
                            value={pkg.package_name}
                            onChange={(e) => handlePackageChange(idx, 'package_name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-amsterdam-dark font-bold focus:outline-none focus:ring-1 focus:ring-amsterdam-olive"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Retail Price (TSh)</label>
                          <input
                            type="number"
                            placeholder={formData.retail_price || '25000'}
                            value={pkg.retail_price}
                            onChange={(e) => handlePackageChange(idx, 'retail_price', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-1 focus:ring-amsterdam-olive"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Wholesale Price (TSh)</label>
                          <input
                            type="number"
                            placeholder={formData.wholesale_price || '21250'}
                            value={pkg.wholesale_price}
                            onChange={(e) => handlePackageChange(idx, 'wholesale_price', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-1 focus:ring-amsterdam-olive"
                          />
                        </div>
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => removePackageField(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Remove Package"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic py-1">
                    No individual packages configured. The standard base price above applies.
                  </div>
                )}
              </div>

              {/* Stock Inventory (Shared Pool) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stock Quantity (Shared Pool)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="120"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                  />
                  <span className="text-[10px] text-gray-400">Single stock pool shared between retail & wholesale</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-amsterdam-olive focus:ring-amsterdam-olive"
                  />
                  <span>Product is Active in Store</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-purple-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_coming_soon}
                    onChange={(e) => setFormData({ ...formData, is_coming_soon: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Coming Soon Carousel Item</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Feed grade vitamins, active ingredients, instructions, poultry species..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive resize-none"
                />
              </div>

              {/* How to Use (Step-by-Step Instructions) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amsterdam-olive" />
                      <span>How to Use (Step-by-Step Instructions)</span>
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Numbered sentences displayed in the customer storefront modal.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoSuggestInstructions}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amsterdam-muted hover:bg-amsterdam-lime/20 text-amsterdam-olive-dark text-[11px] font-bold transition-colors"
                      title="Load recommended steps based on title and category"
                    >
                      <Sparkles className="w-3 h-3 text-amsterdam-olive" />
                      <span>Suggest Steps</span>
                    </button>

                    <button
                      type="button"
                      onClick={addInstructionStep}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amsterdam-olive hover:underline px-1.5 py-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(formData.instructions || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      {/* Step Number Badge */}
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EBF7D4] text-[#4F772D] font-bold text-xs flex items-center justify-center border border-[#D5ECC2] mt-1">
                        {idx + 1}
                      </span>

                      {/* Step Text Area */}
                      <textarea
                        rows={2}
                        placeholder={`Step ${idx + 1} instructions (e.g. Dissolve 1g per Litre of drinking water...)`}
                        value={step}
                        onChange={(e) => handleInstructionChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-amsterdam-dark bg-white focus:outline-none focus:ring-1 focus:ring-amsterdam-olive resize-none"
                      />

                      {/* Step Actions: Up, Down, Delete */}
                      <div className="flex flex-col gap-0.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => moveInstructionStep(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-amsterdam-olive disabled:opacity-20 rounded hover:bg-white transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveInstructionStep(idx, 1)}
                          disabled={idx === (formData.instructions || []).length - 1}
                          className="p-1 text-gray-400 hover:text-amsterdam-olive disabled:opacity-20 rounded hover:bg-white transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeInstructionStep(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-white transition-colors"
                          title="Remove step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!formData.instructions || formData.instructions.length === 0) && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
                      <p className="text-xs text-gray-500">No steps added yet.</p>
                      <div className="flex items-center justify-center gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={addInstructionStep}
                          className="text-xs font-bold text-amsterdam-olive hover:underline"
                        >
                          + Add Step
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={handleAutoSuggestInstructions}
                          className="text-xs font-bold text-amsterdam-olive hover:underline"
                        >
                          Auto-fill Recommended Steps
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Image Gallery Configuration */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Product Image Gallery (3+ images for carousel)
                    </label>
                    <span className="text-[10px] text-gray-400">Upload directly from your computer or provide image URLs</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Direct Upload Button from Computer */}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amsterdam-muted hover:bg-amsterdam-lime/20 text-amsterdam-olive-dark text-[11px] font-bold transition-all shadow-xs">
                      {uploadingGlobal ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amsterdam-olive" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-amsterdam-olive" />
                      )}
                      <span>Upload from Computer</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        multiple
                        className="hidden"
                        disabled={uploadingGlobal}
                        onChange={(e) => {
                          handleMultipleFilesUpload(Array.from(e.target.files || []));
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-[11px] font-bold text-amsterdam-olive hover:underline px-2 py-1"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-white p-0.5 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={getProductImageUrl(img.image_url)}
                          alt="preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/vitamix-sample.jpg'; }}
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Image URL or uploaded file path"
                        value={img.image_url}
                        onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-amsterdam-dark bg-white"
                      />

                      {/* Browse File for this specific slot */}
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors flex-shrink-0">
                        {uploadingIndex === idx ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amsterdam-olive" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-amsterdam-olive" />
                        )}
                        <span className="hidden sm:inline">Browse</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          disabled={uploadingIndex !== null}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(idx, e.target.files[0]);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        disabled={formData.images.length <= 1}
                        className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 rounded-lg hover:bg-white transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
