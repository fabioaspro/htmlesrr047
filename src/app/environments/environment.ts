// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

let cEndPoint = 'https://hawebdev.dieboldnixdorf.com.br:8543' //Trocar endpoint somente aqui

const cSenha  = cEndPoint === 'https://hawebdev.dieboldnixdorf.com.br:8543'
                              ? 'super:prodiebold11'    //desenv
                              : 'super:Prodiebold@2011' //projetos

export const environment = {
  production: false ,
  versao:'1.00.000',
  totvs_url:       cEndPoint + '/api/integracao/services/v1/apiesrr047',
  totvs_url_geral: cEndPoint + '/api/integracao/utils/v1/apidngeral',
  totvs_header:{
    'Content-Type': 'application/json',
    'Authorization': `Basic ${btoa(cSenha)}`,
    'CompanyId': 1
  },
  headersTotvsI: {    
    'Authorization': 'Basic c3VwZXI6cHJvZGllYm9sZDEx',
    'CompanyId': '1'
  },
  totvs_spool: 'http://10.151.120.56/SPOOL/'
};


