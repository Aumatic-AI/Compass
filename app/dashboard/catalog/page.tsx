import { loadDashboardConfig } from '@/lib/dashboard-config';
import { getRawProducts } from '@/lib/dashboard-data';
import CatalogManager from '@/components/CatalogManager';

export default async function CatalogPage() {
  const config = loadDashboardConfig();
  const products = await getRawProducts();

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">{config.catalogLabel}</div>
          <div className="panel-sub">Grouped by {config.catalogGroupBy} · edit, delete, or toggle availability</div>
        </div>
      </div>
      <CatalogManager initialProducts={products} config={config} />
    </div>
  );
}
