import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoDialogService, PoNotificationService, PoTableColumn, PoTableLiterals, PoLoadingModule, PoWidgetModule, PoButtonModule, PoTableModule, PoModalModule, PoModalComponent, PoModalAction, PoFieldModule, PoIconModule, PoLookupColumn, PoGridModule } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { Usuario } from '../../interfaces/usuario';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { interval, Subscription } from 'rxjs';
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
      NgClass, RpwComponent, PoWidgetModule , 
      PoFieldModule  , 
      PoFieldModule, PoIconModule]

})
export class ResumoFinalComponent implements OnInit {
  private srvTotvs        = inject(TotvsService)
  private srvheader       = inject(TecLabLookupService)
  private srvTotvs46      = inject(TotvsService46)
  private srvDialog       = inject(PoDialogService)
  private srvNotification = inject(PoNotificationService)
  private router          = inject(ActivatedRoute)

  constructor(private cdr:      ChangeDetectorRef) {}
              
  @ViewChild('timer', { static: true }) telaTimer:
  | PoModalComponent
  | undefined;

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
  
  acaoCancelarTimer: PoModalAction = {
    action: () => {
      this.fecharTimer()
      
    },
    label: 'Fechar',
  };

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
        this.loadTelaConf = false
        this.cdr.detectChanges()
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
        this.loadTelaConf = false
        this.cdr.detectChanges()
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
  }

   //---Inicializar
   ngOnInit(): void {

    this.filtroPronto = false // Bloqueia Filtros
    this.cdr.detectChanges()

    this.srvTotvs.ObterCadastro({tabela: 'spool', codigo: '_esrr047'}).subscribe({
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
        
      }

    })
    this.colunasArquivos = this.srvTotvs.obterColunasArquivos()
    this.colunasBRR      = this.srvTotvs.obterColunasBRR()
    
    /*
    //Arquivo Gerado Conferencia
    this.loadTelaConf = true
    this.loadTelaRep  = true
    let params:any={nrProcess: '', situacao:'C'}
    this.srvTotvs.ObterArquivo(params).subscribe({
      next:(item:any)=>{
        if(item === null) return
        this.listaArquivosConf = item.items ?? null
      },
      complete: () => { 
        this.loadTelaConf = false
        this.loadTelaRep  = false
        this.cdr.detectChanges() 
      }
    })
    */

    /*
    //Arquivo Gerado Reparos
    let paramsRep:any={nrProcess: '', situacao:'R'}
    this.srvTotvs.ObterArquivo(paramsRep).subscribe({
      next:(item:any)=>{
        if(item === null) return
        this.listaRepBRR = item.items ?? null
      },
      complete: () => { 
        this.loadTelaRep = false
        this.cdr.detectChanges() 
      }
    })
    */

    this.cdr.detectChanges() 

  }

  /*
  onGerarResumo(){
     this.srvDialog.confirm({
      title: 'ARQUIVO CONFERÊNCIA DE OS',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> GERAR ARQUIVO ?</span></div>",
        confirm: () => {
          this.loadTela = true;
          let params:any={iExecucao:2, nrProcess:this.nrProcess}
          this.srvTotvs.ImprimirConfOS(params).subscribe({
            next:(response:any)=>{

              let params2:any={nrProcess: this.nrProcess, situacao:'L'}
              this.srvTotvs46.ObterArquivo(params2).subscribe({
                next:(item:any)=>{
                  if(item === null) return
                  this.listaArquivos = item.items ?? null
                }
              })

              this.loadTela = false;
              this.srvNotification.success('Gerado pedido de execução : ' + response.NumPedExec);
            },
            error: (e) => {
              this.loadTela = false;
            }})
        },
        cancel: () => {}
      });
  }
  */
   onImpressao() {
 /*

    this.srvDialog.confirm({
      title: 'ARQUIVO CONFERÊNCIA DE OS',
      literals: { cancel: 'Cancelar', confirm: 'Gerar Arquivo' },
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> GERAR ARQUIVO ?</span></div>",
      confirm: () => {
        this.numPedExec.update(()=> 1)
       // this.telaTimerFoiFechada = false
       // this.labelPedExec = ''
       // this.labelTimer = 'Gerando pedido de execução ...'
       // this.labelTimerDetail = ''
       // this.acaoCancelarTimer.label='Fechar'
       // this.telaTimer?.open()

        //this.loadTela = true;
        let params:any={iExecucao:2, nrProcess:this.nrProcess}
        this.srvTotvs.ImprimirConfOS(params).subscribe({
            next: (response: any) => {
             // this.labelPedExec = 'Pedido Execução'
             // this.labelTimer = 'Coletando informações do rpw...'
             

              //Arquivo Gerado
              let params2:any={nrProcess: this.nrProcess, situacao:'L'}
              this.srvTotvs46.ObterArquivo(params2).subscribe({
                   next: (item: any) => {
                this.listaArquivos = item.items;
                this.numPedExec.update(()=> response.NumPedExec)
               
              },
            });

            this.loadTela = false;
           
          },
          error: (e) => {
            this.loadTela = false;
          },
        });
      },
      cancel: () => {
       
      },
    });

  */
  }
    onFinalizar(){
  /*

    this.srvDialog.confirm({
      title: `FINALIZAR PROCESSO: ${this.nrProcess}`,
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA FINALIZAR O PROCESSO ?</span></div>",
        confirm: () => {
          this.loadTela = true;
          
          let params:any={codEstabel:this.codEstabel, nrProcess:this.nrProcess}
          this.srvTotvs.EncerrarProcesso(params).subscribe({
            next:(response:any)=>{
              this.loadTela = false;
              this.router.navigate(['monitor'])
            },
            error: (e) => {
              this.loadTela = false;
            }})
        },
        cancel: () => {}
      });



  */
   }
}
