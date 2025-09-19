import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';

/**
 * Stub controller to handle all missing API endpoints
 * Returns mock data to prevent 404 errors in frontend
 */
@Controller()
export class ApiStubController {
  
  // Finance endpoints
  @Get('finance/bank')
  getBankAccounts() {
    return {
      accounts: [],
      total: 0
    };
  }

  @Get('finance/transactions')
  getTransactions() {
    return {
      transactions: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    };
  }

  @Get('finance/revenue')
  getRevenue() {
    return {
      revenue: [],
      total: 0,
      summary: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
      }
    };
  }

  @Get('finance/expenses')
  getExpenses() {
    return {
      expenses: [],
      total: 0,
      categories: []
    };
  }

  // Projects endpoints
  @Get('projects')
  getProjects() {
    return {
      projects: [],
      total: 0
    };
  }

  @Get('projects/tasks')
  getTasks() {
    return {
      tasks: [],
      total: 0
    };
  }

  @Get('projects/:id')
  getProject(@Param('id') id: string) {
    return {
      id,
      name: 'Mock Project',
      tasks: [],
      status: 'active'
    };
  }

  // Inventory endpoints
  @Get('inventory')
  getInventory() {
    return {
      items: [],
      categories: [],
      total: 0
    };
  }

  @Get('inventory/products')
  getProducts() {
    return {
      products: [],
      total: 0
    };
  }

  @Get('inventory/movements')
  getMovements() {
    return {
      movements: [],
      total: 0
    };
  }

  // Staff endpoints
  @Get('staff')
  getStaff() {
    return {
      staff: [],
      departments: [],
      total: 0
    };
  }

  @Get('staff/schedule')
  getSchedule() {
    return {
      schedule: [],
      shifts: []
    };
  }

  // Dashboard endpoints
  @Get('dashboard/stats')
  getDashboardStats() {
    return {
      revenue: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
      },
      orders: {
        pending: 0,
        completed: 0,
        cancelled: 0
      },
      inventory: {
        lowStock: 0,
        outOfStock: 0,
        total: 0
      },
      staff: {
        active: 0,
        onLeave: 0,
        total: 0
      }
    };
  }

  @Get('dashboard/metrics')
  getMetrics() {
    return {
      metrics: [],
      period: 'daily'
    };
  }

  // Settings endpoints
  @Get('settings')
  getSettings() {
    return {
      general: {},
      notifications: {},
      security: {}
    };
  }

  @Put('settings')
  updateSettings(@Body() settings: any) {
    return {
      success: true,
      settings
    };
  }

  // Users endpoints
  @Get('users')
  getUsers() {
    return {
      users: [],
      total: 0
    };
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return {
      id,
      email: 'user@example.com',
      name: 'User',
      role: 'user'
    };
  }

  // Notifications
  @Get('notifications')
  getNotifications() {
    return {
      notifications: [],
      unread: 0
    };
  }

  // Reports
  @Get('reports')
  getReports() {
    return {
      reports: [],
      total: 0
    };
  }

  @Get('reports/generate')
  generateReport(@Query() query: any) {
    return {
      success: true,
      reportId: 'mock-report-id',
      status: 'generating'
    };
  }
}
