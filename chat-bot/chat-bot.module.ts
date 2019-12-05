import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ChatBotComponent } from "./chat-bot.component";
import { TranslationModule } from "se2_shared_modules_ui";
import { ChatBotService } from "se2_shared_modules_ui/lib/components/chat-bot/chat-bot.services";
// import { NoopAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
    imports:[CommonModule, TranslationModule],
    declarations:[ChatBotComponent],
    exports:[ChatBotComponent],
    providers:[ChatBotService]
})

export class ChatBotModule {}