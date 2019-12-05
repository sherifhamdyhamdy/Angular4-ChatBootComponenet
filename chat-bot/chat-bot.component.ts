import { Component, OnInit, ViewEncapsulation, Inject, PLATFORM_ID } from "@angular/core";
import { ChatBotService } from "se2_shared_modules_ui/lib/components/chat-bot/chat-bot.services";
import { TransferState } from "se2_shared_modules_ui";
import { timingSafeEqual } from "crypto";
import { isPlatformBrowser } from "@angular/common";

@Component({
    selector: 'chat-bot',
    templateUrl: './chat-bot.component.html',
    styleUrls: ['./chat-bot.component.css'],
    encapsulation: ViewEncapsulation.None
    // animations: [
    //     trigger('hideShowAnimator', [
    //         state('true' , style({ opacity: 1 })), 
    //         state('false', style({ opacity: 0 })),
    //         transition('0 => 1', animate('.5s')),
    //         transition('1 => 0', animate('.9s'))
    //     ])
    //   ]
})

export class ChatBotComponent implements OnInit {
    constructor(public chatBotService: ChatBotService, public transferState: TransferState, @Inject(PLATFORM_ID) private platformId) {

    }

    message: string;
    chatBoxOn = false;
    defultMessage = 'please open the following link:';

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.toggleChatBox();
            }, 2000);
        }
        console.log(this.transferState.get('/BomServices/item/getRootItems/' + this.transferState.get("UID")));
        console.log("finished")

    }
    private sendUserMessage(userMessage:string) {
        let isEnglish:boolean;
        isEnglish=this.stringIsEnglish(userMessage.trim())
        if(!isEnglish)
        {
            this.botReplay("Oops, We are supporting English only.",false)

        }else 
        if(userMessage.toLowerCase()=='examples' || userMessage.toLowerCase()=='example')
        {
            this.botReplay(`
            <ul style="padding-left: 13px;">
            <li><strong>Part Search:</strong> search \{partName\}</li>
            <li><strong>Part Detail:</strong> part detail \{partName\}</li>
            <li><strong>Parametric Search:</strong> parametric search \{partName\} Development Systems</li>
            <li><strong>Open bom:</strong> open \{bomName\}</li>
            <li><strong>Open browse tab:</strong> open browse \{bomName\}</li>
            <li><strong>Open match tab:</strong> open match \{bomName\}</li>
            <li><strong>Open risk tab:</strong> open risk \{subTab\} \{bomName\}</li>
            <li><strong>Open Report:</strong> open \{reportName\} report \{bomName\}</li>
        </ul>
             `, false);
            } else {

                this.chatBotService.sentUserMessage(userMessage).subscribe((res) => {
                    console.log("res:", res);

                    if (res == null || res.entities == null || res.entities.intent == null || res.entities.intent.length <= 0) {
                        this.botReplay("I didn't get that. Can you say it again?", false)

                    } else

                        if (res.entities.intent[0].value == "partSearchIntent") {

                            this.handlePartSearchIntent(res);
                        } else if (res.entities.intent[0].value == "howToIntent") {
                            this.handleHowToIntenet(res);
                        } else if (res.entities.intent[0].value == "bomManagerIntent") {
                            this.handelBomManager(res)

                        } else if (res.entities.intent[0].value == "reportIntent") {
                            this.handelReport(res)
                        }
                        else if (res.entities.intent[0].value == "riskIntent") {
                            this.handelRisk(res)
                        } else if (res.entities.intent[0].value == "browseIntent") {
                            this.handlebrowse(res)
                        } else if (res.entities.intent[0].value == "matchIntent") {
                            this.handlematch(res)
                        } else if (res.entities.intent[0].value == "parametricSearchIntent") {
                            this.handlParametricSearch(res)
                        } else if (res.entities.intent[0].value == "partDeatailIntenet") {
                            this.handlPartDetail(res)
                        }
                        else if (res.entities.intent[0].value == "greeting") {
                            this.handlGreeting(res)
                        } else if (res.entities.intent[0].value == "help") {
                            this.handlHelp(res)
                        }

                });
            }
    }

    handlHelp(res) {
        this.botReplay('https://support.siliconexpert.com/hc/en-us')
    }


    handlPartDetail(res) {
        this.botReplay('https://dev.siliconexpert.com/partdetail/LM317-Continental-20Device-20India-20Limited-62502738.html/overview')
    }

    handlGreeting(res) {
        this.botReplay('Hi,How can I help you?', false)

    }

    handlParametricSearch(res) {
        if (res.entities.parametricRole != null && res.entities.parametricRole.length > 0 && res.entities.parametricRole[0].value) {
            if (res.entities.parametricRole[0].value.toLowerCase() == 'development systems') {
                this.message = "https://dev.siliconexpert.com/search/lm317/1/sort@default/productSelect:Development%20Systems"
                this.botReplay(this.message);
            } else {
                this.message = "https://dev.siliconexpert.com/search/lm317/1/sort@default/productSelect:Power%20Management"
                this.botReplay(this.message);
            }

        }
    }

    handlebrowse(res) {
        this.message = 'https://dev.siliconexpert.com/bom/browse/' + this.getbomID(res);
        this.botReplay(this.message);
        console.log('handlebrowse::message==' + this.message)
    }

    handlematch(res) {
        this.message = 'https://dev.siliconexpert.com/bom/match/' + this.getbomID(res);
        this.botReplay(this.message);
    }

    handelRisk(res) {
        let riskTabName = this.getRiskTabName(res)
        this.message = 'https://dev.siliconexpert.com/bom/risk/' + riskTabName + '/' + this.getbomID(res);
        this.botReplay(this.message);
    }

    handelReport(res) {

        let reportName = this.getReportName(res)
        this.message = 'https://dev.siliconexpert.com/bom/reports/' + reportName + '/' + this.getbomID(res);
        this.botReplay(this.message);


    }

    private getReportName(res: any) {
        if (res != null && res.entities != null && res.entities.reportRole != null && res.entities.reportRole.length > 0 && res.entities.reportRole[0].value) {
            return res.entities.reportRole[0].value;
        } else {
            return 'summary';
        }
    }
    private getRiskTabName(res: any) {
        if (res != null && res.entities != null && res.entities.riskrole != null && res.entities.riskrole.length > 0 && res.entities.riskrole[0].value) {
            return res.entities.riskrole[0].value;
        } else {
            return 'overall';
        }
    }

    handelBomManager(res) {
        let bomId
        if (res.entities.openbomrole != null) {
            bomId = this.getbomID(res)
        } else if (res.entities.local_search_query != null) {
            bomId = this.getbomID(res)
        }

        if (bomId == 'notFound') {
            this.message = "Sorry, We can't found this BOM"
            this.botReplay(this.message, false);
        } else {

            this.message = 'https://dev.siliconexpert.com/bom/browse/' + bomId;
            this.botReplay(this.message);
        }

    }

    private handlePartSearchIntent(res) {
        if(res.entities && res.entities.PartSearch && res.entities.PartSearch.length>=0)
        {
        let search_query = res.entities.PartSearch[0].value;
        if(search_query && search_query.length<3)
        {
            this.botReplay("You can't search with part less than 3 characters, Example bav99",false);
        }else{
        let searchText = search_query.trim().replace(new RegExp('\\\\', 'g'), '-slah-').replace(new RegExp('\\?', 'g'), '').replace(new RegExp('%', 'g'), '').replace(new RegExp(';', 'g'), '').replace(new RegExp('\\+', 'g'), '-plus-');
        var encodedSearchText = encodeURIComponent(searchText);
        this.message = "https://dev.siliconexpert.com/search?text=" + encodedSearchText;
        this.botReplay(this.message);
        console.log("message==" + this.message);
    }
        }else if(res.entities && res.entities.local_search_query && res.entities.local_search_query.length>=0){
            if(res.entities.local_search_query[0].value.toLowerCase()=='search' || res.entities.local_search_query[0].value.toLowerCase()=='search for')
            {
                this.botReplay("Oops, You forget to write part number",false)
            }else 
            if(res.entities.local_search_query[0].value.toLowerCase()=='power managment')
            {
                this.botReplay('https://dev.siliconexpert.com/search/power%2520management/1/sort@default/productSelect:Power%20Management');

            }if(res.entities.local_search_query[0].value.toLowerCase()=='pevelopment systemst')
            {
                this.botReplay('https://dev.siliconexpert.com/search/Development%2520Systems/1/sort@default/productSelect:Development%20Systems');

            }
            else{
                let search_query = res.entities.local_search_query[0].value;
        let searchText = search_query.trim().replace(new RegExp('\\\\', 'g'), '-slah-').replace(new RegExp('\\?', 'g'), '').replace(new RegExp('%', 'g'), '').replace(new RegExp(';', 'g'), '').replace(new RegExp('\\+', 'g'), '-plus-');
        var encodedSearchText = encodeURIComponent(searchText);
        this.message = "https://dev.siliconexpert.com/search?text=" + encodedSearchText;
        this.botReplay(this.message);

            }
        } else if (res.entities && res.entities.local_search_query && res.entities.local_search_query.length >= 0) {
            if (res.entities.local_search_query[0].value.toLowerCase() == 'search' || res.entities.local_search_query[0].value.toLowerCase() == 'search for') {
                this.botReplay("oops, You forget to write part number", false)
            } else
                if (res.entities.local_search_query[0].value.toLowerCase() == 'power managment') {
                    this.botReplay('https://dev.siliconexpert.com/search/power%2520management/1/sort@default/productSelect:Power%20Management');

                } else {
                    let search_query = res.entities.local_search_query[0].value;
                    let searchText = search_query.trim().replace(new RegExp('\\\\', 'g'), '-slah-').replace(new RegExp('\\?', 'g'), '').replace(new RegExp('%', 'g'), '').replace(new RegExp(';', 'g'), '').replace(new RegExp('\\+', 'g'), '-plus-');
                    var encodedSearchText = encodeURIComponent(searchText);
                    this.message = "https://dev.siliconexpert.com/search?text=" + encodedSearchText;
                    this.botReplay(this.message);

                }
        }
    }

    handleHowToIntenet(res) {
        this.message = "https://www.siliconexpert.com/how-to-find-electronic-component-data-points"
        this.botReplay(this.message);

    }

    getbomID(res): string {
        let bomId = 'notFound';
        if (res != null && res.entities != null) {
            let bomName;
            if (res.entities.local_search_query != null && res.entities.local_search_query.length > 0 && res.entities.local_search_query[0].value) {
                bomName = res.entities.local_search_query[0].value
            } else if (res.entities.matchrole != null && res.entities.matchrole.length > 0 && res.entities.matchrole[0].value) {
                bomName = res.entities.matchrole[0].value
            } else if (res.entities.browserole != null && res.entities.browserole.length > 0 && res.entities.browserole[0].value) {
                bomName = res.entities.browserole[0].value
            } if (res.entities.openbomrole != null && res.entities.openbomrole.length > 0 && res.entities.openbomrole[0].value) {
                bomName = res.entities.openbomrole[0].value
            }

            bomName = this.getNoneStopWords(bomName)

            var listBoms = this.transferState.get('/BomServices/item/getRootItems/' + this.transferState.get("UID"))

            for (let element of listBoms.rootProject) {
                if (element.itemType == 2 && element.itemName == bomName) {
                    bomId = (element.itemId != null && element.itemId > 0 ? element.itemId : '18611')
                    break

                }

            }

        } else {
            bomId = '18611'
        }

        return (bomId != null ? bomId : '18611')
    }

    toggleChatBox() {
        this.chatBoxOn = !this.chatBoxOn;
        if (this.chatBoxOn) {
            const box = document.getElementById('box-body');
            if (box.childNodes.length === 0) {
                this.typingLoading(true);
                setTimeout(() => {
                    this.botReplay(`
                    Hello my name is <strong>Sebot</strong> I make it simple and seamless for you
                    <br> You can ask about BOMs PartNumbers or whatver you need.
                    <br> You can type <strong>Examples</strong> to give you examples`, false);

                    this.typingLoading(false);
                }, 2000);
            }
        }
    }

    genrateAvatar(avatar) {
        const avatarElement = document.createElement('div');
        avatarElement.className = 'avatar-container';
        avatarElement.innerHTML = avatar;
        return avatarElement;
    }
    sendMsg(value: string) {
        const date = new Date();
        const time = document.createElement('div');
        time.className = 'msg-time';
        time.innerHTML = this.formatAMPM(date);
        value = value.trim();
        const box = document.getElementById('box-body');
        const message = document.createElement('div');
        message.className = 'message-container';
        message.innerHTML = '<div class=\'message-user\'>' + value + '</div>';
        message.firstChild.appendChild(this.genrateAvatar(`
        <svg version="1.1" id="Layer_1" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 299.997 299.997" style="enable-background:new 0 0 299.997 299.997;" xml:space="preserve">
<g>
	<g>
		<path fill="#5caede" d="M149.996,0C67.157,0,0.001,67.158,0.001,149.997c0,82.837,67.156,150,149.995,150s150-67.163,150-150
			C299.996,67.156,232.835,0,149.996,0z M150.453,220.763v-0.002h-0.916H85.465c0-46.856,41.152-46.845,50.284-59.097l1.045-5.587
			c-12.83-6.502-21.887-22.178-21.887-40.512c0-24.154,15.712-43.738,35.089-43.738c19.377,0,35.089,19.584,35.089,43.738
			c0,18.178-8.896,33.756-21.555,40.361l1.19,6.349c10.019,11.658,49.802,12.418,49.802,58.488H150.453z"/>
	</g>
</g>
</svg>`));
        message.firstChild.appendChild(time);
        box.appendChild(message);
        box.scroll({
            top: box.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });

        this.sendUserMessage(value);

    }

    botReplay(value: string, showDefultMessage = true) {
        const date = new Date();
        const time = document.createElement('div');
        time.className = 'msg-time';
        time.innerHTML = this.formatAMPM(date);
        const box = document.getElementById('box-body');
        const message = document.createElement('div');
        message.className = 'message-container';
        let showtMessage = '';
        if (showDefultMessage) {
            showtMessage = 'Please open the following link:</br>';
        }
        let valueMSG = value;
        if (this.isValidURL(value)) {
            valueMSG = '<a href="' + value + '" target="_blank" >' + value + '</a>';
        }

        message.innerHTML = '<div class=\'message-bot\'>' + showtMessage + valueMSG + '</div>';
        message.firstChild.appendChild(this.genrateAvatar(`
        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="30px" height="30px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve">
<g>
	<path fill="#5caede" d="M257.938,336.072c0,17.355-14.068,31.424-31.423,31.424c-17.354,0-31.422-14.068-31.422-31.424
		c0-17.354,14.068-31.423,31.422-31.423C243.87,304.65,257.938,318.719,257.938,336.072z M385.485,304.65
		c-17.354,0-31.423,14.068-31.423,31.424c0,17.354,14.069,31.422,31.423,31.422c17.354,0,31.424-14.068,31.424-31.422
		C416.908,318.719,402.84,304.65,385.485,304.65z M612,318.557v59.719c0,29.982-24.305,54.287-54.288,54.287h-39.394
		C479.283,540.947,379.604,606.412,306,606.412s-173.283-65.465-212.318-173.85H54.288C24.305,432.562,0,408.258,0,378.275v-59.719
		c0-20.631,11.511-38.573,28.46-47.758c0.569-84.785,25.28-151.002,73.553-196.779C149.895,28.613,218.526,5.588,306,5.588
		c87.474,0,156.105,23.025,203.987,68.43c48.272,45.777,72.982,111.995,73.553,196.779C600.489,279.983,612,297.925,612,318.557z
		 M497.099,336.271c0-13.969-0.715-27.094-1.771-39.812c-24.093-22.043-67.832-38.769-123.033-44.984
		c7.248,8.15,13.509,18.871,17.306,32.983c-33.812-26.637-100.181-20.297-150.382-79.905c-2.878-3.329-5.367-6.51-7.519-9.417
		c-0.025-0.035-0.053-0.062-0.078-0.096l0.006,0.002c-8.931-12.078-11.976-19.262-12.146-11.31
		c-1.473,68.513-50.034,121.925-103.958,129.46c-0.341,7.535-0.62,15.143-0.62,23.08c0,28.959,4.729,55.352,12.769,79.137
		c30.29,36.537,80.312,46.854,124.586,49.59c8.219-13.076,26.66-22.205,48.136-22.205c29.117,0,52.72,16.754,52.72,37.424
		c0,20.668-23.604,37.422-52.72,37.422c-22.397,0-41.483-9.93-49.122-23.912c-30.943-1.799-64.959-7.074-95.276-21.391
		C198.631,535.18,264.725,568.41,306,568.41C370.859,568.41,497.099,486.475,497.099,336.271z M550.855,264.269
		C547.4,116.318,462.951,38.162,306,38.162S64.601,116.318,61.145,264.269h20.887c7.637-49.867,23.778-90.878,48.285-122.412
		C169.37,91.609,228.478,66.13,306,66.13c77.522,0,136.63,25.479,175.685,75.727c24.505,31.533,40.647,72.545,48.284,122.412
		H550.855L550.855,264.269z"/>
</g>
</svg>`));
        this.typingLoading(true);
        setTimeout(() => {
            this.typingLoading(false);
            message.firstChild.appendChild(time);
            box.appendChild(message);
            box.scroll({
                top: box.scrollHeight,
                left: 0,
                behavior: 'smooth'
            });
        }, 3000);

    }

    typingLoading(show) {
        if (show) {
            const box = document.getElementById('box-body');
            const message = document.createElement('div');
            message.className = 'message-container typing-loading';
            message.innerHTML = `<div class=\'message-bot\'>
             <svg _ngcontent-c2="" aria-hidden="true" class="icon  icon--large icon--fill" viewBox="0 0 60 30" width="25">
             <circle cx="10" cy="15" fill="#999" r="6">
             <animate attributeName="opacity" begin="0.1" dur="1s" repeatCount="indefinite" values="0;1;0"></animate></circle>
             <circle cx="30" cy="15" fill="#999" r="6">
             <animate attributeName="opacity" begin="0.2" dur="1s" repeatCount="indefinite" values="0;1;0"></animate></circle>
             <circle cx="50" cy="15" fill="#999" r="6">
             <animate attributeName="opacity" begin="0.3" dur="1s" repeatCount="indefinite" values="0;1;0"></animate></circle></svg>
            </div>`;
            box.appendChild(message);
            box.scroll({
                top: box.scrollHeight,
                left: 0,
                behavior: 'smooth'
            });
        } else {
            document.querySelector('.typing-loading').remove();
        }
    }
    isValidURL(string) {
        var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return (res !== null)
    };


    getNoneStopWords(sentence) {
        var common = this.getStopWords();
        var wordArr = sentence.match(/\w+/g),
            commonObj = {},
            uncommonArr = [],
            word, i;
        for (i = 0; i < common.length; i++) {
            commonObj[common[i].trim()] = true;
        }
        for (i = 0; i < wordArr.length; i++) {
            word = wordArr[i].trim().toLowerCase();
            if (!commonObj[word]) {
                uncommonArr.push(word);
            }
        }
        return uncommonArr;
    }
    getStopWords() {
        return ["tab", "bom", "overall", "multisource", "compliance", "inventory", "lifecycle", "open", "rohs", "pcn"];
    }
    formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }



    stringIsEnglish(str) {
        var ENGLISH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]{};|+_~,-'?/\"\\ ";
        var index;

        for (index = str.length - 1; index >= 0; --index) {
            if (ENGLISH.indexOf(str.substring(index, index + 1)) < 0) {
                return false;
            }
        }
        return true;
    }
    clearClose() {
        const box = document.getElementById('box-body');
        this.chatBoxOn = false;
        box.innerHTML = '';
    }
}