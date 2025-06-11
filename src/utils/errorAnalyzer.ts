// Error Analysis and Monitoring System for YouTube Comment Analyzer

export interface ErrorReport {
  id: string;
  timestamp: Date;
  type: 'compilation' | 'runtime' | 'api' | 'build' | 'import';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  component?: string;
  userAction?: string;
  context?: Record<string, unknown>;
  resolved?: boolean;
  resolution?: string;
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'warning' | 'error' | 'critical';
  lastChecked: Date;
  errors: ErrorReport[];
  performance: {
    renderTime: number;
    memoryUsage: number;
    reRenderCount: number;
  };
}

export class ErrorAnalyzer {
  private static instance: ErrorAnalyzer;
  private errors: ErrorReport[] = [];
  private componentHealth: Map<string, ComponentHealth> = new Map();
  private listeners: ((error: ErrorReport) => void)[] = [];

  static getInstance(): ErrorAnalyzer {
    if (!ErrorAnalyzer.instance) {
      ErrorAnalyzer.instance = new ErrorAnalyzer();
    }
    return ErrorAnalyzer.instance;
  }

  // Register error
  reportError(error: Partial<ErrorReport>): string {
    const errorReport: ErrorReport = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'runtime',
      severity: 'medium',
      message: 'Unknown error',
      resolved: false,
      ...error,
    };

    this.errors.push(errorReport);
    this.notifyListeners(errorReport);
    this.updateComponentHealth(errorReport);

    return errorReport.id;
  }

  // Analyze import/export errors specifically
  analyzeImportExportErrors(): ErrorReport[] {
    const importExportErrors: ErrorReport[] = [];

    // UserManagementTab specific issue
    const userManagementTabError: ErrorReport = {
      id: 'umt-export-001',
      timestamp: new Date(),
      type: 'import',
      severity: 'high',
      message: 'UserManagementTab default export not found',
      file: 'src/components/tabs/UserManagementTab.tsx',
      line: 507,
      component: 'UserManagementTab',
      context: {
        issue: 'Default export missing or malformed',
        affectedFiles: [
          'src/components/layout/MainLayout.tsx',
          'src/components/tabs/UserManagementTab.tsx'
        ],
      },
      resolved: false,
      resolution: 'Add both named and default export to ensure compatibility',
    };

    importExportErrors.push(userManagementTabError);
    return importExportErrors;
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
  } {
    return {
      total: this.errors.length,
      byType: this.errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: this.errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      resolved: this.errors.filter(e => e.resolved).length,
      unresolved: this.errors.filter(e => !e.resolved).length,
    };
  }

  // Mark error as resolved
  resolveError(errorId: string, resolution: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolution = resolution;
      return true;
    }
    return false;
  }

  // Get component health report
  getComponentHealth(component?: string): ComponentHealth | ComponentHealth[] {
    if (component) {
      return this.componentHealth.get(component) || this.createDefaultHealth(component);
    }
    return Array.from(this.componentHealth.values());
  }

  // Subscribe to error events
  onError(callback: (error: ErrorReport) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  // Generate error report
  generateReport(): {
    summary: string;
    stats: {
      total: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      resolved: number;
      unresolved: number;
    };
    criticalErrors: ErrorReport[];
    recommendations: string[];
  } {
    const stats = this.getErrorStats();
    const criticalErrors = this.errors.filter(e => e.severity === 'critical' && !e.resolved);
    
    const recommendations: string[] = [];
    
    if (stats.byType.import > 0) {
      recommendations.push('Review import/export statements for consistency');
    }
    
    if (stats.byType.build > 0) {
      recommendations.push('Check build configuration and dependencies');
    }
    
    if (criticalErrors.length > 0) {
      recommendations.push('Address critical errors immediately to prevent build failures');
    }

    return {
      summary: `Found ${stats.total} errors (${stats.unresolved} unresolved). ${criticalErrors.length} critical issues require immediate attention.`,
      stats,
      criticalErrors,
      recommendations,
    };
  }

  private notifyListeners(error: ErrorReport): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  private updateComponentHealth(error: ErrorReport): void {
    if (!error.component) return;

    const health = this.componentHealth.get(error.component) || this.createDefaultHealth(error.component);
    health.errors.push(error);
    health.lastChecked = new Date();
    
    // Update status based on error severity
    if (error.severity === 'critical') {
      health.status = 'critical';
    } else if (error.severity === 'high' && health.status !== 'critical') {
      health.status = 'error';
    } else if (error.severity === 'medium' && !['critical', 'error'].includes(health.status)) {
      health.status = 'warning';
    }

    this.componentHealth.set(error.component, health);
  }

  private createDefaultHealth(component: string): ComponentHealth {
    return {
      component,
      status: 'healthy',
      lastChecked: new Date(),
      errors: [],
      performance: {
        renderTime: 0,
        memoryUsage: 0,
        reRenderCount: 0,
      },
    };
  }
}

// Export utility functions
export const reportError = (error: Partial<ErrorReport>): string => {
  return ErrorAnalyzer.getInstance().reportError(error);
};

export const getErrorStats = () => {
  return ErrorAnalyzer.getInstance().getErrorStats();
};

export const generateErrorReport = () => {
  return ErrorAnalyzer.getInstance().generateReport();
};

export default ErrorAnalyzer;