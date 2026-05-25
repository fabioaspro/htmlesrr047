import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription, map, of, take, tap } from 'rxjs';
import { Observable } from 'rxjs';

import { PoHttpRequestInterceptorService, PoTableColumn, PoTableDetail } from '@po-ui/ng-components';
import { Usuario } from '../interfaces/usuario';
import { Monitor } from '../interfaces/monitor';
import { Reparo } from '../interfaces/reparo';
import { environment } from '../environments/environment';

//--- Header somente para DEV
const headersTotvs = new HttpHeaders(environment.totvs_header);

@Injectable({
  providedIn: 'root',
})
export class TotvsService {
  //Signals
  usuarioSelecionado: WritableSignal<Usuario> = signal({
    codUsuario: '',
    codEstabelecimento: '',
    nrProcesso: '',
  });

  _url      = environment.totvs_url
  _urlGeral = environment.totvs_url_geral

  //_url41 = environment.totvs41_url;
  
  constructor(private http: HttpClient) {}

  //--- Variavel
  private emissorEvento$ = new Subject<any>();

  //--- Emissor
  public EmitirParametros(valor: any) {
    this.emissorEvento$.next(valor);
  }

  //--- Observador
  public LerParametros() {
    return this.emissorEvento$.asObservable();
  }

  //------------ ESRR047
  obterColunasReparos(): Array<PoTableColumn> { //colunasDetalhe
    return [
      { property: 'conclui',       label: 'Conclui?',  visible: false},
      { property: 'rr-bloq',       label: 'Bloq' },
      { property: 'cod-estabel',   label: 'Estabel', visible: false},
      { property: 'CodFilial',     label: 'Filial' },
      { property: 'NumRR',         label: 'Num.RR' },
      { property: 'it-codigo',     label: 'Item'},
      { property: 'descItem',      label: 'Descrição'},
      { property: 'cliOrig',       label: 'CliOrig', },
      { property: 'cliDest',       label: 'CliDest' },
      { property: 'numSerie',      label: 'numSerie' },
      { property: 'dataRecebe',    label: 'Dt.Recebe' },
      { property: 'horaRecebe',    label: 'Hr.Recebe' },
      { property: 'nrNotaFis',     label: 'NF' },
      { property: 'dtSaida',       label: 'Dt.Saida' },
      { property: 'requisicao',    label: 'Requisição' },
      { property: 'atividade',     label: 'Atividade' },
      { property: 'defInd',        label: 'Def.Ind.' },
      { property: 'numOs',         label: 'Num.OS' },
      { property: 'numTec',        label: 'Num.Tec' },
      { property: 'situacao',      label: 'Situação' },
      { property: 'obs',           label: 'Obs' },

      //{ property: 'qtdItens',      label: 'Qtd.Itens',     visible: false, width: '100px' },
      //{ property: 'vlItens',       label: 'Vl.Itens',      visible: false, type: 'currency', format: 'BRL' },      
    ]
  }

  obterColunasArquivos(): Array<PoTableColumn> {
    return [
      {property: 'nomeArquivo', label: "Arquivo", type: 'columnTemplate'},
      {property: 'mensagem', label: "Descrição"},
      {property: 'dataHora', label: "Data", type:'date', format: "dd/MM/yyyy hh:mm:ss"},
      {property: 'numPedExec', label: "PedExec"},
    ];
  }

  public UsuarioLogado!: Usuario

  public ObterUsuario(): Observable<Usuario> {
    return of(this.UsuarioLogado).pipe(take(1))
  }

  public ObterArquivo(params?: any){
    return this.http.get(`${this._url}/ObterArquivo`, {params:params, headers:headersTotvs}).pipe(take(1));
  }
  //------------ ESRR047

  //------------ Coluna Grid Detalhe
  obterColunasTotal(): Array<PoTableColumn> { //colunasDetalhe
    return [
      { property: 'codEmitente',   label: 'codEmitente',   visible: false },
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'tpPed',         label: 'TP' },
      { property: 'nrPedcli',      label: 'Pedido Cli' },
      { property: 'nomeAbrev',     label: 'Nome Abrev' },
      { property: 'nrPedido',      label: 'Pedido',        visible: false },
      { property: 'codTransp',     label: 'codTransporte', visible: false },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'indPrioridade', label: 'Pri.' },
      { property: 'qtdItens',      label: 'Qtd.Itens',     visible: false, width: '100px' },
      { property: 'vlItens',       label: 'Vl.Itens',      visible: false, type: 'currency', format: 'BRL' },
      { property: 'lConsolidado',  label: 'C' },
      { property: 'lFaturado',     label: 'F' },
      
    ]

  }

  obterColunasSelecao(): Array<PoTableColumn> {
    return [
      { property: 'codEmitente',   label: 'codEmitente', visible: false },
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nrPedido',      label: "Pedido",      visible: false},
      { property: 'nrPedcli',      label: 'Pedido Cli' },
      { property: 'nomeAbrev',     label: 'Nome Abrev' },
      { property: 'cddEmbarqRes',  label: 'Resumo'},
      { property: 'cddEmbarq',     label: 'Embarque',      visible: false},
      { property: 'nrResumo',      label: 'Resumo',        visible: false},
      { property: 'codTransp',     label: 'codTransporte', visible: false },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'tpPed',         label: 'TP' },
      { property: 'indPrioridade', label: 'Prioridade' },
      { property: 'qtdItens',      label: 'Qtd.Itens', visible: true  },
      { property: 'vlItens',       label: 'Vl.Itens',  visible: true, type: 'currency', format: 'BRL' },
    ]

  }

  obterColunasSelecaoItens(): Array<PoTableColumn> {
    return [
      { property: 'nrPedido',      label: "Pedido",    visible: true},
      { property: 'itCodigo',      label: 'Item' },
      { property: 'qtdItens',      label: 'Qtd.Itens', visible: true  },
      { property: 'codDepos',      label: 'Depósito' },
      { property: 'pesoLiq',       label: 'Peso Líq.' },
      { property: 'pesoBru',       label: 'Peso Bru.' },
      { property: 'vlItens',       label: 'Vl.Itens',  visible: true, type: 'currency', format: 'BRL' },
    ]

  }

  obterColunasSelecaoItensPeso(): Array<PoTableColumn> {
    return [
      { property: 'itCodigo',      label: 'Item' },
      { property: 'pesoLiq',       label: 'Peso Líq.' },
      { property: 'pesoBru',       label: 'Peso Bru.' },
    ]

  }

  obterColunasConsolida(): Array<PoTableColumn> {
    return [
      { property: 'codEstabel',    label: 'Estab.',   visible: true, width: '120px'},
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true, width: '140px', type: 'number'},
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'dthrAlt',       label: 'Data Alt.',         type:'date', format: "dd/MM/yyyy"},
      { property: 'userAlt',       label: 'Usuário' },
      { property: 'lConsolidado',  label: 'Consolidado', visible: true },
      { property: 'lFaturado',     label: 'Faturado',    visible: true },
      
    ]

  }

  obterColunasConsolidaExec(): Array<PoTableColumn> {
    return [
      { property: 'codEstabel',    label: 'Estab.',   visible: true, width: '120px'},
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true, width: '140px', type: 'number'},
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'dthrAlt',       label: 'Data Alt.',         type:'date', format: "dd/MM/yyyy"},
      { property: 'userAlt',       label: 'Usuário' },
      { property: 'pedExec',       label: 'pedExec',           type:'cellTemplate' },
      { property: 'opcoes',        label: 'Ações Disponíveis', type:'cellTemplate' },      
      { property: 'lConsolidado',  label: 'Consolidado', visible: true },
      { property: 'lFaturado',     label: 'Faturado',    visible: true },
      
    ]

  }

  obterColunasConsolidaFat(): Array<PoTableColumn> {
    return [
      { property: 'codEstabel',    label: 'Estab.',   visible: true, width: '120px'},
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true, width: '140px', type: 'number'},
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'dthrAlt',       label: 'Data Alt.',         type:'date', format: "dd/MM/yyyy"},
      { property: 'userAlt',       label: 'Usuário' },
      { property: 'opcoes',        label: 'Ações Disponíveis', type:'cellTemplate' },
      { property: 'lConsolidado',  label: 'Consolidado', visible: true },
      { property: 'lFaturado',     label: 'Faturado',    visible: true },
      
    ]

  }

  obterColunasErrosProcessamento(): Array<PoTableColumn> {
    return [
      { property: 'nomeArquivo', label: 'Arquivo', type: 'columnTemplate' },
      { property: 'mensagem', label: 'Mensagem' },
      {
        property: 'dataHora',
        label: 'Data',
        type: 'date',
        format: 'dd/MM/yyyy hh:mm:ss',
      },
    ];
  }

  obterColunasConsolidaItems(): Array<PoTableColumn> {
    return [
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true, width: '140px', type: 'number'},
      { property: 'cddEmbarqRes',  label: 'Embarque/Res'},
      { property: 'cddEmbarq',     label: 'Embarque', visible: false},
      { property: 'nrResumo',      label: 'Resumo',   visible: false},
      { property: 'nrPedido',      label: 'Pedido' },
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'dthrAlt',       label: 'Data Alt.', type:'date', format: "dd/MM/yyyy"},
      { property: 'userAlt',       label: 'Usuário' },
      { property: 'lConsolidado',  label: 'Consolidado' },
      { property: 'lFaturado',     label: 'Faturado' },
    ]

  }

  obterColunasFaturado(): Array<PoTableColumn> {
    return [
      { property: 'codEstabel',    label: 'Estab.',   visible: false, width: '120px'},
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true,  width: '140px', type: 'number'},
      { property: 'dtEmisNota',    label: 'Data', type: 'date', format: "dd/MM/yyyy"},
      { property: 'idiSit',        label: 'Sefaz',type: 'label',
        labels: [
          { value: 1,   color: 'color-08', textColor: 'white', label: 'NFe não autorizada',},
          { value: 2,   color: 'color-08', textColor: 'white', label: 'Em Processamento',},
          { value: 3,   color: 'color-09', textColor: 'white', label: 'Autorizada',},
          { value: 4,   color: 'color-07', textColor: 'white', label: 'Uso denegado',},
          { value: 5,   color: 'color-07', textColor: 'white', label: 'Docto Rejeitado',},
          { value: 6,   color: 'color-07', textColor: 'white', label: 'Docto Cancelado',},
          { value: 7,   color: 'color-07', textColor: 'white', label: 'Docto Inutilizado',},
          { value: 8,   color: 'color-08', textColor: 'white', label: 'Em processamento no Aplicativo de Transmissão',},
          { value: 9,   color: 'color-08', textColor: 'white', label: 'Em processamento na SEFAZ',},
          { value: 10,  color: 'color-08', textColor: 'white', label: 'Em processamento no SCAN',},
          { value: 11,  color: 'color-10', textColor: 'white', label: 'NF-e Gerada',},
          { value: 12,  color: 'color-08', textColor: 'white', label: 'NF-e em Processo de Cancelamento',},
          { value: 13,  color: 'color-08', textColor: 'white', label: 'NF-e em Processo de Inutilizacao',},
          { value: 14,  color: 'color-08', textColor: 'white', label: 'NF-e Pendente de Retorno',},
          { value: 15,  color: 'color-07', textColor: 'white', label: 'DPEC recebido pelo SCE',},
          { value: 99,  color: 'color-08', textColor: 'white', label: 'Aguardando NFE',},
          { value: 100, color: 'color-10', textColor: 'white', label: 'Nota Atualizada Estoque',},
          { value: 102, color: 'color-07', textColor: 'white', label: 'ERRO verificar pendências',},
          { value: 103, color: 'color-08', textColor: 'white', label: 'Aguardando Reprocessamento',},
        ],
      },
      { property: 'cSerie',        label: 'Serie' },
      { property: 'nrNotaFis',     label: 'Nota Fiscal' },      
      { property: 'cddEmbarqRes',  label: 'Embarque/Res'},
      { property: 'cddEmbarq',     label: 'Embarque', visible: false},
      { property: 'nrResumo',      label: 'Resumo',   visible: false},
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'lFaturado',     label: 'Faturado' },
    ]

  }

  //---Faturar Embarque
  public FaturarEmbarque(params?: any){
    return this.http.post(`${this._url}/FaturarEmbarque`, params, {headers:headersTotvs}).pipe(take(1))  
  }
  //---Calculo de Fretes  
  public ObterCalculoFrete(params?: any){
    return this.http.post(`${this._url}/ObterCalculoFrete`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //--- Consolidar
  public ObterConsolidar(params?: any){
    return this.http.post(`${this._url}/ObterConsolidar`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //--- Peso Item
  public ObterPesoItem(params?: any){
    return this.http.post(`${this._url}/ObterPesoItem`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //--- Eliminar Pedido da Consolidação por id
  public EliminarPorId(params?: any) {
    return this.http.post(`${this._url}/EliminarPorId`, params, { headers: headersTotvs }).pipe(take(1));
  }

  //--- Atualizar Envio para Histórico
  public onAttEnvHist(params?: any){
    return this.http.get(`${this._urlGeral}/onAttEnvHist`, {params:params, headers:headersTotvs}).pipe(take(1));
  }
  
  //--- Obter parametros de Cadastro
  public ObterCadastro(params?: any){
    return this.http.get(`${this._urlGeral}/ObterCadastro`, {params:params, headers:headersTotvs}).pipe(take(1));
  }

  //--- Obter Situação do RPW 
  public piObterSituacaoRPW(params?: any){
    return this.http.get(`${this._urlGeral}/piObterSituacaoRPW`, {params:params, headers:headersTotvs}).pipe(take(1));
  }

  //--- Parametros do Estabelecimento
  public ObterParamsDoEstabelecimento(id: string) {
    return this.http.get<any>(`${this._url}/ObterParamsEstab?codEstabel=${id}`, {headers: headersTotvs,}).pipe(take(1));
  }

  //--- Obter Dados do Resumo Final
  public ObterResumo(params?: any) {
    return this.http.post(`${this._url}/ObterResumo`, params, { headers: headersTotvs }).pipe(take(1));
  }

  //--- Obter dados do Relatório
  public ObterDadosNota(params?: any){
    return this.http.post(`${this._url}/ObterDadosNota`, params, { headers:headersTotvs}).pipe(take(1));
  }

  //--- COMBOBOX TECNICOS
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterEmitentesDoEstabelecimento(id: string) {
    return this.http.get<any>(`${this._url}/ObterTecEstab?codEstabel=${id}`, {headers: headersTotvs,}).pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codTec + ' ' + item.nomeAbrev,
              value: item.codTec,
            };
          });
        }),
        take(1)
      );
  }

  //--- COMBOBOX ESTABELECIMENTOS
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterEstabelecimentos(params?: any) {
    return this.http.get<any>(`${this._url}/ObterEstab`, { params: params, headers: headersTotvs })
      .pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codEstab + ' ' + item.nome,
              value: item.codEstab,
              codFilial: item.codFilial,
            };
          });
        }),
        take(1)
      );
  }

  //--- COMBOBOX TRANSPORTES
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterTransportadoras() {
    return this.http.get<any>(`${this._url}/ObterTransp`, { headers: headersTotvs }).pipe(map((item) => {
      return item.items.map((item: any) => {
        return {
          label: item.codTransp + ' ' + item.nomeAbrev,
          value: item.codTransp,
        };
      });
    }),
      ///tap(data => {console.log("Data Transformada pelo Map =>", data)}),
      take(1)
    );
  }

  //--- Obter a lista totais de Pedidos do Estabelecimento
  public ObterTotais(params?: any) {
    return this.http.get(`${this._url}/ObterTotais?codEstabel=${params}`, { headers: headersTotvs, }).pipe(take(1));
  }

  public ObterTotaisFat(params?: any) {
    return this.http.get(`${this._url}/ObterTotaisFat`, {params:params, headers:headersTotvs}).pipe(take(1));
    //return this.http.get(`${this._url}/ObterTotaisFat?codEstabel=${params}`, { headers: headersTotvs, }).pipe(take(1));
  }

  //--- Programas DDK
  public AbrirProgramaTotvs(params?: any) {
    return this.http.get('/totvs-menu/rest/exec', { params, headers: headersTotvs }).pipe(take(1));
  }

};
