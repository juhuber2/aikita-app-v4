import { Routes } from '@angular/router';
import { Planung } from './pages/planung/planung';
import { LoginMain } from './login/login-main/login-main';
import { Dashboard } from './pages/dashboard/dashboard';
import { Planung2 } from './pages/planung2/planung2';
import { Planung3 } from './pages/planung3/planung3';

export const routes: Routes = [

{ path:'', redirectTo: 'dashboard', pathMatch: 'full' }, //Default-Route
    { path:'loginMain', component: LoginMain },
    { path:'',
        //component: Layout,
        //canActivate: [authGuard],
            children:
            [
                { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
                { path: 'planung', component: Planung, title: 'Planung' },
                { path: 'planung2', component: Planung2, title: 'Planung2' },
                { path: 'planung3', component: Planung3, title: 'Planung3' }
            ]   
    },
];