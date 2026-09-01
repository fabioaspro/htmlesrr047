import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoDialogService, PoNotificationService, PoTableColumn, PoTableLiterals, PoLoadingModule, PoWidgetModule, PoButtonModule, PoTableModule, PoModalModule, PoModalComponent, PoModalAction, PoFieldModule, PoIconModule, PoLookupColumn, PoGridModule, PoInfoModule, PoTableComponent, PoToolbarModule, PoToolbarAction } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { Usuario } from '../../interfaces/usuario';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { filter, interval, Subscription, tap } from 'rxjs';
import { RpwComponent } from "../rpw/rpw.component";
import { environment } from '../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TecLabLookupService } from '../../services/header-lookup.service';


@Component({
    selector: 'app-resumo-final',
    templateUrl: './resumo-final.component.html',
    styleUrl: './resumo-final.component.css',
    standalone: true,
    imports: [NgIf, PoLoadingModule, PoGridModule,
    FormsModule,
    ReactiveFormsModule, PoWidgetModule, CommonModule,
    PoButtonModule,
    PoTableModule, BtnDownloadComponent, PoModalModule,
    NgClass, RpwComponent, PoWidgetModule,
    PoFieldModule,
    PoFieldModule, PoIconModule, PoInfoModule, PoToolbarModule]

})
export class ResumoFinalComponent implements OnInit {
  private srvTotvs        = inject(TotvsService)
  private srvheader       = inject(TecLabLookupService)
  private srvTotvs46      = inject(TotvsService46)
  private srvDialog       = inject(PoDialogService)
  private srvNotification = inject(PoNotificationService)
  private router          = inject(ActivatedRoute)
  private subAcompanhamento: any

  constructor(private cdr:      ChangeDetectorRef) {}
              
  @ViewChild('timer', { static: true }) telaTimer: | PoModalComponent | undefined
  @ViewChild('reprintModal', { static: true }) telareprintReparo: | PoModalComponent | undefined
  @ViewChild('gridModal')  gridModal!:           PoTableComponent 

  itemsRep: any[] = [];
  selectedItems: any[] = [];

  filters = {
    filial: '',
    reparo: '',
    item: '',
    descricao: ''
  }

  //---Filtro
  placeHolderEstabelecimento!: string
  listaEstabelecimentos!:       any[]
  listaTecnicos!:               any[]
  codEstabelecimento:          string = ''
  codigoEmitente!:             number
  codEmitente:                 string = ''
  nrNotaFis:                   string = '' 
  serie:                       string = ''
  cMensagemErroRPW                    = ''
  cMensagemErroRPWReparo              = ''
  versao:                      string = ''
  tituloTela:                  string = ''

  filtroPronto: boolean = false

  EmitenteService             = this.srvheader

  //polookup
  columns: PoLookupColumn[] = [
  { property: 'codEmitente', label: 'Código' },
  { property: 'nomeAbrev', label: 'Nome' }
]

  numPedExec=signal(0)
  arquivoInfoOS:string=''
  urlInfoOs:string=''
  urlSpool:string=''
  listaArquivos!:any[]
  listaRepBRR: any[] = []
  listaArquivosConf:any[] = []

  colunasArquivos!: PoTableColumn[]
  colunasBRR!: PoTableColumn[]
  colunasRep!: PoTableColumn[]

  nrProcess:string=''
  codEstabel:string=''
  loadTela:boolean=false
  loadTelaConf:boolean=false
  loadTelaRep:boolean=false

  labelLoadTela:string='Aguarde a liberação do arquivo...'
  labelPedExec:string=''
  labelTimer:string=''
  labelTimerDetail:string=''
  telaTimerFoiFechada:boolean=false
  sub!: Subscription
  
  customLiteralsArq: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados',
    loadMoreData: 'Carregar mais',
    loadingData: 'Buscando Arquivo '
  }
  
  //--- Actions
  readonly toolbarActions: Array<PoToolbarAction> = [
    {
      icon: 'bi bi-book',
      label: 'Manual do Usuário',
      //action: this.abrirAjuda.bind(this)
    },
    {
      icon: 'bi bi-file-earmark-code',
      label: 'Documentação Técnica',
      //action: this.abrirDocto.bind(this)
    },
    {
      icon: 'bi bi-bullseye',
      label: 'Escopo',
      //action: this.abrirEscopo.bind(this)
    }
  ];
  
  reprintAction = {
    label: 'Reimprimir Selecionados',
    action: () => this.imprimirRPW(),
    disabled: () => this.selectedItems.length === 0
  }

  primaryAction = {
    label: 'Imprimir via RPW',
    action: () => this.imprimirRPW()
  }

  cancelAction = {
    label: 'Cancelar',
    action: () => this.telareprintReparo?.close()
  }

  acaoCancelarTimer: PoModalAction = {
    action: () => {
      this.fecharTimer()
      
    },
    label: 'Fechar',
  };

  get totalSelecionados(): number {
    return this.itemsRep.filter(i => i.$selected).length;
  }
  // CARGA MOCK (substituir pela API)
  loadReparos() {

    this.itemsRep = this.listaRepBRR
    
    this.selectedItems = [];
  }

  // LIMPAR FILTRO
  clearFilters() {
    this.filters = {
      filial: '',
      reparo: '',
      item: '',
      descricao: ''
    };
  }
  
  imprimirRPW (): void {

    const selecionados = this.itemsRep.filter(item => item.$selected);

    if (!selecionados.length) {
      this.srvNotification.warning('Selecione ao menos um reparo.');
      return;
    }

    // Chamada da API RPW
    //onImprimirRep
    //Inicializar acompanhamento rpw
    this.numPedExec.update(() => 1)

    const params = {
                    params: [{
                      codEstabelecimento: this.codEstabelecimento,
                      codEmitente:        this.codEmitente,
                      nrNotaFis:          this.nrNotaFis,
                      serie:              this.serie,
                      printEtiq:          "",
                      ativaLog:           ""
                    }],
                    items: this.gridModal.getSelectedRows()
    }
    
    this.subAcompanhamento = this.srvTotvs.onImprimirRep(params)
      .pipe(
        tap(() => this.loadTela = false),
        filter((response: any) => response?.concluidos?.length > 0)
      )
      .subscribe({
        next: (response: any) => {

          if (response?.pedExec !== undefined) {
            this.numPedExec.update(() => response.pedExec)
          } else {
            this.numPedExec.update(() => 0)
            
          }

          // ✅ terminou o processo
          if (response?.pedExec !== undefined) {

            this.onBuscaArqRep()
          }

        },
        error: (err) => {
          this.loadTela = false;
          this.srvNotification.error('Erro no acompanhamento');
        },
        complete: () => { 
        }
      })

    this.closeModal()
  }

  onBuscaArqRep(){

    //Arquivo Gerado Conferencia
    let paramsTela = this.codEstabelecimento + this.codEmitente + this.nrNotaFis //+ this.serie

    let paramsReparos:any={nrProcess: paramsTela, situacao:'ESRR047REP'}
    this.srvTotvs.ObterArquivo(paramsReparos).subscribe({
      next:(item:any)=>{
        if(item === null) return
        //this.listaArquivosConf = item.items ?? null

        let paramsrpwReparo:any={iPedExec: item.items[0].numPedExec}
        this.srvTotvs.onObterRPW(paramsrpwReparo).subscribe({
          next:(response:any)=>{
            this.cMensagemErroRPWReparo = "Pedido: " + item.items[0].numPedExec + " - " + response.cpedExec  //response.rpw[0].mensagemRPW
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.srvNotification.error(e.message)
            return
          }
        })
      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      },
      complete: () => { 
        setTimeout(() => {
          this.loadTelaConf = false
          this.cdr.detectChanges()
        }, 0)
      }
    })

  }
  fecharTimer(){
    if(this.sub !== undefined){
       this.sub.unsubscribe()
    }
    this.telaTimer?.close()
    this.telaTimerFoiFechada=true
  }

  //--- Função para ordenar
  //Utilize o - (menos) para indicar ordenacao descendente
  ordenarCampos = (fields: any[]) => (a: { [x: string]: number; }, b: { [x: string]: number; }) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o = o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
  }).reduce((p, n) => p ? p : n, 0)
  //--- Função para Ordenar

  Selecionar(){

    if (!this.codEstabelecimento) {
      this.srvNotification.warning('Informe o Estabelecimento.')
      return
    }

    if (!this.codEmitente) {
      this.srvNotification.warning('Informe o Emitente.')
      return
    }

    if (!this.nrNotaFis) {
      this.srvNotification.warning('Informe a NF.')
      return
    }

    if (!this.serie) {
      this.srvNotification.warning('Informe a Série.')
      return
    }

    this.loadTelaConf      = true
    this.filtroPronto      = false // Bloqueia Filtros
    this.listaArquivosConf = []
    this.listaRepBRR       = []

    this.cdr.detectChanges()

    //Arquivo Gerado Conferencia
    let paramsTela = this.codEstabelecimento + this.codEmitente + this.nrNotaFis //+ this.serie

    let params:any={nrProcess: paramsTela, situacao:'ESRR047'}
    this.srvTotvs.ObterArquivo(params).subscribe({
      next:(item:any)=>{
        if(item === null) return
        this.listaArquivosConf = item.items ?? null

        let paramsrpw:any={iPedExec: item.items[0].numPedExec}
        this.srvTotvs.onObterRPW(paramsrpw).subscribe({
          next:(response:any)=>{
            this.cMensagemErroRPW = "Pedido: " + item.items[0].numPedExec + " - " + response.cpedExec  //response.rpw[0].mensagemRPW
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.srvNotification.error(e.message)
            return
          }
        })

      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      },
      complete: () => { 
        setTimeout(() => {
          this.loadTelaConf = false
          this.cdr.detectChanges()
        }, 0)
      }
    })

    let paramsReparos:any={nrProcess: paramsTela, situacao:'ESRR047REP'}
    this.srvTotvs.ObterArquivo(paramsReparos).subscribe({
      next:(item:any)=>{
        if(item === null) return
        //this.listaArquivosConf = item.items ?? null

        let paramsrpwReparo:any={iPedExec: item.items[0].numPedExec}
        this.srvTotvs.onObterRPW(paramsrpwReparo).subscribe({
          next:(response:any)=>{
            this.cMensagemErroRPWReparo = "Pedido: " + item.items[0].numPedExec + " - " + response.cpedExec  //response.rpw[0].mensagemRPW
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.srvNotification.error(e.message)
            return
          }
        })
      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      },
      complete: () => { 
        setTimeout(() => {
          this.loadTelaConf = false
          this.cdr.detectChanges()
        }, 0)
      }
    })

    //Arquivo Gerado Reparos - aqui carregar lista do que fez BRR
    this.loadTelaRep       = true
    let paramsRep: any = {items: [{codEstabelecimento: this.codEstabelecimento,
                                   codEmitente: this.codEmitente,
                                   nrNotaFis: this.nrNotaFis,
                                   serie: this.serie
                                  }
                                  ]
                          }
    this.srvTotvs.ObterBRR(paramsRep).subscribe({
      next:(item:any)=>{
        if(item === null) return
        this.listaRepBRR = item.repBRR ?? null
      },
      error: (e) => {
        this.srvNotification.error(e.message)
        this.filtroPronto       = true // ✅ liberou a tela
        return
      },
      complete: () => { 
        this.loadTelaRep   = false
        this.filtroPronto  = true // ✅ liberou a tela
        this.cdr.detectChanges() 
      }
    })    

  }

  //--- Limpar Filtros
  limparFiltros(){

    //this.filtro = { ...this.filtroPadrao }
    this.codEstabelecimento = ""
    this.codEmitente        = ""
    this.serie              = ""
    this.nrNotaFis          = ""
    this.listaArquivosConf  = []
    this.cdr.detectChanges()

  }


  // ABRIR MODAL
  openReprintModal() {
    this.loadReparos()
    this.telareprintReparo?.open()
  }

  // FECHAR
  closeModal() {
    this.telareprintReparo?.close()
  }


   //---Inicializar
   ngOnInit(): void {

    //versao
    this.versao     = environment.versao
    this.tituloTela = this.versao + " - HTMLESRR047 - RETORNO E CONCLUSÃO DE REPAROS EXTERNOS"

    this.filtroPronto = false // Bloqueia Filtros
    this.cdr.detectChanges()

    this.srvTotvs.ObterCadastro({tabela: 'spool', codigo: '_htmlESRR047'}).subscribe({
        next: (response: any) => {
          this.urlSpool = response.desc
        }})

    //Carregar combo de estabelecimentos
    this.placeHolderEstabelecimento = 'Aguarde, carregando lista...'
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {

        //Carrega combo com a lista de estabelecimentos
        this.listaEstabelecimentos = (response as any[]).sort(this.ordenarCampos(['label']))

        //Seta label dos combos
        this.placeHolderEstabelecimento = 'Selecione um estabelecimento'
        this.cdr.detectChanges()
      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      },
      complete: () => {
          this.router.queryParams.subscribe(params => {
          this.codEstabelecimento = params['estabelecimento'] || '';
          this.codEmitente        = params['emitente'] || '';
          this.nrNotaFis          = params['nf'] || '';
          this.serie              = params['serie'] || '';

          this.cdr.detectChanges()

          if (this.codEstabelecimento && this.codEmitente) {
            this.Selecionar()
          }
        })

        this.filtroPronto       = true // ✅ liberou a tela
        this.cdr.detectChanges()

      }

    })
    this.colunasArquivos = this.srvTotvs.obterColunasArquivos()
    this.colunasBRR      = this.srvTotvs.obterColunasBRR()
    this.colunasRep      = this.srvTotvs.obterColunasBRR()
    this.cdr.detectChanges()

  }
    
}
