import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Flame, Droplets, Trophy, Settings, Share2, Utensils } from 'lucide-react';
import MacroRing from './components/MacroRing';
import AddMealModal from './components/AddMealModal';
import ApkExportModal from './components/ApkExportModal';
import { Meal, MacroGoals } from './types';

const App: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock initial goals
  const goals: MacroGoals = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80,
  };

  // Calculate totals
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  // Load initial demo data if empty
  useEffect(() => {
    // Check local storage here in a real app
    if (meals.length === 0) {
      // Add a dummy meal for visualization
      // setMeals([{
      //   id: '1',
      //   name: 'Oatmeal & Blueberries',
      //   timestamp: Date.now() - 100000,
      //   calories: 350,
      //   protein: 12,
      //   carbs: 45,
      //   fat: 6,
      //   note: 'Breakfast'
      // }]);
    }
  }, []);

  const handleAddMeal = (meal: Meal) => {
    setMeals(prev => [meal, ...prev]);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans pb-24 md:pb-0">
      
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur border-b border-zinc-800 z-30">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Today</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{today}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowExportModal(true)}
              className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Export to Mobile"
            >
              <Share2 size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-zinc-900 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-8">
        
        {/* Main Stats */}
        <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-sm shadow-xl">
           <MacroRing 
             current={totals.protein} 
             target={goals.protein} 
             color="#ef4444" // red-500
             label="Protein"
             unit="g"
             size="sm"
           />
           <MacroRing 
             current={totals.calories} 
             target={goals.calories} 
             color="#22c55e" // green-500
             label="Calories" 
             unit="kcal"
             size="lg"
           />
           <MacroRing 
             current={totals.carbs} 
             target={goals.carbs} 
             color="#3b82f6" // blue-500
             label="Carbs"
             unit="g"
             size="sm"
           />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase">Burned</p>
              <p className="text-lg font-bold text-white">420 <span className="text-xs font-normal text-zinc-500">kcal</span></p>
            </div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase">Water</p>
              <p className="text-lg font-bold text-white">1.2 <span className="text-xs font-normal text-zinc-500">L</span></p>
            </div>
          </div>
        </div>

        {/* Meal Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Meals</h2>
            <span className="text-xs font-medium text-zinc-500">{totals.calories} / {goals.calories} kcal</span>
          </div>
          
          <div className="space-y-3">
            {meals.length === 0 ? (
               <div className="text-center py-10 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                 <div className="inline-flex p-3 bg-zinc-800 rounded-full mb-3 text-zinc-600">
                   <Utensils size={24} />
                 </div>
                 <p className="text-zinc-500 text-sm">No meals logged today.</p>
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="mt-2 text-green-500 font-medium text-sm hover:underline"
                 >
                   Log your first meal
                 </button>
               </div>
            ) : (
              meals.map((meal) => (
                <div key={meal.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 animate-fade-in-up">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-14 h-14 rounded-xl object-cover bg-zinc-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                      <span className="text-xl">🥗</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-white line-clamp-1">{meal.name}</h3>
                      <span className="font-bold text-green-500 text-sm">{meal.calories}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {meal.protein > 0 && <span className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{meal.protein}p</span>}
                      {meal.carbs > 0 && <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{meal.carbs}c</span>}
                      {meal.fat > 0 && <span className="text-xs text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">{meal.fat}f</span>}
                    </div>
                    {meal.note && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{meal.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 bg-green-500 rounded-full text-black flex items-center justify-center shadow-lg shadow-green-500/40 hover:scale-105 transition-transform"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Desktop Helper Text */}
      <div className="hidden md:block fixed bottom-6 right-6 text-zinc-500 text-sm max-w-xs text-right">
        <p>Use the <strong>+</strong> button to log meals.</p>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
        >
          Add Meal
        </button>
      </div>

      {/* Modals */}
      {showAddModal && <AddMealModal onClose={() => setShowAddModal(false)} onAdd={handleAddMeal} />}
      {showExportModal && <ApkExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
};

export default App;
