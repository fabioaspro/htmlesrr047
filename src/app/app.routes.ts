

import { Routes } from "@angular/router";

export const routes: Routes=[
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path:'home',    loadComponent:()=> import('./components/home/home.component').then(c=>c.HomeComponent)},
    {path:'resumofinal', loadComponent:()=> import('../app/components/resumo-final/resumo-final.component').then(c=>c.ResumoFinalComponent)},
    
    /*
    {path:'home',    loadComponent:()=> import('./components/home/home.component').then(c=>c.HomeComponent)},
    {path:'relmovto',loadComponent:()=> import('./components/relmovto/relmovto.component').then(c=>c.RelmovtoComponent)},
    {path:'envhist', loadComponent:()=> import('../app/envhist/envhist.component').then(c=>c.EnvhistComponent)},
    {path:'resumofinal', loadComponent:()=> import('../app/components/resumo-final/resumo-final.component').then(c=>c.ResumoFinalComponent)},
    {path:'informe2', loadComponent:()=> import('../app/components/informe2/informe2.component').then(c=>c.Informe2Component)},
    {path:'dashboard', loadComponent:()=> import('../app/components/dashboard/dashboard.component').then(c=>c.DashboardComponent)},
    {path:'calculo', loadComponent:()=> import('../app/components/calculo/calculo.component').then(c=>c.CalculoComponent)},
    {path:'paramestab', loadComponent:()=> import('../app/components/paramestab/paramestab.component').then(c=>c.ParamestabComponent)},
    {path:'paramestab', loadComponent:()=> import('../app/components/paramestab/paramestab.component').then(c=>c.ParamestabComponent)},
    {path:'embalagem', loadComponent:()=> import('../app/components/embalagem/embalagem.component').then(c=>c.EmbalagemComponent)},
    {path:'reparos', loadComponent:()=> import('../app/components/reparos/reparos.component').then(c=>c.ReparosComponent)},
    {path:'monitor', loadComponent:()=> import('../app/components/monitor-processos/monitor-processos.component').then(c=>c.MonitorProcessosComponent)},
    {path:'resumofinal', loadComponent:()=> import('../app/components/resumo-final/resumo-final.component').then(c=>c.ResumoFinalComponent)},
    {path:'seletor', loadComponent:()=> import('../app/components/seletor/seletor.component').then(c=>c.SeletorComponent)},
    */
];
