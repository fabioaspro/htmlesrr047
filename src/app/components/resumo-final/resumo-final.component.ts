import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PoDialogService, PoNotificationService, PoTableColumn, PoTableLiterals, PoLoadingModule, PoWidgetModule, PoButtonModule, PoTableModule, PoModalModule, PoModalComponent, PoModalAction, PoFieldModule, PoIconModule, PoLookupColumn } from '@po-ui/ng-components';
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
    imports: [NgIf, PoLoadingModule, FormsModule,    ReactiveFormsModule, PoWidgetModule, CommonModule, PoButtonModule, PoTableModule, BtnDownloadComponent, PoModalModule, NgClass, RpwComponent, PoFieldModule, PoIconModule]
})
export class ResumoFinalComponent implements OnInit {
  private srvTotvs   = inject(TotvsService)
  private srvheader  = inject(TecLabLookupService)
  private srvTotvs46 = inject(TotvsService46)
  private srvDialog  = inject(PoDialogService)
  private srvNotification = inject(PoNotificationService)
  private router = inject(Router)


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
  qtd:                         string = ''

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
  colunasArquivos!: PoTableColumn[]
  nrProcess:string=''
  codEstabel:string=''
  loadTela:boolean=false

  labelTimer:string='Aguarde a liberação do arquivo...'
  labelTimerDetail:string=''
  labelPedExec:string=''
  telaTimerFoiFechada:boolean=false
  sub!: Subscription;
  
  
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

   //---Inicializar
   ngOnInit(): void {

    this.srvTotvs.ObterCadastro({tabela: 'spool', codigo: ''}).subscribe({
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
        /*
        //FAS - Aqui apagar depois
        this.codEstabelecimento = "101"
        this.onEstabChange(this.codEstabelecimento)
        this.stepper.next()
        this.stepper.next()
        this.stepper.next()
        this.stepper.next()
        this.dthrAlt = new Date(2025, 10, 24)
        //FAS - Aqui apagar depois
        */
      }

    })
    this.colunasArquivos = this.srvTotvs.obterColunasArquivos()

    //--- Login Unico
    this.srvTotvs.ObterUsuario().subscribe({
      next:(response:Usuario)=>{
        
       
        if (response === undefined){
          this.srvTotvs.EmitirParametros({estabInfo:''})
        }
        else{
          this.nrProcess  = response.nrProcesso
          this.codEstabel = response.codEstabelecimento

          //Arquivo Gerado
          let params:any={nrProcess: response.nrProcesso, situacao:'L'}
          this.srvTotvs.ObterArquivo(params).subscribe({
            next:(item:any)=>{
              if(item === null) return
              this.listaArquivos = item.items ?? null
            }
          })

      }}})

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
