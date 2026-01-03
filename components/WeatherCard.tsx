import React from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { WeatherData } from '../types';

const WeatherIcon = ({ condition, size = 24 }: { condition: string, size?: number }) => {
  switch (condition) {
    case 'sunny': return <Sun size={size} color="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />;
    case 'rainy': return <CloudRain size={size} color="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />;
    case 'cloudy': return <Cloud size={size} color="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />;
    default: return <Sun size={size} color="#CBD5E1" />; 
  }
};

interface WeatherCardProps {
  item: WeatherData;
  isSelected: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ item, isSelected }) => (
  <div className={`flex-shrink-0 w-[4.5rem] py-3 rounded-2xl mx-1.5 flex flex-col items-center justify-between transition-all duration-300 cursor-pointer ${isSelected ? 'bg-blue-600 shadow-lg shadow-blue-200 scale-105' : 'bg-white hover:bg-gray-50 border border-slate-100'}`}>
    <span className={`text-[10px] font-medium tracking-wide ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{item.day}</span>
    <span className={`text-xs font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-700'}`}>{item.date}</span>
    
    <div className="mb-2 transform transition-transform">
      {isSelected ? (
         item.condition === 'sunny' ? <Sun size={24} color="white" fill="white" fillOpacity={0.3} /> : 
         item.condition === 'rainy' ? <CloudRain size={24} color="white" fill="white" fillOpacity={0.3} /> : 
         item.condition === 'cloudy' ? <Cloud size={24} color="white" fill="white" fillOpacity={0.3} /> :
         <Sun size={24} color="white" />
      ) : (
        <WeatherIcon condition={item.condition} size={24} />
      )}
    </div>
    
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-sm font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-700'}`}>
        {item.tempHigh !== undefined ? `${Math.round(item.tempHigh)}°` : '--'}
      </span>
      <span className={`text-[10px] font-medium leading-none ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
        {item.tempLow !== undefined ? `${Math.round(item.tempLow)}°` : '--'}
      </span>
    </div>
  </div>
);

export default WeatherCard;