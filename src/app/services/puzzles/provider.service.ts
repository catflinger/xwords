import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProviderService {

    constructor() { }

    getProviderString(provider: string): string {
        let result: string;

        switch (provider) {
            case "ft":
                result = "Financial Times";
                break;
            case "cryptic":
            case "cryptic-pdf":
            case "cryptic-beta":
                result = "Guardian";
                break;
            case "prize":
            case "prize-pdf":
                result = "Guardian Prize";
                break;
            case "mycrossword-featured":
            case "mycrossword-cryptic":
            case "mycrossword-jumbo":
            case "mycrossword-mini":
            case "mycrossword-quick":
                result = "MyCrossword";
                break;
            case "quiptic":
                result = "Quiptic";
                break;
            case "independent":
                result = "Independent";
                break;
            case "ios":
                result = "Independent on Sunday";
                break;
            case "everyman":
            case "everyman-pdf":
                result = "Everyman";
                break;
            case "azed":
                result = "Azed";
                break;
            case "gemelo":
                result = "Gemelo";
                break;
            default:
                result = provider;
                break;
        };

        return result;
    }
}