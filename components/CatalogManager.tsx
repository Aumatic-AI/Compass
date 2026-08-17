'use client';

import { useState, useTransition } from 'react';
import { RawProduct } from '@/lib/dashboard-data';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleAvailableAction,
  ProductFields,
} from '@/lib/actions/products';
import { DashboardConfig } from '@/lib/dashboard-config/types';

const emptyForm: ProductFields = {
  name: '', category: '', pack_size: '', order_type: '', price: null, currency: 'INR', image_url: '',
};

function cleanForm(f: ProductFields): ProductFields {
  return {
    ...f,
    name: f.name.trim(),
    category: f.category.trim(),
    pack_size: f.pack_size.trim(),
    order_type: f.order_type.trim(),
    currency: f.currency.trim() || 'INR',
    image_url: f.image_url.trim(),
  };
}

export default function CatalogManager({
  initialProducts,
  config,
}: {
  initialProducts: RawProduct[];
  config: DashboardConfig;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFields>(emptyForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ProductFields>(emptyForm);
  const [isPending, startTransition] = useTransition();

  function buildMeta(p: RawProduct): string {
    return config.catalogFields
      .map((f) => {
        if (f.key === 'price') {
          if (p.price === null || p.price === undefined) return 'price not set';
          const symbol = p.currency === 'USD' ? '$' : '₹';
          return `${symbol}${p.price}`;
        }
        const value = (p as any)[f.key];
        return value ? String(value) : `${f.label}: —`;
      })
      .join(' · ');
  }

  const groups = new Map<string, { label: string; items: RawProduct[] }>();
  for (const p of products) {
    const raw = String((p as any)[config.catalogGroupBy] || 'Uncategorized').trim();
    const key = raw.toLowerCase();
    if (!groups.has(key)) groups.set(key, { label: raw, items: [] });
    groups.get(key)!.items.push(p);
  }

  function startEdit(p: RawProduct) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || '',
      pack_size: p.pack_size || '',
      order_type: p.order_type || '',
      price: p.price,
      currency: p.currency || 'INR',
      image_url: p.image_url || '',
    });
  }

  function saveEdit(id: string) {
    const cleaned = cleanForm(form);
    startTransition(async () => {
      await updateProductAction(id, cleaned);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...cleaned } : p)));
      setEditingId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteProductAction(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    });
  }

  function handleToggle(p: RawProduct) {
    startTransition(async () => {
      await toggleAvailableAction(p.id, !p.available);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)));
    });
  }

  function handleAdd() {
    const cleaned = cleanForm(addForm);
    if (!cleaned.name) return;
    startTransition(async () => {
      const created = await createProductAction(cleaned);
      setProducts((prev) => [...prev, created as RawProduct]);
      setAddForm(emptyForm);
      setShowAddForm(false);
    });
  }

  return (
    <div>
      <div className="cat-add-row">
        <button className="btn-pill" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="cat-edit-form">
          <input placeholder="Name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
          <input placeholder="Category" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} />
          <input placeholder="Pack size" value={addForm.pack_size} onChange={(e) => setAddForm({ ...addForm, pack_size: e.target.value })} />
          <input placeholder="Order type" value={addForm.order_type} onChange={(e) => setAddForm({ ...addForm, order_type: e.target.value })} />
          <input
            placeholder="Price"
            type="number"
            value={addForm.price ?? ''}
            onChange={(e) => setAddForm({ ...addForm, price: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <input placeholder="Currency (INR/USD)" value={addForm.currency} onChange={(e) => setAddForm({ ...addForm, currency: e.target.value })} />
          <input
            placeholder="Image URL (copy from your website)"
            value={addForm.image_url}
            onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
            style={{ minWidth: 260 }}
          />
          <div className="cat-edit-actions">
            <button className="btn-pill btn-pill-sm" onClick={handleAdd} disabled={isPending || !addForm.name.trim()}>
              {isPending ? 'Adding…' : 'Add Product'}
            </button>
          </div>
        </div>
      )}

      {groups.size === 0 && (
        <div className="cat-item"><div className="cat-info"><span className="cat-name">No products loaded yet</span></div></div>
      )}
      {Array.from(groups.values()).map((group) => (
        <div key={group.label.toLowerCase()}>
          <div className="cat-group-label">{group.label}</div>
          {group.items.map((p) => (
            <div key={p.id}>
              <div className="cat-item">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, marginRight: 12 }}
                  />
                ) : (
                  <div
                    title="No image yet — add one so this product can appear in the WhatsApp catalog"
                    style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0, marginRight: 12,
                      background: '#fef2f2', border: '1px dashed #fecaca',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, color: '#dc2626',
                    }}
                  >
                    ?
                  </div>
                )}
                <div className="cat-info">
                  <span className="cat-name">{p.name}</span>
                  <span className="cat-meta">{buildMeta(p)}</span>
                </div>
                <div className="cat-actions">
                  <button className="btn-pill btn-pill-sm btn-pill-outline" onClick={() => startEdit(p)} disabled={isPending}>
                    Edit
                  </button>
                  <button className="btn-pill btn-pill-sm btn-pill-danger" onClick={() => handleDelete(p.id, p.name)} disabled={isPending}>
                    Delete
                  </button>
                  <div
                    className={`switch${p.available ? '' : ' off'}`}
                    onClick={() => handleToggle(p)}
                    title={p.available ? 'Available — click to hide from AI' : 'Hidden — click to make available'}
                  />
                </div>
              </div>

              {editingId === p.id && (
                <div className="cat-edit-form">
                  <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <input placeholder="Pack size" value={form.pack_size} onChange={(e) => setForm({ ...form, pack_size: e.target.value })} />
                  <input placeholder="Order type" value={form.order_type} onChange={(e) => setForm({ ...form, order_type: e.target.value })} />
                  <input
                    placeholder="Price"
                    type="number"
                    value={form.price ?? ''}
                    onChange={(e) => setForm({ ...form, price: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                  <input placeholder="Currency (INR/USD)" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                  <input
                    placeholder="Image URL (copy from your website)"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    style={{ minWidth: 260 }}
                  />
                  <div className="cat-edit-actions">
                    <button className="btn-pill btn-pill-sm" onClick={() => saveEdit(p.id)} disabled={isPending}>
                      {isPending ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn-pill btn-pill-sm btn-pill-outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
