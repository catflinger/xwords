import { LineType, TextParsingOptions } from './types';

export class Line {

    constructor(
        public readonly rawText: string,
        public readonly lineNumber: number,
        public readonly options?: TextParsingOptions,
    ) {}

    public get lineType(): LineType {
        let result: LineType = "unknown";

        if (this.isEmpty) {
            result = "empty";
        } else if (this.hasAcrossMarker) {
            result = "acrossMarker";
        } else if (this.hasDownMarker) {
            result = "downMarker";
        } else if (this.isJunk) {
            result = "empty";
        } else if (this.hasStartMarker && this.hasEndMarker) {
            result = "clue";
        } else if (this.hasEndMarker || this.hasPartialEndMarker) {
            result = "clueEnd";
        } else if (this.hasStartMarker) {
            result = "clueStart";
        }

        return result;
    }

    public get text(): string {
        return this.rawText.trim();
    }

    private get isEmpty(): boolean {
        return this.rawText.trim().length === 0;
    }

    private get hasStartMarker(): boolean {
        if (this.options.captionStyle === "any") {
            return true;
        
        } else if (this.options.captionStyle === "alphabetical") {
            let exp = new RegExp(String.raw`^\s*[A-Z]\s`);
            return exp.test(this.text);

        } else  if (/^\s*\d{1,2},\s+\D/.test(this.text)) {
            //Special case: this line from Azed notes looks like a clue start
            // 18, cos(set)s; 23, tit l in ree; 27, anag. + t, & lit. 
            return false;

        } else {
            let exp = new RegExp(String.raw`^\s*\*?\s*\d{1,2}\D`, "i");
            return exp.test(this.text);
        }
    }

    private get hasEndMarker(): boolean {
        if (!this.options.hasLetterCount) {
            return true;
        } else if ((new RegExp(String.raw`^(\s*The)?\s*Chambers\s+Dictionary\s+\(20\d\d\)\s*$`, "i").test(this.text))) {
            return false;
        } else {
            let exp: RegExp = new RegExp(String.raw`\(\d[a-z,0-9- ]*\)$`, "i");
            //let exp: RegExp = new RegExp(String.raw`\(\d[,0-9- ]*(words)?(\s*,\s*apostrophe)?\s*\)$`, "i");
            return exp.test(this.text);
        }
    }

    private get hasPartialEndMarker(): boolean {
        if (!this.options.hasLetterCount) {
            return false;
        } else {
            //let exp = new RegExp(String.raw`^\s*[,0-9- ]*(words)?(\s*,\s*apostrophe)?\s*\)$`, "i");
            let exp = new RegExp(String.raw`([,0-9- ]|word|words|or|apostrophe)+\)$`, "i");
            return exp.test(this.text) && !this.text.includes("(");
        }
    }

    private get hasAcrossMarker(): boolean {
        if (this.options && this.options.allowTypos) {
            let exp = new RegExp(String.raw`^(ACROSS|ACROS|AROSS|ACRPSS)$`, "i");
            return exp.test(this.text);
        } else {
            let exp = new RegExp(String.raw`^ACROSS$`, "i");
            return exp.test(this.text);
        }
    }

    private get hasDownMarker(): boolean {
        let exp = new RegExp(String.raw`^DOWN$`, "i");
        return exp.test(this.text);
    }

    private get isJunk(): boolean {
        const expressions: RegExp[] = [
        new RegExp(String.raw`^[0-9 ]+$`),
        new RegExp(String.raw`^[A-Z ]+$`),
        new RegExp(String.raw`Solution No\.?\s+[,0-9]+$`),
        new RegExp(String.raw`The first five correct entries drawn`),
        RegExp(String.raw`Entries to: The Guardian`),
        RegExp(String.raw`P.O. Box 17566, Birmingham, B33 3EZ`),
        RegExp(String.raw`Alex Bellos`),
        RegExp(String.raw`The Guardian on Monday`)];

        return expressions.reduce(
            (result: boolean, next: RegExp) => result || next.test(this.text),
            false
        );
    }

}