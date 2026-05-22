import type { RegisterNewsRoutesDeps } from './news-routes/types.ts'
import { registerFinancialJuiceRoutes } from './news-routes/financialjuice.ts'
import { registerWebNewsModuleRoutes } from './news-routes/web-news-module.ts'

export async function registerNewsRoutes(deps: RegisterNewsRoutesDeps) {
  registerFinancialJuiceRoutes(deps)
  registerWebNewsModuleRoutes(deps)
}
