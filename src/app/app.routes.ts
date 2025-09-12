import { Routes } from '@angular/router';
import { Planung } from './pages/planung/planung';
import { LoginMain } from './login/login-main/login-main';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [

{ path:'', redirectTo: 'dashboard', pathMatch: 'full' }, //Default-Route
    { path:'loginMain', component: LoginMain },
    { path:'',
        //component: Layout,
        //canActivate: [authGuard],
            children:
            [
                { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
                { path: 'planung', component: Planung, title: 'Planung' }
            ]   
    },
];