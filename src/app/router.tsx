import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { HomePage } from '@/routes/index';
import { CasinoPage } from '@/routes/casino';
import { ShopPage } from '@/routes/shop';
import { SettingsPage } from '@/routes/settings';

const rootRoute = createRootRoute({
  component: AppShell,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const casinoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/casino',
  component: CasinoPage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: ShopPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  casinoRoute,
  shopRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
