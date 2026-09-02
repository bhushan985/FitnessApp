import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Utensils, Check } from 'lucide-react';
import { adminApi } from '../services/api';

export const FoodsManager: React.FC = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'breakfast',
    dietaryType: 'veg',
    defaultServingSize: 100,
    calories: 250,
    proteinG: 10,
    carbohydratesG: 35,
    fatG: 5,
    ingredients: '',
    preparationMethod: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getFoods();
      if (res.success) setFoods(res.data);
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      category: 'breakfast',
      dietaryType: 'veg',
      defaultServingSize: 100,
      calories: 250,
      proteinG: 10,
      carbohydratesG: 35,
      fatG: 5,
      ingredients: 'Rice, Dal, Spices',
      preparationMethod: 'Cook with sautéed spices and steam.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: any) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      category: food.category,
      dietaryType: food.dietaryType,
      defaultServingSize: food.defaultServingSize || 100,
      calories: food.nutrition?.calories || 250,
      proteinG: food.nutrition?.proteinG || 10,
      carbohydratesG: food.nutrition?.carbohydratesG || 35,
      fatG: food.nutrition?.fatG || 5,
      ingredients: food.ingredients?.join(', ') || '',
      preparationMethod: food.preparationMethod || '',
      imageUrl: food.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        dietaryType: formData.dietaryType,
        defaultServingSize: Number(formData.defaultServingSize),
        nutrition: {
          calories: Number(formData.calories),
          proteinG: Number(formData.proteinG),
          carbohydratesG: Number(formData.carbohydratesG),
          fatG: Number(formData.fatG),
          fiberG: 4,
          sugarG: 2,
        },
        ingredients: formData.ingredients.split(',').map((s) => s.trim()),
        preparationMethod: formData.preparationMethod,
        imageUrl: formData.imageUrl,
      };

      if (editingFood) {
        await adminApi.updateFood(editingFood._id, payload);
      } else {
        await adminApi.createFood(payload);
      }

      setIsModalOpen(false);
      fetchFoods();
    } catch (err) {
      console.error('Save food error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deactivate this food item?')) return;
    try {
      await adminApi.deleteFood(id);
      fetchFoods();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Regional Foods Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Manage master recipe database, nutrition parameters, and regional score links</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-white text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80">
              <th className="py-3.5 px-4">Food Item</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Diet Type</th>
              <th className="py-3.5 px-4">Calories</th>
              <th className="py-3.5 px-4">Macros (P/C/F)</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredFoods.map((food) => (
              <tr key={food._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-3">
                  <img src={food.imageUrl} alt={food.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                  <div>
                    <span className="block font-bold text-white">{food.name}</span>
                    <span className="text-[10px] text-slate-400">{food.defaultServingSize}g serving</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 capitalize font-semibold text-slate-300">{food.category}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-slate-800 text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-slate-700 uppercase text-[10px]">
                    {food.dietaryType}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-extrabold text-amber-400">{food.nutrition?.calories} kcal</td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">
                  {food.nutrition?.proteinG}g P / {food.nutrition?.carbohydratesG}g C / {food.nutrition?.fatG}g F
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(food)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(food._id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white">
                {editingFood ? 'Edit Food Item' : 'Add New Regional Food'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Food Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={formData.proteinG}
                    onChange={(e) => setFormData({ ...formData, proteinG: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={formData.carbohydratesG}
                    onChange={(e) => setFormData({ ...formData, carbohydratesG: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={formData.fatG}
                    onChange={(e) => setFormData({ ...formData, fatG: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-xl text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Preparation Method</label>
                <textarea
                  rows={2}
                  value={formData.preparationMethod}
                  onChange={(e) => setFormData({ ...formData, preparationMethod: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-3 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
