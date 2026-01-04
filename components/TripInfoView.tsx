import React from 'react';
import { CalendarDays, Plane, Hotel, MapPin, Clock, Hash, FileText } from 'lucide-react';
import { FlightInfo, HotelInfo } from '../types';

interface TripInfoViewProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  flightInfo: FlightInfo;
  onFlightChange: (info: FlightInfo) => void;
  hotelInfo: HotelInfo;
  onHotelChange: (info: HotelInfo) => void;
}

const TripInfoView: React.FC<TripInfoViewProps> = ({
  startDate, endDate, onDateChange,
  flightInfo, onFlightChange,
  hotelInfo, onHotelChange
}) => {

  const handleOutboundChange = (field: keyof typeof flightInfo.outbound, value: string) => {
    onFlightChange({
      ...flightInfo,
      outbound: { ...(flightInfo?.outbound || { airline: '', flightNumber: '', time: '', terminal: '' }), [field]: value }
    });
  };

  const handleInboundChange = (field: keyof typeof flightInfo.inbound, value: string) => {
    onFlightChange({
      ...flightInfo,
      inbound: { ...(flightInfo?.inbound || { airline: '', flightNumber: '', time: '', terminal: '' }), [field]: value }
    });
  };

  const handleHotelUpdate = (field: keyof HotelInfo, value: string) => {
    onHotelChange({ ...(hotelInfo || { name: '', address: '', checkIn: '', checkOut: '', bookingRef: '' }), [field]: value });
  };

  return (
    <div className="px-6 py-6 flex flex-col gap-6 pb-24">
      <h2 className="text-2xl font-black text-slate-800">旅程資訊</h2>

      {/* Date Section */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold text-sm">
          <CalendarDays size={18} />
          <span>日期設定</span>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">出發 (Departure)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateChange(e.target.value, endDate)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">回程 (Return)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateChange(startDate, e.target.value)}
              min={startDate}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Flight Section */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-sm">
          <Plane size={18} />
          <span>航班資訊</span>
        </div>

        {/* Outbound */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">去程 (Outbound)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <div className="relative">
                <Plane size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="航空公司" value={flightInfo?.outbound?.airline || ''} onChange={e => handleOutboundChange('airline', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-indigo-100" />
              </div>
            </div>
            <div>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="航班號" value={flightInfo?.outbound?.flightNumber || ''} onChange={e => handleOutboundChange('flightNumber', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-indigo-100" />
              </div>
            </div>
            <div>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="起飛時間" value={flightInfo?.outbound?.time || ''} onChange={e => handleOutboundChange('time', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-indigo-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Inbound */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">回程 (Inbound)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <div className="relative">
                <Plane size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="航空公司" value={flightInfo?.inbound?.airline || ''} onChange={e => handleInboundChange('airline', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-orange-100" />
              </div>
            </div>
            <div>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="航班號" value={flightInfo?.inbound?.flightNumber || ''} onChange={e => handleInboundChange('flightNumber', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-orange-100" />
              </div>
            </div>
            <div>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="起飛時間" value={flightInfo?.inbound?.time || ''} onChange={e => handleInboundChange('time', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-orange-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Section */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold text-sm">
          <Hotel size={18} />
          <span>住宿資訊</span>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Hotel size={14} className="absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="飯店名稱" value={hotelInfo?.name || ''} onChange={e => handleHotelUpdate('name', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-emerald-100" />
          </div>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="飯店地址" value={hotelInfo?.address || ''} onChange={e => handleHotelUpdate('address', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-emerald-100" />
          </div>
          <div className="relative">
            <FileText size={14} className="absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="訂房代號 / 備註" value={hotelInfo?.bookingRef || ''} onChange={e => handleHotelUpdate('bookingRef', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-emerald-100" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-bold mb-1 block">Check-in</label>
              <input type="text" placeholder="15:00" value={hotelInfo?.checkIn || ''} onChange={e => handleHotelUpdate('checkIn', e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-emerald-100" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-bold mb-1 block">Check-out</label>
              <input type="text" placeholder="11:00" value={hotelInfo?.checkOut || ''} onChange={e => handleHotelUpdate('checkOut', e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-emerald-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripInfoView;