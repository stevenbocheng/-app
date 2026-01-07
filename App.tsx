import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar as CalendarIcon, Menu, Loader2, Sparkles, MessageCircle,
  X, Plus, Edit3, Navigation, CalendarDays, CheckCircle2, User, Trash2, ClipboardList, Wallet, Info, Settings
} from 'lucide-react';

import { getPlaceInsight, getTripSuggestion } from './services/gemini';
import { fetchSheetData, updateSheetData, withOptimisticUpdate } from './services/googleSheets';
import { TripMeta, ItineraryItem, TabType, ChecklistItem, FlightInfo, HotelInfo, ExpenseItem, WeatherData } from './types';

import WeatherCard from './components/WeatherCard';
import ItineraryCard from './components/ItineraryCard';
import RouteItemCard from './components/RouteItemCard';
import AddItemModal from './components/AddItemModal';
import LoginScreen from './components/LoginScreen';
import ProfileModal from './components/ProfileModal';
import ChecklistView from './components/ChecklistView';
import CurrencyCalculator from './components/CurrencyCalculator';
import TripInfoView from './components/TripInfoView';
import ExpenseTracker from './components/ExpenseTracker';
import SettingsModal from './components/SettingsModal';

// --- Helpers ---
const mapWeatherCode = (code: number): 'sunny' | 'cloudy' | 'rainy' => {
  if (code <= 1) return 'sunny';
  if (code <= 48) return 'cloudy';
  return 'rainy';
};

const getDayName = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[date.getDay()];
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${month}/${day}`;
};

const generateDates = (startDateStr: string, endDateStr: string): WeatherData[] => {
  const dates: WeatherData[] = [];
  if (!startDateStr || !endDateStr) return [];

  // Parse YYYY-MM-DD manually to avoid timezone issues
  const [sYear, sMonth, sDay] = startDateStr.split('-').map(Number);
  const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);

  const start = new Date(sYear, sMonth - 1, sDay);
  const end = new Date(eYear, eMonth - 1, eDay);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysToGenerate = Math.max(0, Math.min(diffDays, 30));

  for (let i = 0; i <= daysToGenerate; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    // Format back to YYYY-MM-DD using local time parts
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    dates.push({
      id: dateStr,
      day: getDayName(dateStr),
      date: formatDate(dateStr),
      fullDate: dateStr,
      condition: 'unknown'
    });
  }
  return dates;
};

const calculateTotalBudget = (items: ItineraryItem[]) => {
  let total = 0;
  if (!items) return null;
  items.forEach(item => {
    if (item.budget) {
      const num = parseInt(item.budget.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num)) total += num;
    }
  });
  return total > 0 ? `₩${total.toLocaleString()}` : null;
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-8 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl transform scale-100 transition-all">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">確定要刪除嗎？</h3>
          <p className="text-sm text-slate-400 mt-2">此動作無法復原，該行程將從您的列表中移除。</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);

  const [tripTitle, setTripTitle] = useState('韓國首爾・自由行');
  const [allItineraries, setAllItineraries] = useState<Record<number, ItineraryItem[]>>({});
  const [luggageItems, setLuggageItems] = useState<ChecklistItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ChecklistItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // Trip Info State
  const [flightInfo, setFlightInfo] = useState<FlightInfo>({
    outbound: { airline: '', flightNumber: '', time: '', terminal: '' },
    inbound: { airline: '', flightNumber: '', time: '', terminal: '' },
  });
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    name: '', address: '', checkIn: '', checkOut: '', bookingRef: ''
  });

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [selectedDay, setSelectedDay] = useState(1);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const [loadingInsightId, setLoadingInsightId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    // Check for "Remember Me" session
    const savedUser = localStorage.getItem('seoul_travel_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setShowLogin(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const initData = async () => {
      try {
        const data = await fetchSheetData(user.uid);
        if (data.meta) {
          setTripTitle(data.meta.title);
          // Ensure we use the raw YYYY-MM-DD string from backend to avoid any timezone shifts
          if (data.meta.startDate) setStartDate(data.meta.startDate.substring(0, 10));
          if (data.meta.endDate) setEndDate(data.meta.endDate.substring(0, 10));
        }
        if (data.itinerary) {
          const groupedItineraries: Record<number, ItineraryItem[]> = {};
          data.itinerary.forEach((item: any) => {
            const dayNum = Number(item.day) || 1;
            if (!groupedItineraries[dayNum]) {
              groupedItineraries[dayNum] = [];
            }
            groupedItineraries[dayNum].push(item);
          });
          setAllItineraries(groupedItineraries);
        }
        if (data.logistics) {
          if (data.logistics.flights) {
            setFlightInfo(prev => ({
              outbound: { ...prev.outbound, ...(data.logistics.flights.outbound || {}) },
              inbound: { ...prev.inbound, ...(data.logistics.flights.inbound || {}) }
            }));
          }
          if (data.logistics.hotel) {
            setHotelInfo(prev => ({ ...prev, ...data.logistics.hotel }));
          }
        }
        if (data.checklists) {
          setLuggageItems(data.checklists.filter(i => i.category === 'luggage'));
          setShoppingItems(data.checklists.filter(i => i.category === 'shopping'));
        }
        if (data.expenses) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    initData();
  }, [user]);

  // Removed Firebase onSnapshot logic as we use direct fetch and optimistic updates

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const oldTitle = tripTitle;
    withOptimisticUpdate(
      () => setTripTitle(newTitle),
      () => updateSheetData('update_meta', { title: newTitle }, user.uid),
      () => setTripTitle(oldTitle)
    );
  };

  const handleDateChange = (start: string, end: string) => {
    const oldStart = startDate;
    const oldEnd = endDate;
    withOptimisticUpdate(
      () => { setStartDate(start); setEndDate(end); },
      () => updateSheetData('update_meta', { startDate: start, endDate: end }, user.uid),
      () => { setStartDate(oldStart); setEndDate(oldEnd); }
    );
  };

  useEffect(() => {
    setWeatherData(generateDates(startDate, endDate));
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&start_date=${startDate}&end_date=${endDate}`
        );
        const data = await response.json();
        if (data.daily && data.daily.time) {
          const { time, weathercode, temperature_2m_max, temperature_2m_min } = data.daily;
          const newWeather: WeatherData[] = time.map((dateStr: string, index: number) => ({
            id: dateStr,
            day: getDayName(dateStr),
            date: formatDate(dateStr),
            fullDate: dateStr,
            tempHigh: temperature_2m_max[index],
            tempLow: temperature_2m_min[index],
            condition: mapWeatherCode(weathercode[index]),
          }));
          setWeatherData(newWeather);
        }
      } catch (error) { }
    };
    if (startDate && endDate) fetchWeather();
  }, [startDate, endDate]);

  const handleLogin = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
    localStorage.removeItem('seoul_travel_user');
    setIsProfileOpen(false);
    setAllItineraries({});
    setLuggageItems([]);
    setShoppingItems([]);
    setExpenses([]);
  };

  const updateCurrentItinerary = (newItems: ItineraryItem[]) => {
    setAllItineraries(prev => ({ ...prev, [selectedDay]: newItems }));
    updateSheetData('update_itinerary', { day: selectedDay, items: newItems }, user?.uid);
  };

  const updateLuggage = (items: ChecklistItem[]) => {
    setLuggageItems(items);
    updateSheetData('update_checklist', { category: 'luggage', items }, user?.uid);
  };

  const updateShopping = (items: ChecklistItem[]) => {
    setShoppingItems(items);
    updateSheetData('update_checklist', { category: 'shopping', items }, user?.uid);
  };

  const updateExpenses = (items: ExpenseItem[]) => {
    setExpenses(items);
    updateSheetData('update_expenses', { items }, user?.uid);
  };

  const updateFlightInfo = (info: FlightInfo) => {
    setFlightInfo(info);
    updateSheetData('update_logistics', { type: 'flights', data: info }, user?.uid);
  };

  const updateHotelInfo = (info: HotelInfo) => {
    setHotelInfo(info);
    updateSheetData('update_logistics', { type: 'hotel', data: info }, user?.uid);
  };

  const currentItinerary = allItineraries[selectedDay] || [];
  const currentDayInfo = weatherData[selectedDay - 1] || { day: '---', date: '--/--', condition: 'unknown' as const, id: '', fullDate: '' };
  const dailyTotalBudget = calculateTotalBudget(currentItinerary);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItinerary = [...currentItinerary];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItinerary.length) {
      [newItinerary[index], newItinerary[targetIndex]] = [newItinerary[targetIndex], newItinerary[index]];
      updateCurrentItinerary(newItinerary);
    }
  };

  const requestDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      updateCurrentItinerary(currentItinerary.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const handleSaveItem = (data: Partial<ItineraryItem>) => {
    if (editingItem) {
      // Edit existing
      const newItems = currentItinerary.map(item => item.id === editingItem.id ? { ...item, ...data } : item);
      updateCurrentItinerary(newItems);
      setEditingItem(null);
    } else {
      // Add new
      const newItem: ItineraryItem = {
        id: Date.now().toString(),
        title: data.title || '未命名',
        time: data.time || '10:00 AM',
        category: data.category || '自訂',
        address: data.address || '首爾',
        addressKR: data.addressKR,
        budget: data.budget
      };
      updateCurrentItinerary([...currentItinerary, newItem]);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<ItineraryItem>) => {
    const newItems = currentItinerary.map(item => item.id === id ? { ...item, ...updates } : item);
    updateCurrentItinerary(newItems);
  };

  const handleGenerateInsight = async (id: string, title: string) => {
    setLoadingInsightId(id);
    const text = await getPlaceInsight(title);
    handleUpdateItem(id, { aiInsight: text });
    setLoadingInsightId(null);
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestion(true);
    setSuggestion(null);
    const placeNames = currentItinerary.map(i => i.title);
    const text = await getTripSuggestion(placeNames, selectedDay);
    setSuggestion(text);
    setLoadingSuggestion(false);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen w-full bg-[#E2E8F0] flex items-center justify-center font-sans">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'expenses') {
      return <ExpenseTracker expenses={expenses} onUpdateExpenses={updateExpenses} />;
    }

    if (activeTab === 'info') {
      return (
        <TripInfoView
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          flightInfo={flightInfo}
          onFlightChange={updateFlightInfo}
          hotelInfo={hotelInfo}
          onHotelChange={updateHotelInfo}
        />
      );
    }

    if (activeTab === 'checklist') {
      return (
        <ChecklistView
          luggage={luggageItems}
          shopping={shoppingItems}
          onUpdateLuggage={updateLuggage}
          onUpdateShopping={updateShopping}
        />
      );
    }

    if (activeTab === 'map') {
      return (
        <div className="px-6 py-4">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-800">路線導航模式</h2>
            <p className="text-sm text-slate-400 font-medium">
              {currentDayInfo.date} ({currentDayInfo.day}) • {currentItinerary.length} 個停靠點
            </p>
          </div>

          {currentItinerary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <MapPin size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold">今天還沒有行程可以導航</p>
              <button onClick={() => setActiveTab('itinerary')} className="mt-4 text-blue-500 font-bold text-sm">去排行程</button>
            </div>
          ) : (
            <div className="pb-24">
              {currentItinerary.map((item, index) => (
                <RouteItemCard key={item.id} item={item} index={index} total={currentItinerary.length} />
              ))}
              <div className="flex justify-center mt-8 text-slate-300 text-xs font-bold uppercase tracking-widest">End of Route</div>
            </div>
          )}
        </div>
      );
    }

    // Itinerary Tab (Default)
    return (
      <>
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide snap-x">
            {weatherData.map((weather, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              return (
                <div key={weather.id || idx} onClick={() => { setSelectedDay(dayNum); setSuggestion(null); }} className="snap-start">
                  <WeatherCard item={weather} isSelected={isSelected} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-10 py-4 mb-4 border-b border-slate-100/50">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Day {selectedDay}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                {currentDayInfo.date}
                <span className="text-lg font-medium text-slate-400">({currentDayInfo.day})</span>
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 mb-0.5">預估總花費</span>
              {dailyTotalBudget ? (
                <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-2 rounded-lg">{dailyTotalBudget}</span>
              ) : (
                <span className="text-xs font-medium text-slate-300">--</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 min-h-[300px]">
          {currentItinerary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px] mb-4 bg-slate-50/50">
              <MapPin size={48} className="mb-4 text-slate-200" />
              <p className="text-sm font-bold text-slate-400">這天還沒有行程</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-4 px-6 py-2 bg-white shadow-sm border border-slate-100 rounded-full text-xs font-bold text-blue-500 hover:text-blue-600">
                開始規劃
              </button>
            </div>
          ) : (
            currentItinerary.map((item, index) => (
              <ItineraryCard
                key={item.id} item={item} index={index} total={currentItinerary.length}
                onMoveUp={() => moveItem(index, 'up')}
                onMoveDown={() => moveItem(index, 'down')}
                onDelete={() => requestDelete(item.id)}
                onGenerateInsight={handleGenerateInsight}
                onGenerateInsight={handleGenerateInsight}
                onUpdateItem={handleUpdateItem}
                onEdit={() => { setEditingItem(item); setIsModalOpen(true); }}
                loadingInsight={loadingInsightId === item.id}
              />
            ))
          )}

          <div className="mt-8 mb-8 space-y-3">
            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestion}
              className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 active:scale-95 transition-all gap-2"
            >
              {loadingSuggestion ? <Loader2 className="animate-spin" /> : <Sparkles />}
              <span>AI 行程健檢 & 推薦</span>
            </button>
            {suggestion && (
              <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-50 animate-in slide-in-from-bottom-4 relative">
                <button onClick={() => setSuggestion(null)} className="absolute top-3 right-3 text-slate-300 hover:text-slate-500"><X size={16} /></button>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={18} className="text-indigo-500" />
                  <h4 className="font-bold text-slate-800">AI 導遊建議</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{suggestion}</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#E2E8F0] flex items-center justify-center py-0 sm:py-8 font-sans">
      <div className="w-full h-screen sm:h-[850px] sm:w-[390px] bg-[#F8FAFC] sm:rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative border-[8px] border-slate-900 sm:ring-4 ring-black/5" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=400&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>

        <div className="absolute inset-0 bg-[#F8FAFC]/95 z-0"></div>

        <div className="h-7 w-full z-30 absolute top-0 flex justify-center">
          <div className="w-32 h-6 bg-slate-900 rounded-b-2xl sm:block hidden"></div>
        </div>

        <div className="h-7 w-full z-30 absolute top-0 flex justify-center">
          <div className="w-32 h-6 bg-slate-900 rounded-b-2xl sm:block hidden"></div>
        </div>

        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveItem}
          initialData={editingItem}
        />
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} tripId={user?.uid || ''} onLogout={handleLogout} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <DeleteConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} />

        {/* Only one CurrencyCalculator */}
        <CurrencyCalculator />

        {/* Header: Only show on Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="px-6 pt-12 pb-2 flex justify-between items-center z-20 relative">
            <div className="flex-1 mr-4 group">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Seoul Travel Planner</p>
              <div className="relative">
                <input
                  type="text"
                  value={tripTitle}
                  onChange={handleTitleChange}
                  className="text-2xl font-black text-slate-800 tracking-tight bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none w-full transition-colors placeholder:text-slate-300 pr-8"
                  placeholder="輸入旅程名稱"
                />
                <Edit3 size={16} className="absolute right-0 top-1.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1 rounded-full ring-2 ring-white/50 shadow-sm active:scale-95 transition-all bg-white/50 backdrop-blur-sm flex-shrink-0 text-slate-500 hover:text-blue-600"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <Settings size={20} />
                </div>
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="p-1 rounded-full ring-2 ring-white/50 shadow-sm active:scale-95 transition-all bg-white/50 backdrop-blur-sm flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  <User size={20} />
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-40 scrollbar-hide relative z-10">
          {renderContent()}
        </div>

        {activeTab === 'itinerary' && (
          <div className="absolute bottom-24 right-6 z-20">
            <button
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center shadow-xl shadow-slate-300 hover:scale-110 hover:bg-black transition-all active:scale-95 text-white"
            >
              <Plus size={24} />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 w-full h-20 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around items-center px-4 pb-2 z-30">
          <button onClick={() => setActiveTab('itinerary')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'itinerary' ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
            <Menu size={20} strokeWidth={activeTab === 'itinerary' ? 3 : 2.5} />
            <span className="text-[9px] font-bold">行程</span>
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'map' ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
            <Navigation size={20} strokeWidth={activeTab === 'map' ? 3 : 2.5} />
            <span className="text-[9px] font-bold">導航</span>
          </button>
          <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'checklist' ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
            <ClipboardList size={20} strokeWidth={activeTab === 'checklist' ? 3 : 2.5} />
            <span className="text-[9px] font-bold">清單</span>
          </button>
          <button onClick={() => setActiveTab('expenses')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'expenses' ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
            <Wallet size={20} strokeWidth={activeTab === 'expenses' ? 3 : 2.5} />
            <span className="text-[9px] font-bold">記帳</span>
          </button>
          <button onClick={() => setActiveTab('info')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'info' ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
            <Info size={20} strokeWidth={activeTab === 'info' ? 3 : 2.5} />
            <span className="text-[9px] font-bold">資訊</span>
          </button>
        </div>
      </div>
    </div>
  );
}