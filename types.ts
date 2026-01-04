export interface TripMeta {
  title: string;
  startDate: string;
  endDate: string;
}

export interface ItineraryItem {
  id: string;
  title: string;
  category: string;
  time: string;
  address: string;
  addressKR?: string;
  budget?: string;
  aiInsight?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  category: 'luggage' | 'shopping';
}

export interface ExpenseItem {
  id: string;
  title: string;
  amountKRW: number;
  amountTWD: number;
  date: string;
  category: string;
  exchangeRate: number;
}

export interface FlightDetail {
  airline: string;
  flightNumber: string;
  time: string;
  terminal: string;
}

export interface FlightInfo {
  outbound: FlightDetail;
  inbound: FlightDetail;
}

export interface HotelInfo {
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  bookingRef: string;
}

export interface User {
  uid: string;
  username: string;
}

export interface WeatherData {
  id: string;
  day: string;
  date: string;
  fullDate: string;
  tempHigh?: number;
  tempLow?: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'unknown';
}

export type TabType = 'itinerary' | 'map' | 'checklist' | 'expenses' | 'info';

declare global {
  var __firebase_config: string;
  var __app_id: string;
  var __initial_auth_token: string | undefined;
}