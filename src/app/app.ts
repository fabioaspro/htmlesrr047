import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';

import { PoMenuComponent, poThemeDefault, PoMenuItem, PoMenuModule, PoToolbarModule, PoPageModule, PoTagModule, PoButtonComponent, PoButtonModule, PoThemeService, PoThemeTypeEnum, PoThemeA11yEnum, PoToolbarAction, PoModalComponent, PoModalModule } from '@po-ui/ng-components';
import { Subscription } from 'rxjs';
import { TotvsService } from './services/totvs-service.service';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
//import { PoButtonBaseComponent } from '@po-ui/ng-components/lib/components/po-button/po-button-base.component';
import { TotvsService46 } from './services/totvs-service-46.service';
import { environment } from './environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [PoMenuModule, NgIf, PoToolbarModule, PoPageModule, RouterOutlet, PoTagModule, PoButtonModule, PoModalModule],
})
export class AppComponent implements OnInit {
  private srvTotvs = inject(TotvsService);
  private srvTotvs46 = inject(TotvsService46);
  private cdRef = inject(ChangeDetectorRef);

  constructor(private themeService: PoThemeService,
              private sanitizer:    DomSanitizer
  ) {
    this.themeService.setTheme(poThemeDefault, PoThemeTypeEnum.light, PoThemeA11yEnum.AA)
    this.themeService.setA11yDefaultSizeSmall(true)
  }

  @ViewChild('menuLateral', { static: true }) menuLateral:
    | PoMenuComponent
    | undefined;

  versao!: string

  //--------- Opcoes de Menu
  readonly menus: Array<PoMenuItem> = [
    {
      label: 'DashBoard',
      icon: 'bi bi-house',
      link: '/home',
      shortLabel: 'Home'
    },
     {
      label: 'Resumo Final',
      icon: 'bi bi-printer',
      link: '/resumofinal',
      shortLabel: 'rensumofinal',
    },
    {
      label: 'Relatório',
      icon: 'bi bi-printer',
      link: '/relmovto',
      shortLabel: 'Relatório de Reparos da Nota',
    },
    {
      label: 'Envio para Histórico',
      icon: 'bi bi-database-up',
      link: '/envhist',
      shortLabel: 'Envio para Histórico',
    },
   
    /*
    {
      label: 'Atendimento',
      icon: 'bi bi-clipboard-check',
      link: '/',
      shortLabel: 'Atendimento',
      subItems: [
        { label: 'Requisição (CD1409)',        action: () => this.AbrirProgramaTotvs('ftp/ft0904.w') },
        { label: 'Monitor Avançado (ESAA072)', action: () => this.AbrirProgramaTotvs('esp/esaa072.w') },
        { label: 'Carga Dados GFE (CD9125)',   action: () => this.AbrirProgramaTotvs('cdp/cd9125.w') }
      ]
    },
    {
      label: 'Danfe (FT0518)',
      icon: 'bi bi-printer',
      shortLabel: 'FT0518',
      action: () => this.AbrirProgramaTotvs('ftp/ft0518.w'),
    },
    {
      label: 'Consulta Nota (FT0904)',
      icon: 'bi bi-file-earmark-text',
      shortLabel: 'FT0904',
      action: () => this.AbrirProgramaTotvs('ftp/ft0904.w'),
    },
    
    */
    
    /* não usando por enquanto
    {
      label: 'Pedidos',
      icon: 'bi bi-clipboard-check',
      link: '/',
      shortLabel: 'Pedidos',
      subItems: [
        { label: 'Total de Pedidos', link: 'http://trabalho.gov.br/' },
        { label: 'Pendentes', link: 'http://trabalho.gov.br/' },
        { label: 'Consolidados', link: 'http://www.sindpd.com.br/' }
      ]
    },
    {
      label: 'Impressão',
      icon: 'bi bi-printer',
      link: '/',
      shortLabel: 'Impressão',
      subItems: [
        { label: 'Pedidos', link: 'http://trabalho.gov.br/' },
        { label: 'Consolidação', link: 'http://www.sindpd.com.br/' }
      ]
    }
    nao usando por enquanto  */
    /*,
    {
      label: 'Informe Ordem de Serviço',
      icon: 'bi bi-clipboard-data',
      link: '/informe2',
      shortLabel: 'Informe2',
    },
    {
      label: 'Cálculo Auto Atendimento',
      icon: 'bi bi-calculator',
      link: '/calculo',
      shortLabel: 'Cálculo',
    },
    {
      label: 'Monitor Processos',
      icon: 'bi bi-display',
      link: '/monitor',
      shortLabel: 'Monitor Processos',
    },
    

    {
      label: 'Itens x Localiza (ESAA002)',
      icon: 'bi bi-printer',
      shortLabel: 'ESAA002',
      action: () => this.AbrirProgramaTotvs('esp/esaa002.w'),
    },
    {
      label: 'Reimpressão Reparos (ESAA059)',
      icon: 'bi bi-upc-scan',
      shortLabel: 'ESAA059',
      action: () => this.AbrirProgramaTotvs('esp/esaa059.w'),
    },
    */
    /* 
    {
      label: 'Emprestimos',
      icon: 'bi bi-upc-scan',
      shortLabel: 'Emprestimos',
      action: () => this.AbrirProgramaTotvs('totvs-menu/program-html/htmla41'),
    },
    
   
    {
      label: 'Refactory Calculo',
      icon: 'bi bi-file-earmark-text',
      link: '/calculo-step',
      shortLabel: 'Calculo Step',
    },
    {
      label: 'Seletor',
      icon: 'bi bi-file-earmark-text',
      link: '/seletor',
      shortLabel: 'Calculo Step',
    }, */
  ];


  readonly toolbarActions: Array<PoToolbarAction> = [
      {
        icon: 'bi bi-book',
        label: 'Manual do Usuário',
        action: this.abrirAjuda.bind(this)
      },
      {
        icon: 'bi bi-file-earmark-code',
        label: 'Documentação Técnica',
        action: this.abrirDocto.bind(this)
      }
  ]
  
  //---Funcionar o visualizar PDF
  pdfUrl?: SafeResourceUrl | undefined

  abrirAjuda() {
    const fileUrl = 'assets/docs/ManualTransbordo.pdf'
  
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl)
    this.pdfModal?.open()
  }

  abrirDocto() {
    const fileUrl = 'assets/docs/TecnicoTransbordo.pdf'
  
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl)
    this.pdfModal?.open()
  }

  @ViewChild('pdfModal', { static: true }) pdfModal: PoModalComponent | undefined
  
  //------ Label de menu principal
  tecnicoInfo!: string;
  estabInfo!: string;
  processoInfo!: string;
  processoSituacao!: string;
  tituloTela!: string;
  dashboard: boolean = false;
  abrirMenu: boolean = false;
  abrirSeletor: boolean = false;
  teste: number = 8;

  private sub!: Subscription;

  AbrirProgramaTotvs(programa: string) {
    let params: any = { program: programa, params: '' };
    this.srvTotvs.AbrirProgramaTotvs(params).subscribe({
      next: (response: any) => { },
      error: (e) => { },
    });
  }
  
  ngOnInit(): void {
    //versao
    this.versao = environment.versao

    //Informacoes iniciais tela
    //this.srvTotvs.EmitirParametros({ tituloTela: this.versao + ' - Retorno e Conclusão de Reparos Externos]', abrirMenu: false })


    this.estabInfo = '';
    this.sub = this.srvTotvs.LerParametros().subscribe({
      next: (response: any) => {
        this.estabInfo = response.estabInfo ?? this.estabInfo;
        this.tecnicoInfo = response.tecInfo ?? this.tecnicoInfo;
        this.processoInfo = response.processoInfo ?? this.processoInfo;
        this.processoSituacao = response.processoSituacao ?? this.processoSituacao;
        this.tituloTela = response.tituloTela ?? this.tituloTela;
        this.dashboard = response.dashboard ?? this.dashboard;
        this.abrirMenu = response.abrirMenu ?? true;

        if (this.abrirMenu) this.menuLateral?.expand();
        else this.menuLateral?.collapse();

        this.cdRef.detectChanges();
      },
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }
}
