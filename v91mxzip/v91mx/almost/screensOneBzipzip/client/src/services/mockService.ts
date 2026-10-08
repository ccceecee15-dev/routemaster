import productsData from '../data/mock_products.json';
import storesData from '../data/mock_stores.json';
import timeBucketsData from '../data/mock_time_buckets.json';

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  cost: number;
  price: number;
  ly_sales: number;
  plan_units: number;
  margin_percent: number;
  markdown_percent: number;
  stock_value: number;
  image: string;
  weekly_sales: number[];
}

export interface Store {
  store_id: string;
  name: string;
  format: string;
  capacity: number;
  footfall_index: number;
  region: string;
  safety_stock: number;
}

export interface TimeBucket {
  id: string;
  label: string;
  type: string;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockService {
  async getDashboardData(filters: any) {
    await delay(300);
    // Calculate aggregated KPI data based on products
    const totalSales = productsData.reduce((acc, p) => acc + (p.price * p.plan_units), 0);
    const lySales = productsData.reduce((acc, p) => acc + p.ly_sales, 0);
    const totalStock = productsData.reduce((acc, p) => acc + p.stock_value, 0);
    
    return {
      kpis: {
        totalSales: { value: totalSales, delta: ((totalSales - lySales) / lySales) * 100, trend: [10, 12, 11, 14, 13, 16, 18] },
        margin: { value: 58.5, delta: 1.2, trend: [55, 56, 57, 58, 58, 59, 58] },
        markdown: { value: 4.2, delta: -0.5, trend: [5, 4, 4, 3, 4, 5, 4] },
        stockValue: { value: totalStock, delta: 5.4, trend: [100, 105, 110, 108, 112, 115, 120] },
        gmroi: { value: 3.2, delta: 0.1, trend: [2.8, 2.9, 3.0, 3.1, 3.1, 3.2, 3.2] },
        openToBuy: { value: 150000, delta: -2.0, trend: [180, 170, 160, 155, 150, 145, 150] },
        // New KPIs
        ytdSales: { value: totalSales * 0.8, delta: 4.5, trend: [] },
        ytdMargin: { value: 57.2, delta: 0.8, trend: [] },
        yoyGrowth: { value: 6.8, delta: 1.2, trend: [] },
        sellThru: { value: 62.4, delta: 2.1, trend: [] },
        stockCover: { value: 12.5, delta: -1.5, trend: [] } // Weeks
      },
      categorySummary: this.groupProductsByCategory(),
      performanceData: this.generateDetailedPerformanceData(),
      weekTrendData: this.generateWeekTrendData(),
      periodTrendData: this.generatePeriodTrendData()
    };
  }

  private generateWeekTrendData() {
    return Array.from({ length: 52 }, (_, i) => {
      const week = i + 1;
      
      return {
        id: `w-${week}`,
        label: `Week ${week}`,
        type: 'week',
        
        // Sales Metrics
        sales_actual: Math.floor(Math.random() * 1000000),
        sales_cont_percent: (Math.random() * 15) - 5,
        sales_wow_percent: (Math.random() * 20) - 10,
        sales_ptd: Math.floor(Math.random() * 7000000),
        sales_ptd_ly_percent: (Math.random() * 20) - 5,
        sales_ptd_lfl_percent: (Math.random() * 10) + 20,
        sales_pop_percent: (Math.random() * 10) + 20,
        sales_yoy_percent: (Math.random() * 10) + 20,
        sales_yoy_lfl_percent: (Math.random() * 10) + 20,
        sales_ytd: Math.floor(Math.random() * 70000000),
        sales_ytd_ly_percent: (Math.random() * 20) - 5,
        sales_ytd_lfl_percent: (Math.random() * 10) + 20,
        cp_sales: Math.floor(Math.random() * 1000000),
        vs_cp_percent: (Math.random() * 20) - 10,
        ptd_vs_cp_percent: (Math.random() * 20) - 10,
        ytd_vs_cp_percent: (Math.random() * 20) - 10,

        // Margin Metrics
        margin_lw: Math.floor(Math.random() * 500000),
        margin_cont_percent: (Math.random() * 15) - 5,
        margin_percent: (Math.random() * 30) + 40,
        margin_wow_percent: (Math.random() * 10) - 5,
        margin_ptd: Math.floor(Math.random() * 2000000),
        margin_ptd_ly_percent: (Math.random() * 20) - 5,
        margin_ptd_lfl_percent: (Math.random() * 10) + 20,
        margin_pop_percent: (Math.random() * 10) + 20,
        margin_yoy_percent: (Math.random() * 10) + 20,
        margin_yoy_lfl_percent: (Math.random() * 10) + 20,
        margin_ytd: Math.floor(Math.random() * 20000000),
        margin_ytd_ly_percent: (Math.random() * 20) - 5,
        margin_ytd_lfl_percent: (Math.random() * 10) + 20,
      };
    });
  }

  private generatePeriodTrendData() {
    return Array.from({ length: 13 }, (_, i) => {
      const period = i + 1;
      
      return {
        id: `p-${period}`,
        label: `Period ${period}`,
        type: 'period',
        
        // Sales Metrics (period aggregates)
        sales_actual: Math.floor(Math.random() * 5000000),
        sales_cont_percent: (Math.random() * 15) - 5,
        sales_wow_percent: (Math.random() * 20) - 10,
        sales_ptd: Math.floor(Math.random() * 30000000),
        sales_ptd_ly_percent: (Math.random() * 20) - 5,
        sales_ptd_lfl_percent: (Math.random() * 10) + 20,
        sales_pop_percent: (Math.random() * 10) + 20,
        sales_yoy_percent: (Math.random() * 10) + 20,
        sales_yoy_lfl_percent: (Math.random() * 10) + 20,
        sales_ytd: Math.floor(Math.random() * 300000000),
        sales_ytd_ly_percent: (Math.random() * 20) - 5,
        sales_ytd_lfl_percent: (Math.random() * 10) + 20,
        cp_sales: Math.floor(Math.random() * 5000000),
        vs_cp_percent: (Math.random() * 20) - 10,
        ptd_vs_cp_percent: (Math.random() * 20) - 10,
        ytd_vs_cp_percent: (Math.random() * 20) - 10,

        // Margin Metrics
        margin_lw: Math.floor(Math.random() * 2000000),
        margin_cont_percent: (Math.random() * 15) - 5,
        margin_percent: (Math.random() * 30) + 40,
        margin_wow_percent: (Math.random() * 10) - 5,
        margin_ptd: Math.floor(Math.random() * 10000000),
        margin_ptd_ly_percent: (Math.random() * 20) - 5,
        margin_ptd_lfl_percent: (Math.random() * 10) + 20,
        margin_pop_percent: (Math.random() * 10) + 20,
        margin_yoy_percent: (Math.random() * 10) + 20,
        margin_yoy_lfl_percent: (Math.random() * 10) + 20,
        margin_ytd: Math.floor(Math.random() * 100000000),
        margin_ytd_ly_percent: (Math.random() * 20) - 5,
        margin_ytd_lfl_percent: (Math.random() * 10) + 20,
        
        // Nested weeks (4 weeks per period)
        weeks: Array.from({ length: 4 }, (_, w) => ({
          id: `p-${period}-w-${w+1}`,
          label: `Week ${(period - 1) * 4 + w + 1}`,
          type: 'week',
          sales_actual: Math.floor(Math.random() * 1000000),
          sales_cont_percent: (Math.random() * 15) - 5,
          sales_wow_percent: (Math.random() * 20) - 10,
          sales_ptd: Math.floor(Math.random() * 7000000),
          sales_ptd_ly_percent: (Math.random() * 20) - 5,
          sales_ptd_lfl_percent: (Math.random() * 10) + 20,
          sales_pop_percent: (Math.random() * 10) + 20,
          sales_yoy_percent: (Math.random() * 10) + 20,
          sales_yoy_lfl_percent: (Math.random() * 10) + 20,
          sales_ytd: Math.floor(Math.random() * 70000000),
          sales_ytd_ly_percent: (Math.random() * 20) - 5,
          sales_ytd_lfl_percent: (Math.random() * 10) + 20,
          cp_sales: Math.floor(Math.random() * 1000000),
          vs_cp_percent: (Math.random() * 20) - 10,
          ptd_vs_cp_percent: (Math.random() * 20) - 10,
          ytd_vs_cp_percent: (Math.random() * 20) - 10,
          
          margin_lw: Math.floor(Math.random() * 500000),
          margin_cont_percent: (Math.random() * 15) - 5,
          margin_percent: (Math.random() * 30) + 40,
          margin_wow_percent: (Math.random() * 10) - 5,
          margin_ptd: Math.floor(Math.random() * 2000000),
          margin_ptd_ly_percent: (Math.random() * 20) - 5,
          margin_ptd_lfl_percent: (Math.random() * 10) + 20,
          margin_pop_percent: (Math.random() * 10) + 20,
          margin_yoy_percent: (Math.random() * 10) + 20,
          margin_yoy_lfl_percent: (Math.random() * 10) + 20,
          margin_ytd: Math.floor(Math.random() * 20000000),
          margin_ytd_ly_percent: (Math.random() * 20) - 5,
          margin_ytd_lfl_percent: (Math.random() * 10) + 20,
        }))
      };
    });
  }

  private generateDetailedPerformanceData() {
    // Generating mock data for the detailed table
    // Categories to simulate
    const categories = [
        { name: "Stationery", type: "Standard" },
        { name: "Books", type: "Standard" },
        { name: "News & Mags", type: "Keyline" },
        { name: "Confectionery", type: "Keyline" },
        { name: "Drinks", type: "Standard" },
        { name: "Toys & Games", type: "Clearance" },
        { name: "Art & Craft", type: "Standard" }
    ];

    return categories.map(cat => ({
      id: cat.name.toLowerCase().replace(/\s/g, '-'),
      category: cat.name,
      type: cat.type,
      
      // Sales Metrics
      sales_actual: Math.floor(Math.random() * 50000) + 10000,
      sales_wow_percent: (Math.random() * 20) - 10,
      sales_ptd: Math.floor(Math.random() * 200000) + 50000,
      sales_pop_percent: (Math.random() * 15) - 5,
      sales_ptd_lfl_percent: (Math.random() * 10) - 2,
      sales_ytd: Math.floor(Math.random() * 1000000) + 200000,
      sales_yoy_percent: (Math.random() * 25) - 5,

      // Margin Metrics
      margin_wow_percent: (Math.random() * 5) - 2,
      margin_ptd: Math.floor(Math.random() * 100000) + 25000,
      margin_pop_percent: (Math.random() * 8) - 3,
      margin_ytd: Math.floor(Math.random() * 500000) + 100000,
      margin_yoy_percent: (Math.random() * 12) - 4,
      margin_ytd_lfl_percent: (Math.random() * 6) - 1,
      
      // Budget
      v_budget_margin_percent: (Math.random() * 15) - 7
    }));
  }

  private groupProductsByCategory() {
    const groups: Record<string, any> = {};
    
    productsData.forEach(p => {
      if (!groups[p.category]) {
        groups[p.category] = {
          id: p.category,
          name: p.category,
          ly_sales: 0,
          sales_plan: 0,
          margin_percent: 0,
          items: 0
        };
      }
      
      const g = groups[p.category];
      g.ly_sales += p.ly_sales;
      g.sales_plan += (p.price * p.plan_units);
      g.items += 1;
      // Weighted average for margin would be better, but simple avg for mock
      g.margin_percent = (g.margin_percent * (g.items - 1) + p.margin_percent) / g.items;
    });

    return Object.values(groups);
  }

  async getProducts(filters: any) {
    await delay(400);
    // In a real app, apply filters here
    let filtered = [...productsData];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (filters?.category) {
       filtered = filtered.filter(p => p.category === filters.category);
    }
    return filtered;
  }

  async getStores(filters: any) {
    await delay(300);
    return storesData;
  }

  async getTimeBuckets() {
    return timeBucketsData;
  }

  async applyBulkUpdate(ids: string[], changes: Partial<Product>) {
    await delay(500);
    console.log(`Applied changes to ${ids.length} items:`, changes);
    return { success: true, updatedIds: ids };
  }

  async getProductsData(filters: any) {
    await delay(300);
    const totalSales = productsData.reduce((acc, p) => acc + (p.price * p.plan_units), 0);
    const lySales = productsData.reduce((acc, p) => acc + p.ly_sales, 0);

    return {
      kpis: {
        ytdSales: { value: totalSales * 0.8, delta: 4.5, trend: [] },
        ytdMargin: { value: 57.2, delta: 0.8, trend: [] },
        yoyGrowth: { value: 6.8, delta: 1.2, trend: [] },
      },
      productTableData: productsData.slice(0, 20).map((p, i) => ({
        id: `prod-${i}`,
        label: p.name,
        sales_actual: Math.floor(Math.random() * 1000000),
        sales_cont_percent: (Math.random() * 15) - 5,
        sales_wow_percent: (Math.random() * 20) - 10,
        sales_ptd: Math.floor(Math.random() * 7000000),
        sales_ptd_ly_percent: (Math.random() * 20) - 5,
        sales_ptd_lfl_percent: (Math.random() * 10) + 20,
        sales_pop_percent: (Math.random() * 10) + 20,
        sales_yoy_percent: (Math.random() * 10) + 20,
        sales_yoy_lfl_percent: (Math.random() * 10) + 20,
        sales_ytd: Math.floor(Math.random() * 70000000),
        sales_ytd_ly_percent: (Math.random() * 20) - 5,
        sales_ytd_lfl_percent: (Math.random() * 10) + 20,
        cp_sales: Math.floor(Math.random() * 1000000),
        vs_cp_percent: (Math.random() * 20) - 10,
        ptd_vs_cp_percent: (Math.random() * 20) - 10,
        ytd_vs_cp_percent: (Math.random() * 20) - 10,
        margin_lw: Math.floor(Math.random() * 500000),
        margin_cont_percent: (Math.random() * 15) - 5,
        margin_percent: (Math.random() * 30) + 40,
        margin_wow_percent: (Math.random() * 10) - 5,
        margin_ptd: Math.floor(Math.random() * 2000000),
        margin_ptd_ly_percent: (Math.random() * 20) - 5,
        margin_ptd_lfl_percent: (Math.random() * 10) + 20,
        margin_pop_percent: (Math.random() * 10) + 20,
        margin_yoy_percent: (Math.random() * 10) + 20,
        margin_yoy_lfl_percent: (Math.random() * 10) + 20,
        margin_ytd: Math.floor(Math.random() * 20000000),
        margin_ytd_ly_percent: (Math.random() * 20) - 5,
        margin_ytd_lfl_percent: (Math.random() * 10) + 20,
      }))
    };
  }

  async getStoresData(filters: any) {
    await delay(300);
    const storeCount = Math.min(storesData.length, 15);

    return {
      kpis: {
        ytdSales: { value: 42500000, delta: 3.2, trend: [] },
        ytdMargin: { value: 58.9, delta: 1.1, trend: [] },
        yoyGrowth: { value: 5.4, delta: 0.8, trend: [] },
      },
      storeTableData: storesData.slice(0, storeCount).map((s, i) => ({
        id: `store-${i}`,
        label: `${s.name} (${s.store_id})`,
        sales_actual: Math.floor(Math.random() * 1500000),
        sales_cont_percent: (Math.random() * 15) - 5,
        sales_wow_percent: (Math.random() * 20) - 10,
        sales_ptd: Math.floor(Math.random() * 8000000),
        sales_ptd_ly_percent: (Math.random() * 20) - 5,
        sales_ptd_lfl_percent: (Math.random() * 10) + 20,
        sales_pop_percent: (Math.random() * 10) + 20,
        sales_yoy_percent: (Math.random() * 10) + 20,
        sales_yoy_lfl_percent: (Math.random() * 10) + 20,
        sales_ytd: Math.floor(Math.random() * 75000000),
        sales_ytd_ly_percent: (Math.random() * 20) - 5,
        sales_ytd_lfl_percent: (Math.random() * 10) + 20,
        cp_sales: Math.floor(Math.random() * 1500000),
        vs_cp_percent: (Math.random() * 20) - 10,
        ptd_vs_cp_percent: (Math.random() * 20) - 10,
        ytd_vs_cp_percent: (Math.random() * 20) - 10,
        margin_lw: Math.floor(Math.random() * 600000),
        margin_cont_percent: (Math.random() * 15) - 5,
        margin_percent: (Math.random() * 30) + 40,
        margin_wow_percent: (Math.random() * 10) - 5,
        margin_ptd: Math.floor(Math.random() * 2500000),
        margin_ptd_ly_percent: (Math.random() * 20) - 5,
        margin_ptd_lfl_percent: (Math.random() * 10) + 20,
        margin_pop_percent: (Math.random() * 10) + 20,
        margin_yoy_percent: (Math.random() * 10) + 20,
        margin_yoy_lfl_percent: (Math.random() * 10) + 20,
        margin_ytd: Math.floor(Math.random() * 25000000),
        margin_ytd_ly_percent: (Math.random() * 20) - 5,
        margin_ytd_lfl_percent: (Math.random() * 10) + 20,
      }))
    };
  }
}

export const mockService = new MockService();
