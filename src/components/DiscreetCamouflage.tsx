import React, { useState } from 'react';
import { ShoppingCart, Check, RefreshCw, EyeOff, Calculator, ArrowLeft } from 'lucide-react';

interface DiscreetCamouflageProps {
  isActive: boolean;
  onRestore: () => void;
}

export const DiscreetCamouflage: React.FC<DiscreetCamouflageProps> = ({
  isActive,
  onRestore,
}) => {
  const [groceries, setGroceries] = useState([
    { id: 1, item: 'Atta (Wheat Flour) 5kg', done: true },
    { id: 2, item: 'Toor Dal 1kg', done: false },
    { id: 3, item: 'Mustard Oil 1L', done: false },
    { id: 4, item: 'Green Chilies & Ginger', done: true },
    { id: 5, item: 'Milk 1 Litre packet', done: false },
    { id: 6, item: 'Soap & Detergent', done: false },
  ]);

  const [newItem, setNewItem] = useState('');

  if (!isActive) return null;

  const toggleItem = (id: number) => {
    setGroceries(prev => 
      prev.map(g => g.id === id ? { ...g, done: !g.done } : g)
    );
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setGroceries(prev => [
      ...prev,
      { id: Date.now(), item: newItem.trim(), done: false }
    ]);
    setNewItem('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 text-stone-800 p-4 sm:p-8 flex flex-col items-center justify-start overflow-y-auto font-sans select-none animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-6">
        {/* Camouflage Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">
                Pantry & Grocery List
              </h2>
              <p className="text-[11px] text-stone-400">
                Household shopping checklist
              </p>
            </div>
          </div>

          {/* Discreet Exit Gesture Button */}
          <button
            onClick={onRestore}
            className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors cursor-pointer"
            title="Restore Hub"
          >
            Exit List
          </button>
        </div>

        {/* Grocery Input Form */}
        <form onSubmit={addItem} className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add grocery item..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Grocery List */}
        <div className="space-y-2">
          {groceries.map(g => (
            <div
              key={g.id}
              onClick={() => toggleItem(g.id)}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                g.done ? 'bg-stone-50 text-stone-400 border-stone-200 line-through' : 'bg-white text-stone-800 border-stone-200'
              }`}
            >
              <span>{g.item}</span>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                g.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
              }`}>
                {g.done && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          ))}
        </div>

        {/* Secret return tap hint at bottom */}
        <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-400">
          <span>Weekly budget: ₹2,400</span>
          <button
            onClick={onRestore}
            className="text-stone-400 hover:text-stone-600 underline cursor-pointer"
          >
            Return to App
          </button>
        </div>
      </div>
    </div>
  );
};
