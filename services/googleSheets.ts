import axios from 'axios';
import { TripMeta, ItineraryItem, FlightInfo, HotelInfo, ChecklistItem, ExpenseItem } from '../types';

const GAS_WEBAPP_URL = import.meta.env.VITE_GAS_WEBAPP_URL;

interface SheetData {
    meta: TripMeta;
    itinerary: ItineraryItem[];
    logistics: {
        flights: FlightInfo;
        hotel: HotelInfo;
    };
    checklists: ChecklistItem[];
    expenses: ExpenseItem[];
}

export const fetchSheetData = async (uid: string): Promise<SheetData> => {
    const response = await axios.get(`${GAS_WEBAPP_URL}?uid=${uid}`);
    return response.data;
};

export const updateSheetData = async (action: string, payload: any, uid?: string) => {
    try {
        const response = await axios.post(GAS_WEBAPP_URL, {
            action,
            payload,
            uid,
        }, {
            headers: {
                'Content-Type': 'text/plain', // GAS requires text/plain for POST sometimes to avoid CORS preflight
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update Google Sheets:', error);
        throw error;
    }
};

/**
 * Optimistic Update Wrapper
 * @param localUpdateFn - Function to update local state immediately
 * @param remoteUpdateFn - Function to call the API
 * @param rollbackFn - Function to restore state if API fails
 */
export const withOptimisticUpdate = async (
    localUpdateFn: () => void,
    remoteUpdateFn: () => Promise<any>,
    rollbackFn: () => void
) => {
    localUpdateFn();
    try {
        await remoteUpdateFn();
    } catch (error) {
        rollbackFn();
        alert('同步失敗，正在回復資料...');
    }
};
