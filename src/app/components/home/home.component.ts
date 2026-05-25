import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject, signal } from '@angular/core';
import { PoMenuItem, PoModalAction, PoModalComponent, PoPageAction, PoRadioGroupOption, PoStepperComponent, PoTableAction, PoTableColumn, PoTableComponent, PoNotificationService, PoDialogService, PoNotification, PoButtonComponent, PoLoadingModule, PoStepperModule, PoWidgetModule, PoDividerModule, PoFieldModule, PoIconModule, PoTableModule, PoButtonModule, PoTooltipModule, PoRadioGroupModule, PoModalModule, PoModule, PoAccordionModule, PoTableLiterals, PoStepComponent, PoContainerModule, PoComboOption, PoPageModule, PoToolbarModule, PoToolbarAction, PoLookupColumn } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service'
import { catchError, delay, elementAt, finalize, first, forkJoin, interval, of, Subscription } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExcelService } from '../../services/excel-service.service';
import { Usuario } from '../../interfaces/usuario';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { NgClass, NgIf, CurrencyPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { RpwComponent } from '../rpw/rpw.component';
import { environment } from '../../environments/environment';
import { TecLabLookupService } from '../../services/header-lookup.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DnRangeComponent } from '../../dn-range/dn-range.component';
import { DnModal } from "../../dn-modal/dn-modal";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    PoLoadingModule,    PoStepperModule,
    PoWidgetModule,    PoDividerModule,
    PoFieldModule,    CommonModule,
    FormsModule,    ReactiveFormsModule,
    PoIconModule,    PoTableModule,
    PoButtonModule,    PoTooltipModule,
    PoRadioGroupModule,    PoModalModule,
    PoAccordionModule,    PoContainerModule,
    PoPageModule,    PoToolbarModule,
    DnRangeComponent,    DnModal
]
})
export class HomeComponent {

  private srvheader       = inject(TecLabLookupService)

  //--- Loadings
  loadTela:  boolean = false
  loadExcel: boolean = false
  labelLoadTela:    string = ''
  loadTecnico:      string = ''
  loadTransp:       string = ''
  loadPrioridade:   string = ''
  loadConsolidacao: string = ''
  loadFaturados:    string = ''

  //---DN Modal
  mostrarModal  = false
  loadModal     = false
  mensagemModal = ''
  
  //---Grid
  colunas!: PoTableColumn[]
  lista!:   any[]

  //--- Controle de Steps
  StepAtual:        any
  alturaStepper:    number = window.innerHeight - 168
  alturaStepperSel: number = window.innerHeight - 128

  //--- Aba Dashboard
  labelContadores:  string[] = ['0', '0', '0', '0', '0', '0', '0', '0']
  totSelecionado:   string[] = ['0', '0', '0', '0', '0']
  ultatt:           string = ''
  
  //--- Aba Seleção
  emitenteSelecionado:       any    = null
  transportadoraSelecionado: string = ''
  prioridadeSelecionado:     string = ''

  //--- Controle dos Grids  
  alturaGrid:             number = window.innerHeight - 280
  alturaGridSelecionados: number = window.innerHeight - 10
  alturaGridConsolidados: number = window.innerHeight - 100
  alturaGridFaturados:    number = window.innerHeight - 100

  //--- Lista dos Grids
  listaReparos!:                any[]
  listaEstabelecimentos!:       any[]
  listaTecnicos!:               any[]
  listaTransp!:                 any[]
  listaTranspFiltrada!:         PoComboOption[] 
  listaSelecao:                 any[] = []
  listaSelecaoFiltrada:         any[] = []
  listaSelecionados:            any[] = []
  listaSelecionadosItens:       any[] = []
  listaSelecionadosItensFiltro: any[] = []
  listaSelecionadosItensPeso:   any[] = []
  listaConsolidacao!:           any[]
  listaConsolida:               any[] = []
  listaConsolidaFiltro:         any[] = []
  listaConsolidaItens:          any[] = []
  listaConsolidaItensFiltro:    any[] = []
  listaFaturamento!:            any[]
  listaFaturados:               any[] = []
  listaFaturadosFiltro:         any[] = []
  listaExecutandoFiltro:        any[] = []
  listaFaturadosItens:          any[] = []
  listaFaturadosItensFiltro:    any[] = []
  selectedRows:                 any[] = []

  //--- Colunas dos Grids
  colunasReparos:         Array<PoTableColumn> = []
  colunasSelecao:         Array<PoTableColumn> = []
  colunasSelecaoItens:    Array<PoTableColumn> = []
  colunasSelecaoItensPeso:Array<PoTableColumn> = []
  colunasConsolida:       Array<PoTableColumn> = []
  colunasConsolidaExec:   Array<PoTableColumn> = []
  colunasConsolidaFat:    Array<PoTableColumn> = []
  colunasConsolidaItens:  Array<PoTableColumn> = []
  colunasFaturados:       Array<PoTableColumn> = []

  //--- Controle de Modal
  lHideSearch: boolean = false

  //--- Controle do acompanhamento RPW
  numPedExec         = signal(0)
  labelTimer         : string='Aguarde a liberação do arquivo...'
  labelTimerDetail   : string=''
  labelPedExec       : string=''
  telaTimerFoiFechada: boolean=false
  sub!               : Subscription

  //--- Informacoes Dialog Grids (Resumo)
  colunasDetalhe: Array<PoTableColumn> = []
  tituloDetalhe!: string
  itemsDetalhe! : any[]
  itemsTotal!   : any[]
  
  //--- Variaveis e Combobox
  codEstabelecimento:          string = ''
  codEmitente:                 string = ''
  nrNotaFis:                   string = '' 
  serie:                       string = ''
  qtd:                         string = ''
  codTecnico:                  string = ''
  codTransp:                   string = ''
  nrConsolidacao:              string = ''
  indPrioridade:               string = ''
  indConsolidacao:             string = ''
  indFaturados:                string = ''
  placeHolderEstabelecimento!: string
  serieSaida:                  any    = '999'
  codTranspnf:                 string = ''
  paramsEstab:                 any    = []
  valConsolidado:              string = ''
  dthrAlt:                     Date   = new Date()
  currentStep                  = '' // etapa atual
  previousStep                 = ''

  //--- Modal Resumo
  consolidacao:       any
  pageActions:        Array<any> = []
  listaErros!:        any[]
  colunasErro!:       PoTableColumn[]
  alturaGridLog:      number=window.innerHeight - 555
  cMensagemErroRPW    = ''

  versao!:string
  EmitenteService             = this.srvheader
  codigoEmitente!: number

  //polookup
  columns: PoLookupColumn[] = [
    { property: 'codEmitente', label: 'Código' },
    { property: 'nomeAbrev', label: 'Nome' }
  ]

  //Filtros Avançados
  filtro = {
    
    valEstabIni: "",
    valEstabFim: "ZZZ",
    cLabelCodEstabel: "Estabelecimento",

    valEmitIni: "0",
    valEmitFim: "999999999",
    cLabelCodEmit: 'Destino',

    valItemIni: "",
    valItemFim: "ZZZZZZZZZZZZZZZZ",
    cLabelItem: "Item",    
    
  }

  filtroPadrao = {
    
    valEstabIni: "",
    valEstabFim: "ZZZ",
    cLabelCodEstabel: "Estabelecimento",

    valEmitIni: "0",
    valEmitFim: "999999999",
    cLabelCodEmit: 'Destino',

    valItemIni: "",
    valItemFim: "ZZZZZZZZZZZZZZZZ",
    cLabelItem: "Item",    
    
  }

  get filtrosAlterados(): boolean {
    return JSON.stringify(this.filtro) !== JSON.stringify(this.filtroPadrao);
  }

  constructor(private cdr:      ChangeDetectorRef,
              private sanitizer: DomSanitizer) {}
              
  //--- Referencias
  @ViewChild('grid2')                                grid2!:           PoTableComponent 
  @ViewChild('detailsModalTot',    { static: true }) detailsModalTot:  PoModalComponent | undefined
  @ViewChild('detailsModalPend',   { static: true }) detailsModalPend: PoModalComponent | undefined
  @ViewChild('detailsModalCon',    { static: true }) detailsModalCon:  PoModalComponent | undefined
  @ViewChild('ChamaFaturar',       { static: true }) ChamaFaturar:     PoModalComponent | undefined
  @ViewChild('ChamaPesoItem',      { static: true }) ChamaPesoItem:    PoModalComponent | undefined
  @ViewChild('alteraPeso',         { static: true }) alteraPeso:       PoModalComponent | undefined
  @ViewChild('Resumo',             { static: true }) Resumo:           PoModalComponent | undefined
  @ViewChild('ttDadosConc')                          DadosSelecao!:    PoTableComponent
  @ViewChild('stepper')                              stepper!:         PoStepperComponent
  @ViewChild('pesoLiqInput')                         pesoLiqInput!:    ElementRef
  @ViewChild('timer',              { static: true }) telaTimer:           | PoModalComponent  | undefined
  @ViewChild('telaFiltroAvancado', { static: true }) telaFiltroAvancado:  | PoModalComponent  | undefined

  //--- Serviços injetados
  private srvTotvs        = inject(TotvsService)
  private srvExcel        = inject(ExcelService)
  private srvNotification = inject(PoNotificationService)
  private srvDialog       = inject(PoDialogService)
  private formConsulta    = inject(FormBuilder)
  private router          = inject(Router)
  
  //--- Formulario
  public formNota = this.formConsulta.group({
    codEstabelecimento:  ['', Validators.required],
    codEmitente:         ['', Validators.required],
    nrNotaFis:           ['', Validators.required],
    serie:               ['', Validators.required],
    qtd:                 ['', Validators.required],
  })

  //--- Filtros  
  filtros = {
    estabelecimento: '',
    emitente: '',
    nf: '',
    serie: '',
    qtd: null
  }

  //--- Opções de Modal
  modalOptions = [
    { label: 'Aéreo',     value: 'aereo' },
    { label: 'Terrestre', value: 'terrestre' }
  ];

  readonly acaoSelecionar: PoModalAction = {
    label: 'Salvar',
    action: () => {
      //this.telaSelecao?.close();
    },
  }

  readonly acaoCancelarSelecao: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      //this.telaSelecao?.close();
    },
  }

  readonly acaoConfirmarFiltro: PoModalAction = {
    label: 'Aplicar',
    action: () => {
      this.telaFiltroAvancado?.close()
      //this.ChamaObterDadosPag() //1
    },
   
    //disabled: !this.formAltera.valid,
  }

  readonly acaoCancelarFiltro: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaFiltroAvancado?.close()
    },
  }

  //--- Limpar Filtros
  limparFiltros(){

    //this.filtro = { ...this.filtroPadrao }
    this.codEstabelecimento = ""
    this.codEmitente        = ""
    this.serie              = ""
    this.nrNotaFis          = ""
    this.qtd                = ""
    this.listaReparos       = []
  }

  dtIni: string = <any>new Date();
  dtFim: string = <any>new Date();
  tecIni:string='0'
  tecFim:string='999999'
  tecDestIni:string='0'
  tecDestFim:string='999999'
  itCodigoIni:string=''
  itCodigoFim:string='ZZZZZZZZZZZZZZZZ'
  estabIni:string=''
  estabFim:string='ZZZ'
  objSolic!: any[]
  
  //--- Opcoes Grid
  opcoesGrid: Array<any> = [

  ]
  customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados',
  }

  onAlterarGrid(obj: any | null){

  }

  Detalhe(obj:any){

    //this.srvTotvs.SetarUsuario(obj["cod-estabel"], obj["cod-emit-ori"], obj["nr-process"])
    this.router.navigate(['dashboard'])

  }

  //Filtro Avançado
  onFiltroAvancado(){
    //this.telaFiltroAvancado?.open()
  }

  //Listagem em Excel
  onExcel(){
    let titulo = "RETORNO E CONCLUSÃO DE REPAROS EXTERNOS" //this.tituloTela.split(':')[0]
    let subTitulo = "LISTAGEM DE DADOS: Estabel.: " + this.codEstabelecimento +
                                     " Emitente.: " + this.codEmitente +
                                        " Serie.: " + this.serie +
                                           " NF.: " + this.nrNotaFis
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }

    const colunasNaoExportar = ['conclui', 'cod-estabel']

    const colunasExcel = this.colunasReparos.filter(
      col => col.property && !colunasNaoExportar.includes(col.property)
    )

    this.srvExcel.exportarParaExcel('HTMLESRR047: ' + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      colunasExcel,
      this.listaReparos,
      'htmlesrr047',
      'Plan1')

    this.loadExcel = false
  }

  Selecionar(){

    if (!this.codEstabelecimento) {
      this.srvNotification.warning('Informe o Estabelecimento.');
      return;
    }

    if (!this.codEmitente) {
      this.srvNotification.warning('Informe o Emitente.');
      return;
    }

    if (!this.nrNotaFis) {
      this.srvNotification.warning('Informe a NF.');
      return;
    }

    if (!this.serie) {
      this.srvNotification.warning('Informe a Série.');
      return;
    }

    //const valor = Number(this.qtd)
    //if (!valor || valor <= 0) {
    //  this.srvNotification.warning('Informe a Quantidade.');
    //  return;
    //}

    this.loadTela      = true
    this.labelLoadTela = "Validando Nota"
    let paramsTela: any = {items: [{codEstabelecimento: this.codEstabelecimento,
                                    codEmitente: this.codEmitente,
                                    nrNotaFis: this.nrNotaFis,
                                    serie: this.serie
                                    }
                                  ]
                          }

    this.srvTotvs.ObterDadosNota(paramsTela).subscribe({
      next:(response:any)=>{
        
        if (!response || !response.items || response.items.length === 0) {
          this.listaReparos = []
          this.loadTela = false
          this.srvNotification.warning("Não existe dados para o range de seleção !")
          return
        }
        
        this.listaReparos = [...response.items] // força nova referência
        this.loadTela     = false

        this.qtd = response.items.length
        this.cdr.detectChanges()
    },
      complete: ()=> {this.loadTela=false},
      error: ()=> {this.loadTela=false}
    })

  }

  //-- ngOnInit inicial da tela
  ngOnInit(): void {

    this.versao = environment.versao
    this.totSelecionado[3] = "Calcular"
    this.totSelecionado[4] = "Calcular"

    //Obter Colunas do Grid
    this.colunasReparos          = this.srvTotvs.obterColunasReparos()

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

  }
  //-- ngOnInit inicial da tela 

  

  //--- Abrir tela de Resumo Final
  AbrirTela(obj:any, cTela:string){
      this.loadTela=true
      this.router.navigate([cTela], { state: { consolidacao: obj.nrConsolidacao } })
    }

  //--- Chame este método sempre que o grid for recarregado/atualizado.
  public atualizaComboConsolidacao(selecionados: any[]) {

    // Mapa para garantir unicidade e contagem
    const counts = selecionados.reduce<Map<string, number>>((acc, item) => {
      const nrRaw = item.nrConsolidacao?.toString().trim()
      const nr = Number(nrRaw);

      this.valConsolidado = item.lConsolidado?.toString().trim()

      if (isNaN(nr)) return acc;

      const emitente = item.descEmitente?.trim() ?? '';
      const transp = item.nomTransp?.trim() ?? '';
      const key = `${nr} - ${emitente} - ${transp}`;

      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map());

    // Ordena numericamente pelo nrConsolidacao
    const unicosOrdenados = Array.from(counts.keys()).sort((a, b) => {
      const nrA = Number(a.split(' - ')[0]);
      const nrB = Number(b.split(' - ')[0]);
      return nrA - nrB;
    });

    // Monta as opções do combo
    if (this.valConsolidado === "Não") {
      this.listaConsolidacao = [
        { label: 'Todos', value: null }, ...unicosOrdenados.map(label => {
          const nr = Number(label.split(' - ')[0]);
          return { label, value: nr };
        })
      ]
    }
    else{
      this.listaFaturamento = [
        { label: 'Todos', value: null }, ...unicosOrdenados.map(label => {
          const nr = Number(label.split(' - ')[0]);
          return { label, value: nr };
        })
      ]  
    }
  }
  //--- Chame este método sempre que o grid for recarregado/atualizado.

  

  

  //--- TELA HOME DO HTMLESRR047
  public onResumoFinal(obj:any){
    //if(obj.situacao.toUpperCase() === "L")
      this.AbrirTela(obj, 'resumofinal')
    //else
    //this.srvNotification.error("Situação do processo não permite chamar esta tela !")
  }

  //--- Confirmar Documento
  onConfirmar(){

    this.mostrarModal = true

  }

  public onConfirmarExclusao(confirmado: boolean){

    this.mostrarModal = false

    if (confirmado) {
    
      this.onResumoFinal('ok')
    }

    
  }

  //--- Relatório
  onRelatorio(){

  }
  //--- Marcar desmarcar linha
  total = 0
  changeOptions(selecionados: any[]) {

    /*
    this.listaSelecionados      = []
    //não posso limpar aqui senão zera a tablea de itens
    //this.listaSelecionadosItens = []

    const sel = this.DadosSelecao.getSelectedRows()
    this.totSelecionado[0] = String(sel.length) //this.DadosSelecao.getSelectedRows().length.toString()
    this.totSelecionado[1] = String(sel.reduce((acc, item) => acc + Number(item.qtdItens), 0)) //this.DadosSelecao.getSelectedRows().reduce((acc, item) => acc + Number(item.qtdItens), 0)
    this.totSelecionado[2] = sel.reduce((acc, item) => acc + parseFloat((item.vlItens || 0).toString().replace(',', '.')), 0).toFixed(2) //this.DadosSelecao.getSelectedRows().reduce((acc, item) => acc + parseFloat((item.vlItens || 0).toString().replace(',','.')), 0).toFixed(2)

    this.listaSelecionados = [...sel].sort(this.ordenarCampos(['codEmitente', 'codTransp']))
    */

    this.total = this.grid2.getSelectedRows().length    

  }
  //--- Marcar desmarcar linha

  //--- Abre tela de Modal
  onOpenModal(type: any) {
    switch (type) {
      case 'Total':

        if (this.labelContadores[0] === "0") { return } //Não abre se não tiver dados
        
        this.tituloDetalhe = `Visão Total: ${this.labelContadores[0]} registros`
        this.colunasDetalhe = this.srvTotvs.obterColunasTotal()
        
        this.limparFiltro()

        this.detailsModalTot?.open();

      break
      case 'Pendentes':

        if (this.labelContadores[4] === "0") { return } //Não abre se não tiver dados

        this.tituloDetalhe = `Visão Pendentes: ${this.labelContadores[4]} registros`
        this.colunasDetalhe = this.srvTotvs.obterColunasTotal()
        
        this.limparFiltro()

        this.detailsModalPend?.open();
        
      break
      case 'Consolidado':

        if (this.labelContadores[5] === "0") { return } //Não abre se não tiver dados

        this.tituloDetalhe = `Visão Consolidado: ${this.labelContadores[5]} registros`
        this.colunasDetalhe = this.srvTotvs.obterColunasTotal()
        
        this.limparFiltro()

        this.detailsModalCon?.open();

      break

    }
  }
  //--- Abre tela de Modal

  //--- Change Estabelecimentos - Popular Emitente
  public onEstabChange(obj: string) {

    if (obj === undefined || obj === "") {

      //Zera as variaveis e listas e load
      this.listaTecnicos      = []
      this.listaTransp        = []
      this.labelContadores[0] = "0" //Total
      this.labelContadores[1] = "0" //Técnicos
      this.labelContadores[2] = "0" //Transferência
      this.labelContadores[3] = "0" //Remessa para Conserto
      this.labelContadores[4] = "0" //Pendentes
      this.labelContadores[5] = "0" //Consolidado
      this.labelContadores[6] = "0" //Separados
      this.labelContadores[7] = "0" //Expedidos
      this.loadTela           = false
      this.loadTecnico    = 'Selecione um estabelecimento primeiro'
      this.loadTransp     = 'Selecione um estabelecimento primeiro'
      this.loadPrioridade = 'Selecione um estabelecimento primeiro'
      return

    //estou fazendo abaixo para tirar o codigo
    //}

      //Popular o Combo do Emitente
      this.listaTecnicos = []
      this.codTecnico    = ''
      this.listaTecnicos.length = 0;
      this.loadTecnico = `Populando Emitente do estab ${obj} ...`

      this.loadTela      = true
      this.labelLoadTela = "Carregando Dados Emitente"

      
      this.srvTotvs.ObterEmitentesDoEstabelecimento(obj).subscribe({
        next: (response: any) => {
              delay(200)

          this.listaTecnicos = response
          this.loadTecnico = 'Selecione o Emitente'

        },
        error: (e) => {this.loadTecnico = 'Erro ao carregar Emitente'  }
      });

    } //apagar aqui quando quiser que popule

    //Atualiza com a dataHora de Atualização da Tela
    this.ultatt = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })   
  
  }

  //--- Stepper
  public onChangeStep(obj: any) {    

    //Informacoes iniciais tela
    //this.srvTotvs.EmitirParametros({ tituloTela: this.versao + ' - Retorno e Conclusão de Reparos Externo', abrirMenu: false })

/*

    if ((this.StepAtual === "Dashboard" || this.StepAtual === "Seleção") && (obj.label === "Resumo" || obj.label === "Pré-Faturamento" || obj.label === "Faturados")){

      if ((!this.listaSelecionados || this.listaSelecionados.length === 0) && (!this.listaConsolida || this.listaConsolida.length === 0)){
        this.srvNotification.error('Nenhum pedido foi selecionado para Consolidação')
        this.stepper?.previous()
        return
      } 

    }

    if ((this.StepAtual === "Dashboard" || this.StepAtual === "Seleção" || this.StepAtual === "Resumo") && (obj.label === "Pré-Faturamento" || obj.label === "Faturados")){

      if ((!this.listaConsolida || this.listaConsolida.length === 0)){
        this.srvNotification.error('Efetivar a Consolidação para Avançar');
        this.stepper?.previous()
        return
      }

    }*/
    this.StepAtual = obj.label

  }
  //--- Stepper
  
  //--- Próximo Step
  public canActiveNextStep(passo: any): boolean {
    
    this.previousStep = this.currentStep
    this.currentStep  = passo.label
    
    if ((passo.label === "Dashboard") && (this.codEstabelecimento === '' || this.codEstabelecimento === undefined)) {
      this.srvNotification.error('Estabelecimento não foi selecionado');
      return false
    }

    /*
    if ((passo.label === "Seleção") && (!this.listaSelecionados || this.listaSelecionados.length === 0) && (!this.listaConsolida || this.listaConsolida.length === 0)){
      this.srvNotification.error('Nenhum pedido foi selecionado para Consolidação');
      return false
    }

    if ((passo.label === "Resumo") && (!this.listaConsolida || this.listaConsolida.length === 0)){
      this.srvNotification.error('Efetivar a Consolidação para Avançar');
      return false
    }
    */
    if (passo.label === 'Resumo') {
      this.atualizaComboConsolidacao(this.listaConsolidaFiltro)
      this.atualizaComboConsolidacao(this.listaFaturadosFiltro)
      this.atualizaComboConsolidacao(this.listaExecutandoFiltro)
    }

    if (passo.label === 'Pré-Faturamento') {
      this.atualizaComboConsolidacao(this.listaConsolidaFiltro)
      this.atualizaComboConsolidacao(this.listaFaturadosFiltro)
      this.atualizaComboConsolidacao(this.listaExecutandoFiltro)
      
      if (this.previousStep === "Resumo"){
        this.onFatChange()
      }

    }

    return true

  }
  //--- Próximo Step

  //Atualiza Faturados
  public onFatChange(){
      this.loadTela      = true
      this.labelLoadTela = "Carregando Faturados"

      let paramsTela: any = { codEstabel: this.codEstabelecimento, dthrAlt: this.dthrAlt}
      this.srvTotvs.ObterTotaisFat(paramsTela).subscribe({ //ponto 1
          next: (response: any) => {

            //this.listaFaturadosFiltro      = []
            //this.listaFaturadosItensFiltro = []

            if (response && response.faturados && response.faturados.length > 0) {
              this.listaFaturadosItens = response.faturados
              this.listaFaturados      = Array.from(new Map(this.listaFaturadosItens.map(item => [item.nrConsolidacao, item])).values())

              //Transforma em número
              this.listaFaturadosItens = this.listaFaturadosItens.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));
              this.listaFaturados      = this.listaFaturados.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));

              //Ordena a Lista
              this.listaFaturadosItens = (this.listaFaturadosItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
              this.listaFaturados      = (this.listaFaturados      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

            }
            
            if (response && response.consolidar && response.consolidar.length > 0) { //ponto 2
          
              this.listaConsolidaItens = response.consolidar
              this.listaConsolida      = Array.from(new Map(this.listaConsolidaItens.map(item => [item.nrConsolidacao, item])).values())

              //Transforma em número
              this.listaConsolidaItens = this.listaConsolidaItens.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));
              this.listaConsolida      = this.listaConsolida.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));

              //Ordena a Lista
              this.listaConsolidaItens = (this.listaConsolidaItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
              this.listaConsolida      = (this.listaConsolida      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

              //Carrega lista de Filtro
              //this.listaConsolidaFiltro = this.listaConsolida.filter(item => item.lConsolidado === 'Não')
              this.listaFaturadosFiltro  = this.listaConsolida.filter(item => item.lFaturado === 'Sim' /*&& (!item.lFaturado || item.lFaturado.trim() === '')*/ )
              this.listaExecutandoFiltro = this.listaConsolida.filter(item => item.lFaturado === 'Não' /*&& (!item.lFaturado || item.lFaturado.trim() === '')*/ )
              
              if (response && response.pedidos && response.pedidos.length > 0) {
                this.itemsTotal = [...response.pedidos, ...response.consolidar.filter((item: any) => item.lFaturado === 'Não' || item.lFaturado === '')]
              }
              else {
                this.itemsTotal = [...response.consolidar]
              }

            }
            else {

              this.listaConsolida = []
              if (response && response.pedidos && response.pedidos.length > 0) {
                this.itemsTotal = [...response.pedidos]
              }

            }
            this.loadTela = false
          },
          error: (e) => {
            this.loadTela = false
          },
          complete(){
            
          }

      })
  }

  //--- Change Transportadora
  public onTranspChange(obj: string) {
    this.transportadoraSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
  }
  //--- Change Transportadora

  //--- Change Emitente
  public onEmitenteChange(obj: string) {
    

      this.emitenteSelecionado = obj ? String(obj).split(' ')[0] : ''
      
      this.filtrarLista()

  }
  //--- Change Emitente

  //--- Change Prioridade
  public onPrioridadeChange(obj: string) {
    this.prioridadeSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
  }
  //--- Change Prioridade

  //--- Filtrar Consolidacao
  public onFiltrarConsolidacaoChange(obj: any) {

    this.listaConsolidaFiltro = this.listaConsolida.filter(item => {
      const filtroConsolida = obj ? Number(item.nrConsolidacao) === Number(obj) : true

      return filtroConsolida
    })

  }

  //--- Filtrar Faturados
   public onFiltrarFaturadosChange(obj: any) {

    this.listaFaturadosFiltro = this.listaFaturados.filter(item => {
      const filtroFaturados = obj ? Number(item.nrConsolidacao) === Number(obj) : true

      return filtroFaturados
    })

  }

  //--- Filtra Lista
  public filtrarLista() {
    this.listaSelecaoFiltrada = this.listaSelecao.filter(item => {
      const filtroEmitente = this.emitenteSelecionado ? item.codEmitente === this.emitenteSelecionado: true

      const filtroTransp = this.transportadoraSelecionado ? item.codTransp === this.transportadoraSelecionado: true

      const filtroPrioridade = this.prioridadeSelecionado ? item.indPrioridade === this.prioridadeSelecionado: true

      return filtroEmitente && filtroTransp && filtroPrioridade
    });

  }
  //--- Filtra Lista

  //--- Exportar lista filtrada para excel
  public onExportarSelecaoExcel() {
    let titulo = "LISTA DE PEDIDOS"
    let subTitulo = this.tituloDetalhe
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }
    this.srvExcel.exportarParaExcel('SELEÇÃO: ' + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      this.colunasDetalhe,
      this.listaSelecaoFiltrada,
      'Pedidos_' + this.codEstabelecimento,
      this.codEstabelecimento)

    this.loadExcel = false;
  }
  //--- Exportar lista filtrada para excel

  //--- Exportar lista detalhe para excel
  public onExportarExcel() {
    let titulo = "LISTA DE PEDIDOS"
    let subTitulo = this.tituloDetalhe
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }

    this.srvExcel.exportarParaExcel('DASHBOARD: ' + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      this.colunasDetalhe,
      this.itemsTotal,
      'Pedidos_' + this.codEstabelecimento,
      this.codEstabelecimento)

    this.loadExcel = false;
  }
  //--- Exportar lista detalhe para excel

  //--- Função para ordenar
  //Utilize o - (menos) para indicar ordenacao descendente
  ordenarCampos = (fields: any[]) => (a: { [x: string]: number; }, b: { [x: string]: number; }) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o = o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
  }).reduce((p, n) => p ? p : n, 0)
  //--- Função para Ordenar

  //--- Limpar filtro
  limparFiltro() {
    setTimeout(() => {
      let filtro = (document.querySelector('.po-search-input') as HTMLInputElement)
      if (filtro !== null && filtro !== undefined)
        filtro.value = ''

    }, 500)

  }
  //--- Limpar filtro

  //--- Chamar programa TOTVS
  onChamarPD1001() {
    let params = { RowId: "0x000000003f0f2186" }
    this.srvTotvs.AbrirProgramaTotvs(params).subscribe({
      next: (response: any) => {
       
      }
    })
  }
  //--- Chamar programa TOTVS

  //--- fora de uso
  
  //--- fora de uso

} //--- FIM