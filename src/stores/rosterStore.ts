import { create } from 'zustand';
import { 
  RosterConnection, 
  RosterProvider,
  StaffMember,
  Shift,
  DailyRoster,
  LinePrepList,
  LinePrepTask
} from '@/types/menu';

// Mock staff data
const initialStaff: StaffMember[] = [
  { id: 'staff-1', name: 'Maria Santos', role: 'head-chef', email: 'maria@restaurant.com', phone: '0412 345 678' },
  { id: 'staff-2', name: 'James Wilson', role: 'sous-chef', email: 'james@restaurant.com', phone: '0423 456 789' },
  { id: 'staff-3', name: 'Alex Chen', role: 'line-cook', email: 'alex@restaurant.com', phone: '0434 567 890' },
  { id: 'staff-4', name: 'Sarah Brown', role: 'line-cook', email: 'sarah@restaurant.com', phone: '0445 678 901' },
  { id: 'staff-5', name: 'Tom Garcia', role: 'prep-cook', email: 'tom@restaurant.com', phone: '0456 789 012' },
  { id: 'staff-6', name: 'Emily Davis', role: 'line-cook', email: 'emily@restaurant.com', phone: '0467 890 123' },
];

// Mock shifts for today
const today = new Date();
const initialShifts: Shift[] = [
  { id: 'shift-1', staffId: 'staff-1', staffName: 'Maria Santos', role: 'head-chef', date: today, startTime: '06:00', endTime: '15:00', station: 'Exec', status: 'in-progress' },
  { id: 'shift-2', staffId: 'staff-2', staffName: 'James Wilson', role: 'sous-chef', date: today, startTime: '07:00', endTime: '16:00', station: 'Hot', status: 'in-progress' },
  { id: 'shift-3', staffId: 'staff-3', staffName: 'Alex Chen', role: 'line-cook', date: today, startTime: '08:00', endTime: '17:00', station: 'Grill', status: 'in-progress' },
  { id: 'shift-4', staffId: 'staff-4', staffName: 'Sarah Brown', role: 'line-cook', date: today, startTime: '14:00', endTime: '23:00', station: 'Sauté', status: 'scheduled' },
  { id: 'shift-5', staffId: 'staff-5', staffName: 'Tom Garcia', role: 'prep-cook', date: today, startTime: '05:00', endTime: '14:00', station: 'Prep', status: 'in-progress' },
  { id: 'shift-6', staffId: 'staff-6', staffName: 'Emily Davis', role: 'line-cook', date: today, startTime: '15:00', endTime: '00:00', station: 'Pastry', status: 'scheduled' },
];

// Mock line prep lists
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const initialLinePrepLists: LinePrepList[] = [
  {
    id: 'lpl-1',
    createdBy: 'Alex Chen',
    createdByRole: 'line-cook',
    forDate: tomorrow,
    shift: 'AM',
    station: 'Grill',
    status: 'submitted',
    submittedAt: new Date(),
    tasks: [
      { id: 'lpt-1', task: 'Portion ribeyes', quantity: 24, unit: 'steaks', priority: 'high' },
      { id: 'lpt-2', task: 'Make chimichurri', quantity: 2, unit: 'L', recipeName: 'Chimichurri Sauce', priority: 'medium' },
      { id: 'lpt-3', task: 'Prep asparagus bundles', quantity: 48, unit: 'bundles', priority: 'medium' },
    ],
  },
  {
    id: 'lpl-2',
    createdBy: 'Sarah Brown',
    createdByRole: 'line-cook',
    forDate: tomorrow,
    shift: 'AM',
    station: 'Sauté',
    status: 'draft',
    tasks: [
      { id: 'lpt-4', task: 'Prep mushroom mix', quantity: 3, unit: 'kg', priority: 'high' },
      { id: 'lpt-5', task: 'Make risotto base', quantity: 4, unit: 'batches', recipeName: 'Mushroom Risotto', priority: 'high' },
    ],
  },
];

// Roster connections
const initialRosterConnections: RosterConnection[] = [
  { id: 'roster-1', provider: 'deputy', displayName: 'Deputy', isConnected: false },
  { id: 'roster-2', provider: 'employment-hero', displayName: 'Employment Hero', isConnected: false },
  { id: 'roster-3', provider: 'tanda', displayName: 'Tanda', isConnected: false },
  { id: 'roster-4', provider: 'planday', displayName: 'Planday', isConnected: false },
];

interface RosterStore {
  staff: StaffMember[];
  shifts: Shift[];
  linePrepLists: LinePrepList[];
  rosterConnections: RosterConnection[];
  selectedRosterProvider: RosterConnection | null;

  // Roster
  getDailyRoster: (date: Date) => DailyRoster;
  getStaffOnDuty: () => StaffMember[];
  connectRoster: (provider: RosterProvider, credentials: any) => void;
  disconnectRoster: (connectionId: string) => void;

  // Line Prep Lists
  createLinePrepList: (list: Omit<LinePrepList, 'id' | 'status' | 'submittedAt'>) => LinePrepList;
  submitLinePrepList: (listId: string) => void;
  approveLinePrepList: (listId: string, reviewedBy: string, notes?: string) => void;
  rejectLinePrepList: (listId: string, reviewedBy: string, notes: string) => void;
  getLinePrepListsForDate: (date: Date) => LinePrepList[];
  getPendingLinePrepLists: () => LinePrepList[];
}

export const useRosterStore = create<RosterStore>((set, get) => ({
  staff: initialStaff,
  shifts: initialShifts,
  linePrepLists: initialLinePrepLists,
  rosterConnections: initialRosterConnections,
  selectedRosterProvider: null,

  getDailyRoster: (date: Date) => {
    const { shifts, staff } = get();
    const dateStr = date.toDateString();
    const dayShifts = shifts.filter(s => s.date.toDateString() === dateStr);

    const byRole = Object.entries(
      dayShifts.reduce((acc, shift) => {
        acc[shift.role] = (acc[shift.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([role, count]) => ({ role, count }));

    return {
      date,
      shifts: dayShifts,
      totalStaff: dayShifts.length,
      byRole,
    };
  },

  getStaffOnDuty: () => {
    const { shifts, staff } = get();
    const now = new Date();
    const currentHour = now.getHours();
    const todayStr = now.toDateString();

    const onDutyIds = shifts
      .filter(shift => {
        if (shift.date.toDateString() !== todayStr) return false;
        const startHour = parseInt(shift.startTime.split(':')[0]);
        const endHour = parseInt(shift.endTime.split(':')[0]);
        return currentHour >= startHour && currentHour < endHour;
      })
      .map(s => s.staffId);

    return staff.filter(s => onDutyIds.includes(s.id));
  },

  connectRoster: (provider: RosterProvider, credentials: any) => {
    set(state => ({
      rosterConnections: state.rosterConnections.map(c => 
        c.provider === provider 
          ? { ...c, isConnected: true, lastSync: new Date() }
          : c
      ),
      selectedRosterProvider: state.rosterConnections.find(c => c.provider === provider) || null,
    }));
  },

  disconnectRoster: (connectionId: string) => {
    set(state => ({
      rosterConnections: state.rosterConnections.map(c => 
        c.id === connectionId 
          ? { ...c, isConnected: false }
          : c
      ),
      selectedRosterProvider: state.selectedRosterProvider?.id === connectionId ? null : state.selectedRosterProvider,
    }));
  },

  createLinePrepList: (listData) => {
    const newList: LinePrepList = {
      ...listData,
      id: `lpl-${Date.now()}`,
      status: 'draft',
    };
    set(state => ({ linePrepLists: [...state.linePrepLists, newList] }));
    return newList;
  },

  submitLinePrepList: (listId: string) => {
    set(state => ({
      linePrepLists: state.linePrepLists.map(l => 
        l.id === listId 
          ? { ...l, status: 'submitted' as const, submittedAt: new Date() }
          : l
      ),
    }));
  },

  approveLinePrepList: (listId: string, reviewedBy: string, notes?: string) => {
    set(state => ({
      linePrepLists: state.linePrepLists.map(l => 
        l.id === listId 
          ? { ...l, status: 'approved' as const, reviewedBy, reviewedAt: new Date(), reviewNotes: notes }
          : l
      ),
    }));
  },

  rejectLinePrepList: (listId: string, reviewedBy: string, notes: string) => {
    set(state => ({
      linePrepLists: state.linePrepLists.map(l => 
        l.id === listId 
          ? { ...l, status: 'rejected' as const, reviewedBy, reviewedAt: new Date(), reviewNotes: notes }
          : l
      ),
    }));
  },

  getLinePrepListsForDate: (date: Date) => {
    const dateStr = date.toDateString();
    return get().linePrepLists.filter(l => l.forDate.toDateString() === dateStr);
  },

  getPendingLinePrepLists: () => {
    return get().linePrepLists.filter(l => l.status === 'submitted');
  },
}));
