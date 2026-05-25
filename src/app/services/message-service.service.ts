import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private mensagem: string [] = [];

  constructor() { }

  public adicionarMensagem(mensagem:string){
    this.mensagem.push(mensagem);
  }

  public limparMensagem(){
    this.mensagem = [];
  }
}
