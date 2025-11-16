import { Routes } from '@angular/router';
import { Planung } from './pages/planung/planung';
import { LoginMain } from './login/login-main/login-main';
import { Dashboard } from './pages/dashboard/dashboard';
import { Planung2 } from './pages/planung2/planung2';
import { Planung3 } from './pages/planung3/planung3';
import { Planung4 } from './pages/planung4/planung4';
import { authGuard } from './login/guards/auth-guard';
import { Sidebar } from './sidebar/sidebar';
import { WeekPlanner } from './pages/weekplanner/week-planner/week-planner';
import { WPSettings } from './pages/weekplanner/wpsettings/wpsettings';

export const routes: Routes = [

{ path:'', redirectTo: 'loginMain', pathMatch: 'full' },
    { path:'loginMain', component: LoginMain },
          { path: '', component: Sidebar, canActivate: [authGuard],
            children:
            [
                { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
                { path: 'planung', component: Planung, title: 'Planung' },
                { path: 'planung2', component: Planung2, title: 'Planung2' },
                { path: 'planung3', component: Planung3, title: 'Planung3' },
                { path: 'planung4', component: Planung4, title: 'Planung4' },
                { path: 'weekplanner', component: WeekPlanner, title: 'Week Planner' },
                { path: 'wpsettings', component: WPSettings, title: 'Wochenplaner Einstellungen' }
            ]   
    },
];