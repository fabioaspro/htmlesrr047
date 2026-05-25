import { booleanAttribute, Component, inject, Input, OnInit } from '@angular/core'
import { environment } from '../../environments/environment'
import { NgIf } from '@angular/common'
import { TotvsService } from '../../services/totvs-service.service'

@Component({
    selector: 'btnDownload',
    templateUrl: './btn-download.component.html',
    styleUrl: './btn-download.component.css',
    standalone: true,
    imports: [
      NgIf,
    ]
})
export class BtnDownloadComponent {
  private srvTotvs = inject(TotvsService)
  
  @Input() nomeArquivo: string=''
  @Input({transform: booleanAttribute}) mostrarNomeArquivo: boolean=true
  
  urlSpool:string=''

  ngOnInit(): void {
    
    this.srvTotvs.ObterCadastro({tabela: 'spool', codigo: 'BPD'}).subscribe({
        next: (response: any) => {
          this.urlSpool = response.desc
        }
    })
    
  }

}
