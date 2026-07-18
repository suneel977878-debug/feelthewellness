'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '../../../data/products';
import { updateProductImageConfig } from '../../actions/images';

export default function GalleryClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [aspectRatioMode, setAspectRatioMode] = useState<'1/1' | '4/3' | '16/9' | '3/4'>('1/1');
  
  // Modal state
  const [editingItem, setEditingItem] = useState<{
    product: Product;
    imageIndex: number;
    cropData: { zoom: number; x: number; y: number };
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Multi-select state tracking unique identifiers "productId-imageIndex"
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Derived categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Flatten images for the grid
  const allImages = useMemo(() => {
    const result: { product: Product; imageUrl: string; index: number; crop: { zoom: number, x: number, y: number } }[] = [];
    filteredProducts.forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.forEach((imgUrl, idx) => {
          const crop = (product.imageCrops && product.imageCrops[idx]) || { 
            zoom: idx === 0 ? (product.defaultZoom || 1.0) : 1.0, 
            x: idx === 0 ? (product.defaultZoomX || 50) : 50, 
            y: idx === 0 ? (product.defaultZoomY || 50) : 50 
          };
          result.push({ product, imageUrl: imgUrl, index: idx, crop });
        });
      }
    });
    return result;
  }, [filteredProducts]);

  const openEditor = (item: typeof allImages[0]) => {
    setEditingItem({
      product: item.product,
      imageIndex: item.index,
      cropData: { ...item.crop }
    });
  };

  const closeEditor = () => {
    setEditingItem(null);
  };

  const handleCropChange = (field: 'zoom' | 'x' | 'y', value: number) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        cropData: { ...editingItem.cropData, [field]: value }
      });
    }
  };

  const saveChanges = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const p = editingItem.product;
      const newImages = [...(p.images || [])];
      
      // Build safe crops array
      const newCrops = newImages.map((_, i) => {
        if (i === editingItem.imageIndex) return editingItem.cropData;
        return (p.imageCrops && p.imageCrops[i]) || { zoom: 1.0, x: 50, y: 50 };
      });

      const res = await updateProductImageConfig(p.id, newImages, newCrops);
      if (res.success) {
        // Update local state
        setProducts(prev => prev.map(prod => {
          if (prod.id === p.id) {
            return { ...prod, images: newImages, imageCrops: newCrops };
          }
          return prod;
        }));
        closeEditor();
      } else {
        alert("Failed to save changes.");
      }
    } catch (e) {
      alert("Error saving.");
    }
    setIsSaving(false);
  };

  const deleteImage = async () => {
    if (!editingItem) return;
    const confirmDelete = confirm("Are you sure you want to unlink this image from the product?");
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const p = editingItem.product;
      const newImages = [...(p.images || [])];
      const oldCrops = [...(p.imageCrops || [])];
      
      // Remove the item at the specific index
      newImages.splice(editingItem.imageIndex, 1);
      
      // Fix crops array to match the new images length
      const newCrops = newImages.map((_, i) => {
        // If we deleted index 1, the old index 2 becomes the new index 1
        const oldIndex = i >= editingItem.imageIndex ? i + 1 : i;
        return oldCrops[oldIndex] || { zoom: 1.0, x: 50, y: 50 };
      });

      const res = await updateProductImageConfig(p.id, newImages, newCrops);
      if (res.success) {
        // Update local state
        setProducts(prev => prev.map(prod => {
          if (prod.id === p.id) {
            return { ...prod, images: newImages, imageCrops: newCrops };
          }
          return prod;
        }));
        closeEditor();
      } else {
        alert("Failed to delete image.");
      }
    } catch (e) {
      alert("Error deleting.");
    }
    setIsSaving(false);
  };

  const toggleSelection = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // prevent opening editor
    const newSelected = new Set(selectedImageIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedImageIds(newSelected);
  };

  const handleBulkUnlink = async () => {
    if (selectedImageIds.size === 0) return;
    const confirmDelete = confirm(`Are you sure you want to unlink ${selectedImageIds.size} images?`);
    if (!confirmDelete) return;

    setIsBulkActing(true);
    
    // Group deletions by product ID
    const unlinksByProduct: Record<number, number[]> = {};
    Array.from(selectedImageIds).forEach(idString => {
      const [pIdStr, iIdStr] = idString.split('-');
      const pId = parseInt(pIdStr, 10);
      const iId = parseInt(iIdStr, 10);
      if (!unlinksByProduct[pId]) unlinksByProduct[pId] = [];
      unlinksByProduct[pId].push(iId);
    });

    try {
      let updatedProducts = [...products];

      for (const pIdStr of Object.keys(unlinksByProduct)) {
        const pId = parseInt(pIdStr, 10);
        const indexesToRemove = unlinksByProduct[pId].sort((a, b) => b - a); // Sort descending to splice safely
        
        const product = updatedProducts.find(p => p.id === pId);
        if (!product) continue;

        const newImages = [...(product.images || [])];
        const oldCrops = [...(product.imageCrops || [])];
        
        // Remove from highest index to lowest so we don't mess up array indices
        indexesToRemove.forEach(idx => {
          newImages.splice(idx, 1);
          oldCrops.splice(idx, 1);
        });

        // Ensure new crops array has correct length and fallbacks
        const newCrops = newImages.map((_, i) => oldCrops[i] || { zoom: 1.0, x: 50, y: 50 });

        const res = await updateProductImageConfig(pId, newImages, newCrops);
        if (res.success) {
          updatedProducts = updatedProducts.map(prod => 
            prod.id === pId ? { ...prod, images: newImages, imageCrops: newCrops } : prod
          );
        } else {
          alert(`Failed to unlink for product ${pId}: ${res.error}`);
        }
      }
      
      setProducts(updatedProducts);
      setSelectedImageIds(new Set()); // clear selection
      
    } catch (e) {
      alert("Error performing bulk unlink.");
    }
    setIsBulkActing(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Bulk Image Gallery Editor</h1>
        <Link href="/portal_ad" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>
          &larr; Back to Admin
        </Link>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', background: '#111', padding: '16px 20px', borderRadius: '12px', border: '1px solid #222' }}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <label style={{ fontSize: '1rem', color: '#aaa' }}>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '8px 14px', background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <label style={{ fontSize: '1rem', color: '#aaa' }}>Crop View Aspect Ratio:</label>
          <div style={{ display: 'flex', gap: '6px', background: '#1a1a1a', padding: '4px', borderRadius: '8px', border: '1px solid #333' }}>
            {(['1/1', '4/3', '16/9', '3/4'] as const).map(ratio => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatioMode(ratio)}
                style={{
                  padding: '6px 12px',
                  background: aspectRatioMode === ratio ? 'var(--accent)' : 'transparent',
                  color: aspectRatioMode === ratio ? '#fff' : '#888',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: aspectRatioMode === ratio ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {ratio === '1/1' ? 'Square (1:1)' : ratio === '4/3' ? 'Rectangular (4:3)' : ratio === '16/9' ? 'Wide (16:9)' : 'Portrait (3:4)'}
              </button>
            ))}
          </div>
        </div>

        <span style={{ color: '#888', marginLeft: 'auto', fontSize: '0.95rem' }}>Showing {allImages.length} images</span>
      </div>

      {/* Bulk Action Bar */}
      {selectedImageIds.size > 0 && (
        <div style={{
          background: '#222', padding: '16px 24px', borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '2rem', border: '1px solid var(--accent)',
          position: 'sticky', top: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            {selectedImageIds.size} images selected
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setSelectedImageIds(new Set())}
              style={{ padding: '8px 16px', background: 'transparent', color: '#fff', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer' }}
            >
              Clear Selection
            </button>
            <button 
              onClick={handleBulkUnlink}
              disabled={isBulkActing}
              style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: isBulkActing ? 'wait' : 'pointer', fontWeight: 'bold' }}
            >
              {isBulkActing ? 'Unlinking...' : 'Bulk Unlink Selected'}
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {allImages.map((item, i) => {
          const itemId = `${item.product.id}-${item.index}`;
          const isSelected = selectedImageIds.has(itemId);
          
          return (
            <div 
              key={`${itemId}-${i}`} 
              style={{ 
                background: '#1a1a1a', 
                borderRadius: '12px', 
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--accent)' : '1px solid #333',
                transition: 'transform 0.2s, borderColor 0.2s',
                position: 'relative'
              }}
              onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.borderColor = '#333' }}
              onClick={() => openEditor(item)}
            >
              <div 
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                onClick={(e) => toggleSelection(e, itemId)}
              >
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  readOnly
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              </div>
              <div style={{ 
                width: '100%', 
                aspectRatio: aspectRatioMode, 
                background: '#fce4ec', // Light pink background to match product page blend mode
                position: 'relative' 
              }}>
                <img 
                  src={item.imageUrl} 
                  alt={item.product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    transform: `scale(${item.crop.zoom})`,
                    transformOrigin: `${item.crop.x}% ${item.crop.y}%`
                  }}
                />
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', fontSize: '11px', borderRadius: '4px' }}>
                  ID: {item.product.id}
                </div>
              </div>
              <div style={{ padding: '10px', fontSize: '0.85rem' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                  <a 
                    href={`/product/${item.product.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent opening editor
                    style={{ color: '#fff', textDecoration: 'underline', fontWeight: 'bold' }}
                    title="View product page in new tab"
                  >
                    {item.product.name}
                  </a>
                </div>
                <div style={{ color: '#888', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Img #{item.index + 1}</span>
                  <span>Z: {item.crop.zoom}x</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', 
            padding: '24px', width: '90%', maxWidth: '800px',
            display: 'flex', gap: '30px', flexWrap: 'wrap'
          }}>
            {/* Preview Column */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Preview Box ({aspectRatioMode})</h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['1/1', '4/3', '16/9', '3/4'] as const).map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatioMode(ratio)}
                      style={{
                        padding: '3px 6px',
                        background: aspectRatioMode === ratio ? 'var(--accent)' : '#222',
                        color: aspectRatioMode === ratio ? '#fff' : '#aaa',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontWeight: aspectRatioMode === ratio ? 'bold' : 'normal'
                      }}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ 
                width: '100%', aspectRatio: aspectRatioMode, background: '#fce4ec', 
                borderRadius: '12px', overflow: 'hidden', position: 'relative'
              }}>
                <img 
                  src={editingItem.product.images![editingItem.imageIndex]} 
                  alt="Preview"
                  style={{
                    width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply',
                    transform: `scale(${editingItem.cropData.zoom})`,
                    transformOrigin: `${editingItem.cropData.x}% ${editingItem.cropData.y}%`
                  }}
                />
                {/* Center Crosshair Guides */}
                <div style={{ position: 'absolute', top: 0, left: '50%', width: '1px', height: '100%', background: 'rgba(255, 0, 128, 0.4)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'rgba(255, 0, 128, 0.4)', pointerEvents: 'none' }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', textAlign: 'center' }}>
                {editingItem.product.name}
              </p>
            </div>

            {/* Controls Column */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>Adjust Config</h3>
                <button 
                  onClick={closeEditor}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                >&times;</button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Zoom Scale</label>
                  <span style={{ color: 'var(--accent)' }}>{editingItem.cropData.zoom}x</span>
                </div>
                <input type="range" min="1.0" max="3.0" step="0.1" style={{ width: '100%', accentColor: 'var(--accent)' }} 
                  value={editingItem.cropData.zoom} 
                  onChange={(e) => handleCropChange('zoom', parseFloat(e.target.value))} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Focus Horizontal (X)</label>
                  <span style={{ color: 'var(--accent)' }}>{editingItem.cropData.x}%</span>
                </div>
                <input type="range" min="0" max="100" step="1" style={{ width: '100%', accentColor: 'var(--accent)' }} 
                  value={editingItem.cropData.x} 
                  onChange={(e) => handleCropChange('x', parseFloat(e.target.value))} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Focus Vertical (Y)</label>
                  <span style={{ color: 'var(--accent)' }}>{editingItem.cropData.y}%</span>
                </div>
                <input type="range" min="0" max="100" step="1" style={{ width: '100%', accentColor: 'var(--accent)' }} 
                  value={editingItem.cropData.y} 
                  onChange={(e) => handleCropChange('y', parseFloat(e.target.value))} 
                />
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', paddingTop: '20px' }}>
                <button 
                  onClick={deleteImage} 
                  disabled={isSaving}
                  style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 'bold' }}
                >
                  Unlink Image
                </button>
                <button 
                  onClick={saveChanges} 
                  disabled={isSaving}
                  style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 'bold' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
