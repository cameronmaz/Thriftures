import { X } from 'lucide-react';
import './SaleFilter.css';

interface SaleFilterProps {
  filters: {
    garageSales: boolean;
    estateSales: boolean;
    thriftStores: boolean;
    fleaMarkets: boolean;
    consignmentShops: boolean;
    other?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export default function SaleFilter({ filters, onFiltersChange, onClose }: SaleFilterProps) {
  const filterOptions = [
    { key: 'garageSales', name: 'Garage Sales', color: '#14B8A6' },
    { key: 'estateSales', name: 'Estate Sales', color: '#8B5CF6' },
    { key: 'thriftStores', name: 'Thrift Stores', color: '#F97316' },
    { key: 'fleaMarkets', name: 'Flea Markets', color: '#EF4444' },
    { key: 'consignmentShops', name: 'Consignment Shops', color: '#3B82F6' },
    { key: 'other', name: 'Other Sales', color: '#6B7280' },
  ];

  const toggleFilter = (key: string) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key as keyof typeof filters],
    });
  };

  const selectAll = () => {
    const allTrue = filterOptions.reduce((acc, option) => {
      acc[option.key] = true;
      return acc;
    }, {} as any);
    onFiltersChange(allTrue);
  };

  const clearAll = () => {
    const allFalse = filterOptions.reduce((acc, option) => {
      acc[option.key] = false;
      return acc;
    }, {} as any);
    onFiltersChange(allFalse);
  };

  return (
    <div className="filter-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-header">
          <h2 className="filter-title">Filter Sales</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-button" onClick={selectAll}>
            Select All
          </button>
          <button className="action-button" onClick={clearAll}>
            Clear All
          </button>
        </div>

        {/* Filter Options */}
        <div className="filters-container">
          <h3 className="section-title">Sale Types</h3>
          {filterOptions.map((option) => (
            <div key={option.key} className="filter-item">
              <div className="filter-info">
                <div 
                  className="color-indicator"
                  style={{ backgroundColor: option.color }}
                />
                <span className="filter-name">{option.name}</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={filters[option.key as keyof typeof filters] || false}
                  onChange={() => toggleFilter(option.key)}
                />
                <span 
                  className="slider"
                  style={{
                    backgroundColor: filters[option.key as keyof typeof filters] ? option.color : '#E5E7EB'
                  }}
                />
              </label>
            </div>
          ))}
        </div>

        {/* Apply Button */}
        <button className="apply-button" onClick={onClose}>
          Apply Filters
        </button>
      </div>
    </div>
  );
}