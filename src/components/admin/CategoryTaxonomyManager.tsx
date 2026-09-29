'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Layers, 
  Shirt, 
  Home, 
  Footprints, 
  Sparkles,
  Edit2,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';
import { TaxonomyDivision, TaxonomyItem } from '@/lib/catalog-taxonomy';

interface Props {
  initialTaxonomy: TaxonomyDivision[];
  categoriesCount: number;
}

export default function CategoryTaxonomyManager({ initialTaxonomy, categoriesCount }: Props) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyDivision[]>(initialTaxonomy);
  const [activeDivisionId, setActiveDivisionId] = useState<string>('fashion');
  const [activeDeptId, setActiveDeptId] = useState<string>('mens-fashion');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New item draft form
  const [newItemName, setNewItemName] = useState<string>('');
  const [targetGroupId, setTargetGroupId] = useState<string>('');

  const currentDivision = taxonomy.find(d => d.id === activeDivisionId) || taxonomy[0];
  const currentDept = currentDivision?.departments.find(d => d.id === activeDeptId) || currentDivision?.departments[0];

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Toggle Item Active/Inactive
  const toggleItemActive = (divId: string, deptId: string, grpId: string, itemId: string) => {
    setTaxonomy(prev => prev.map(div => {
      if (div.id !== divId) return div;
      return {
        ...div,
        departments: div.departments.map(dept => {
          if (dept.id !== deptId) return dept;
          return {
            ...dept,
            groups: dept.groups.map(grp => {
              if (grp.id !== grpId) return grp;
              return {
                ...grp,
                items: grp.items.map(item => {
                  if (item.id !== itemId) return item;
                  return { ...item, isActive: !item.isActive };
                })
              };
            })
          };
        })
      };
    }));
  };

  // Delete Item
  const deleteItem = (divId: string, deptId: string, grpId: string, itemId: string) => {
    if (!confirm('Are you sure you want to remove this item from the catalog?')) return;
    setTaxonomy(prev => prev.map(div => {
      if (div.id !== divId) return div;
      return {
        ...div,
        departments: div.departments.map(dept => {
          if (dept.id !== deptId) return dept;
          return {
            ...dept,
            groups: dept.groups.map(grp => {
              if (grp.id !== grpId) return grp;
              return {
                ...grp,
                items: grp.items.filter(item => item.id !== itemId)
              };
            })
          };
        })
      };
    }));
  };

  // Add Item to Group
  const addItem = (divId: string, deptId: string, grpId: string) => {
    if (!newItemName.trim()) return;
    const slug = newItemName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newItem: TaxonomyItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      slug,
      isActive: true,
      order: 99,
    };

    setTaxonomy(prev => prev.map(div => {
      if (div.id !== divId) return div;
      return {
        ...div,
        departments: div.departments.map(dept => {
          if (dept.id !== deptId) return dept;
          return {
            ...dept,
            groups: dept.groups.map(grp => {
              if (grp.id !== grpId) return grp;
              return {
                ...grp,
                items: [...grp.items, newItem]
              };
            })
          };
        })
      };
    }));

    setNewItemName('');
    setTargetGroupId('');
    showNotification('success', `Added "${newItem.name}" to ${grpId}`);
  };

  // Save changes to API
  const handleSaveTaxonomy = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/catalog/taxonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxonomy })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save taxonomy');
      showNotification('success', 'Catalog Taxonomy published successfully to live website!');
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Sync to Prisma Category Table
  const handleSyncToDatabase = async () => {
    if (!confirm('This will synchronize all taxonomy items into the primary database category table. Proceed?')) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/catalog/taxonomy/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync to database');
      showNotification('success', data.message || 'Taxonomy synced to database categories!');
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Actions */}
      <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Dynamic Sourcing Control
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Live Production Taxonomy
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase font-heading tracking-tight">
            Catalog & Category Matrix Manager
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl font-medium">
            Control the categories and products displayed in the public catalog directory. Add, remove, or toggle items on the live website.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSyncToDatabase}
            disabled={isSyncing}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center gap-2"
            title="Sync all hierarchy nodes to Prisma Category table for product tagging"
          >
            <Database className="w-4 h-4 text-blue-500" />
            <span>{isSyncing ? 'Syncing...' : 'Sync to DB Categories'}</span>
          </button>

          <button
            onClick={handleSaveTaxonomy}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border animate-in fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-500/30'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Division Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
        {taxonomy.map(div => {
          const isActive = div.id === activeDivisionId;
          return (
            <button
              key={div.id}
              onClick={() => {
                setActiveDivisionId(div.id);
                if (div.departments.length > 0) setActiveDeptId(div.departments[0].id);
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-gray-800'
              }`}
            >
              <span>{div.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Departments Tabs (e.g. Men's, Women's, Kids) */}
      {currentDivision && currentDivision.departments.length > 1 && (
        <div className="flex items-center gap-2">
          {currentDivision.departments.map(dept => {
            const isDeptActive = dept.id === activeDeptId;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveDeptId(dept.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  isDeptActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {dept.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Production Line Groups Grid */}
      {currentDept && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDept.groups.map(grp => (
            <div
              key={grp.id}
              className="bg-white dark:bg-dark-surface rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase font-heading">
                      {grp.name}
                    </h3>
                    {grp.badge && (
                      <span className="text-[10px] font-bold text-blue-500">
                        {grp.badge}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500">
                    {grp.items.length} items
                  </span>
                </div>

                {/* Items List with Edit/Toggle/Delete */}
                <div className="space-y-2">
                  {grp.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        item.isActive
                          ? 'bg-gray-50/80 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60'
                          : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30 opacity-60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className={`font-bold truncate ${item.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          /{item.slug}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle Active */}
                        <button
                          onClick={() => toggleItemActive(currentDivision.id, currentDept.id, grp.id, item.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            item.isActive
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          title={item.isActive ? 'Hide from catalog' : 'Show on catalog'}
                        >
                          {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteItem(currentDivision.id, currentDept.id, grp.id, item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Item to this Group */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                {targetGroupId === grp.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="e.g. Cargo Joggers"
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addItem(currentDivision.id, currentDept.id, grp.id)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90"
                      >
                        Confirm Add
                      </button>
                      <button
                        onClick={() => { setTargetGroupId(''); setNewItemName(''); }}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setTargetGroupId(grp.id); setNewItemName(''); }}
                    className="w-full py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item to {grp.name}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
