export class ChatBotModel {


    "_text": string
    "entities":entities 
    "msg_id": string

}

export class entities 
    {
    "local_search_query": local_search_query[]
    "PartSearch":local_search_query[]
    "PartDeatailRole":local_search_query[]
    "reportRole":local_search_query[]
    "openbomrole":local_search_query[]
    "riskrole":local_search_query[]
    "browserole":local_search_query[]
    "matchrole":local_search_query[]
    "parametricRole":local_search_query[]
    "intent": intent[]
   }


export class local_search_query {
    "suggested": boolean
    "confidence": number
    "value": string
    "type": string

}

export class intent{
    "confidence": number
    "value": string
}


