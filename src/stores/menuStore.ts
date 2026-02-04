import { create } from 'zustand';
import { 
  Menu, 
  MenuItem, 
  MenuAnalytics,
  POSConnection,
  POSProvider,
  Allergen
} from '@/types/menu';

// Empty initial state - no mock data
const initialMenus: Menu[] = [];

// POS connections
const initialPOSConnections: POSConnection[] = [
  { id: 'pos-1', provider: 'lightspeed', displayName: 'Lightspeed', isConnected: false },
  { id: 'pos-2', provider: 'square', displayName: 'Square', isConnected: false },
  { id: 'pos-3', provider: 'toast', displayName: 'Toast', isConnected: false },
  { id: 'pos-4', provider: 'clover', displayName: 'Clover', isConnected: false },
  { id: 'pos-5', provider: 'revel', displayName: 'Revel', isConnected: false },
];

interface MenuStore {
  menus: Menu[];
  activeMenu: Menu | null;
  posConnections: POSConnection[];
  selectedPOS: POSConnection | null;

  // Menu CRUD
  getActiveMenu: () => Menu | null;
  getArchivedMenus: () => Menu[];
  createMenu: (name: string, basedOnMenuId?: string) => Menu;
  archiveMenu: (menuId: string) => void;
  activateMenu: (menuId: string) => void;
  updateMenuItem: (menuId: string, item: MenuItem) => void;
  addMenuItem: (menuId: string, item: MenuItem) => void;
  deleteMenuItem: (menuId: string, itemId: string) => void;

  // Analytics
  getMenuAnalytics: (menuId: string) => MenuAnalytics;
  getItemProfitability: (item: MenuItem, avgPopularity: number, avgMargin: number) => MenuItem['profitability'];

  // POS
  connectPOS: (provider: POSProvider, credentials: any) => void;
  disconnectPOS: (connectionId: string) => void;

  // Allergen filtering
  filterDishesByAllergens: (customerAllergens: Allergen[]) => { safe: MenuItem[]; unsafe: MenuItem[] };
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  menus: initialMenus,
  activeMenu: initialMenus.find(m => m.status === 'active') || null,
  posConnections: initialPOSConnections,
  selectedPOS: null,

  getActiveMenu: () => {
    return get().menus.find(m => m.status === 'active') || null;
  },

  getArchivedMenus: () => {
    return get().menus.filter(m => m.status === 'archived');
  },

  createMenu: (name: string, basedOnMenuId?: string) => {
    const { menus } = get();
    const baseMenu = basedOnMenuId ? menus.find(m => m.id === basedOnMenuId) : null;
    
    const newMenu: Menu = {
      id: `menu-${Date.now()}`,
      name,
      version: 1,
      status: 'draft',
      effectiveFrom: new Date(),
      avgFoodCostPercent: baseMenu?.avgFoodCostPercent || 0,
      totalItems: baseMenu?.items.length || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: baseMenu?.items.map(item => ({ ...item, id: `item-${Date.now()}-${Math.random()}`, menuId: `menu-${Date.now()}` })) || [],
    };

    set({ menus: [...menus, newMenu] });
    return newMenu;
  },

  archiveMenu: (menuId: string) => {
    set(state => ({
      menus: state.menus.map(m => 
        m.id === menuId 
          ? { ...m, status: 'archived' as const, effectiveTo: new Date() }
          : m
      ),
      activeMenu: state.activeMenu?.id === menuId ? null : state.activeMenu,
    }));
  },

  activateMenu: (menuId: string) => {
    set(state => ({
      menus: state.menus.map(m => ({
        ...m,
        status: m.id === menuId ? 'active' as const : (m.status === 'active' ? 'archived' as const : m.status),
        effectiveTo: m.status === 'active' && m.id !== menuId ? new Date() : m.effectiveTo,
      })),
      activeMenu: state.menus.find(m => m.id === menuId) || null,
    }));
  },

  updateMenuItem: (menuId: string, item: MenuItem) => {
    set(state => ({
      menus: state.menus.map(m => 
        m.id === menuId 
          ? { 
              ...m, 
              items: m.items.map(i => i.id === item.id ? item : i),
              updatedAt: new Date(),
            }
          : m
      ),
    }));
  },

  addMenuItem: (menuId: string, item: MenuItem) => {
    set(state => ({
      menus: state.menus.map(m => 
        m.id === menuId 
          ? { 
              ...m, 
              items: [...m.items, item],
              totalItems: m.items.length + 1,
              updatedAt: new Date(),
            }
          : m
      ),
    }));
  },

  deleteMenuItem: (menuId: string, itemId: string) => {
    set(state => ({
      menus: state.menus.map(m => 
        m.id === menuId 
          ? { 
              ...m, 
              items: m.items.filter(i => i.id !== itemId),
              totalItems: m.items.length - 1,
              updatedAt: new Date(),
            }
          : m
      ),
    }));
  },

  getMenuAnalytics: (menuId: string) => {
    const menu = get().menus.find(m => m.id === menuId);
    if (!menu) {
      return {
        menuId,
        period: { start: new Date(), end: new Date() },
        avgFoodCostPercent: 0,
        totalRevenue: 0,
        totalFoodCost: 0,
        grossProfit: 0,
        topSellers: [],
        underperformers: [],
        categoryBreakdown: [],
      };
    }

    const totalRevenue = menu.items.reduce((sum, item) => sum + (item.sellPrice * item.popularity), 0);
    const totalFoodCost = menu.items.reduce((sum, item) => sum + (item.foodCost * item.popularity), 0);

    const topSellers = [...menu.items]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5)
      .map(item => ({
        itemId: item.id,
        name: item.name,
        sales: item.popularity,
        revenue: item.sellPrice * item.popularity,
      }));

    const underperformers = menu.items
      .filter(item => item.profitability === 'dog')
      .map(item => ({
        itemId: item.id,
        name: item.name,
        sales: item.popularity,
        reason: item.foodCostPercent > 30 ? 'High food cost' : 'Low sales',
      }));

    const categoryBreakdown = Object.entries(
      menu.items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { revenue: 0, totalCost: 0, count: 0 };
        }
        acc[item.category].revenue += item.sellPrice * item.popularity;
        acc[item.category].totalCost += item.foodCost * item.popularity;
        acc[item.category].count += 1;
        return acc;
      }, {} as Record<string, { revenue: number; totalCost: number; count: number }>)
    ).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      foodCostPercent: data.revenue > 0 ? (data.totalCost / data.revenue) * 100 : 0,
      itemCount: data.count,
    }));

    return {
      menuId,
      period: { start: menu.effectiveFrom, end: menu.effectiveTo || new Date() },
      avgFoodCostPercent: menu.avgFoodCostPercent,
      totalRevenue,
      totalFoodCost,
      grossProfit: totalRevenue - totalFoodCost,
      topSellers,
      underperformers,
      categoryBreakdown,
    };
  },

  getItemProfitability: (item: MenuItem, avgPopularity: number, avgMargin: number) => {
    const isHighPopularity = item.popularity >= avgPopularity;
    const isHighMargin = item.contributionMargin >= avgMargin;

    if (isHighPopularity && isHighMargin) return 'star';
    if (isHighPopularity && !isHighMargin) return 'plow-horse';
    if (!isHighPopularity && isHighMargin) return 'puzzle';
    return 'dog';
  },

  connectPOS: (provider: POSProvider, credentials: any) => {
    set(state => ({
      posConnections: state.posConnections.map(c => 
        c.provider === provider 
          ? { ...c, isConnected: true, lastSync: new Date(), credentials }
          : c
      ),
      selectedPOS: state.posConnections.find(c => c.provider === provider) || null,
    }));
  },

  disconnectPOS: (connectionId: string) => {
    set(state => ({
      posConnections: state.posConnections.map(c => 
        c.id === connectionId 
          ? { ...c, isConnected: false, credentials: undefined }
          : c
      ),
      selectedPOS: state.selectedPOS?.id === connectionId ? null : state.selectedPOS,
    }));
  },

  filterDishesByAllergens: (customerAllergens: Allergen[]) => {
    const activeMenu = get().getActiveMenu();
    if (!activeMenu) return { safe: [], unsafe: [] };

    const safe: MenuItem[] = [];
    const unsafe: MenuItem[] = [];

    activeMenu.items.forEach(item => {
      const hasAllergen = item.allergens.some(a => customerAllergens.includes(a));
      if (hasAllergen) {
        unsafe.push(item);
      } else {
        safe.push(item);
      }
    });

    return { safe, unsafe };
  },
}));
