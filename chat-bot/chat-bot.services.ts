import { Injectable } from '@angular/core';
import { ChatBotModel } from 'se2_shared_modules_ui/lib/components/chat-bot/chat-bot.model';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';
import { Response } from '@angular/http';
import { BomRootData } from 'se2_shared_modules_ui/lib/components/action-menu/callservices.model';

@Injectable()
export class ChatBotService {

    constructor(private http: Http)
    {}


    public sentUserMessage(userMessage:string): Observable<ChatBotModel> {
        let options:any = {
            headers: {"Authorization":"Bearer OK6IP7W3NN7LXHH3LKLOIYW7T4TRSBED"}
        };
        
        return this.http.get('https://api.wit.ai/message?v=20191102&q=' + userMessage, options).
            map((response: Response) => <ChatBotModel>response.json()).
            do(res => {
                                      
            }).catch(error => {
                console.error(error);
                return Observable.throw(error.json())
            });
    }

    


    


}