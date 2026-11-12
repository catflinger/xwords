import { ContentNode } from './content-node';

export class HtmlNode extends ContentNode {

    constructor(
        name: string,
        private html: string
    ) {
        super(name, false);
    }

    public toString(): string {
        if (this.html) {
            return `<${this.name} style="border: solid; margin-bottom: 2em;">${this.html}</${this.name}>`;
        }
        return "";
    }
}