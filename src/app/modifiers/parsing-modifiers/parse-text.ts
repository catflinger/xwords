import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle, IPuzzleProvision, ITextParsingError } from '../../model/interfaces';
import { Grid } from 'src/app/model/puzzle-model/grid';
import { InitAnnotationWarnings } from '../puzzle-modifiers/init-annotation-warnings';
import { PuzzleProvider } from 'src/app/model/interfaces';
import { TextParsingService } from 'src/app/services/parsing/text/text-parsing-service';
import { ParseData } from 'src/app/services/parsing/text/parse-data';
import { TextParsingOptions } from 'src/app/services/parsing/text/types';
import { TraceService } from 'src/app/services/app/trace.service';
import { resolveClues } from './resolve-orphans-advanced';

// interface GridReference {
//     // for example: 2 down or 23 across
//     clueNumber: number,
//     clueGroup: ClueGroup 
// }

export class ParseText extends PuzzleModifier {

    constructor(
        private textParsingService: TextParsingService,
        private traceService: TraceService,
    ) {  super(); }

    public exec(puzzle: IPuzzle): void {
        this.traceService.clearTrace();

        let parseData = new ParseData();
        parseData.clueDataType = "text";
        parseData.rawData = puzzle.provision.source;
        parseData.grid = puzzle.grid ? new Grid(puzzle.grid) : null;

        let textParsingOptions = this.getParsingOptions(puzzle.info.provider, puzzle.provision);
        let parser = this.textParsingService.parser(parseData, textParsingOptions);
        let context = parser.next();

        while(!context.done) {
            context = parser.next();
        }

        // TO DO: error handling in parsing is getting confused
        // decide once and for all
        // 1) when an exception will be thrown
        // 2) when the parsing will be abandoned and the puzzle update aborted
        // 2) when the errors will be recorded in the puzzle

        try {
            puzzle.clues = resolveClues(context.value, new Grid(puzzle.grid));

            let error: ITextParsingError = JSON.parse(JSON.stringify(context.value.error));
            puzzle.provision.parseErrors = error ? [error] : [];
            puzzle.provision.parseWarnings = JSON.parse(JSON.stringify(context.value.warnings));

            //puzzle.linked = false;
        
            new InitAnnotationWarnings().exec(puzzle);

            let lines = textParsingOptions.allowPostamble ? 
                [...context.value.preamble].concat(context.value.postamble) :
                context.value.preamble;

            this.setPuzzleInfo(puzzle, lines);

            // if we have still not found a title then add a default
            if (!puzzle.info.title) {
                puzzle.info.title = "untitled";
                puzzle.info.setter = "anon";
            }

        } catch (error) {
            throw new Error(`Failed to parse puzzle: ${error}`);
        }
    }

    private getParsingOptions(provider: PuzzleProvider, provision: IPuzzleProvision): TextParsingOptions {

        let options: TextParsingOptions = {
            allowPreamble: false,
            allowPostamble: false,
            allowTypos: false,
            azedFeatures: false,
            captionStyle: provision.captionStyle,
            hasLetterCount: provision.hasLetterCount,
            hasClueGroupHeadings: provision.hasClueGroupHeadings,
        }

        if (provider !== "text") {
            options.allowPostamble = true;
            options.allowPreamble = true;
        }

        if (provider === "ft" || provider === "cryptic-pdf" || provider === "prize-pdf" || provider === "everyman") {
            options.allowPostamble = true;
            options.allowPreamble = true;
            options.allowTypos = true;
        }

        if (provider === "azed" || provider === "gemelo" || provider === "pdf") {
            options.allowPostamble = true;
            options.allowPreamble = true;
            options.azedFeatures = true;
        }

        return options;
    }

    private setPuzzleInfo(puzzle: IPuzzle, lines: readonly string[]): void {

        if (!puzzle.info.title) {
            switch (puzzle.info.provider) {
                case "ft":  
                    this.trySetInfoFT(puzzle, lines);
                    break;
                case "azed":
                    this.trySetInfoAzed(puzzle, lines);
                    break;
                case "gemelo":
                    this.trySetInfoGemelo(puzzle, lines);
                    break;
                case "everyman":
                    this.trySetInfoEveryman(puzzle, lines);
                    break;
                case "quiptic":
                    this.trySetInfoQuiptic(puzzle, lines);
                    break;
                case "cryptic-pdf":
                    this.trySetInfoGuardian(puzzle, lines);
                    break;
                case "independent":
                    this.trySetInfoIndy(puzzle, lines);
                    break;
                default:
                    // don't know where this text came from, so try all the options
                    // in order of decreasing specificity
                    this.trySetInfoEveryman(puzzle, lines) ||
                    this.trySetInfoQuiptic(puzzle, lines) ||
                    this.trySetInfoGuardian(puzzle, lines) ||
                    this.trySetInfoAzed(puzzle, lines) ||
                    this.trySetInfoGemelo(puzzle, lines) ||
                    this.trySetInfoFT(puzzle, lines) ||
                    this.trySetInfoIndy(puzzle, lines);
                    break;
            }
        }

        if (!puzzle.info.title) {
            // still not found a title, set a default
            puzzle.info.title = `Puzzle`;
            puzzle.info.setter = "anon";
            puzzle.info.provider = "pdf";
        }
    }

    private trySetInfoFT(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example: CROSSWORD No 17,788 by MOO

        let titleExpression = new RegExp(String.raw`^CROSSWORD\s+(No|No\.|no|no\.)?\s*(?<serialNumber>[0-9,]+)\s+(set)?\s*by\s+(?<setter>[A-Z]+)`);

        for (let line of lines) {
            let match = titleExpression.exec(line.trim());

            if (match) {
                let setter = match.groups["setter"].toString();
                let serialNumber = match.groups["serialNumber"].toString();

                puzzle.info.title = `Financial Times ${serialNumber} by ${setter}`;
                puzzle.info.setter = setter;
                puzzle.info.provider = "ft";
                result = true;
                break;
            }
        }
        return result;
    }

    private trySetInfoAzed(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        // Example: Azed No. 2,717 - Plain
        // Azed  No. 2,758 Plain Azed No. 2,755 solution & notes


        for (let line of lines) {

            let titleExpression = new RegExp(String.raw`^azed\s+no\.?\s+(?<serialNumber>\d,\d\d\d)(?<subtitle>.*)$`, "i");
            let match = titleExpression.exec(line.trim());

            if (match) {

                // Azed often has a subtitle e.g. "Azed No. 2,717 - Plain" or "Azed No. 2,717 - Mixed Foursomes"
                // Extracted title text can also contain spurious stuff relating to previous puzzles that look 
                // like part of a subtitle, this needs to be ignored. For example:
                //
                // "Azed No. 2,717 Azed No 2,715 solutions and notes"
                // "Azed No. 2,481, The Observer, 90 York Way, London N1 9GU."

                puzzle.info.title = "Azed No. " + match.groups["serialNumber"].toString();

                let subtitle: string = match.groups["subtitle"] ? match.groups["subtitle"].toString().trim().toLowerCase() : null;

                if (subtitle) {
                    var subtitleExpression = new RegExp(String.raw`^(?<subtitle>.+?)(azed|solution)`, "i");
                    let subMatch = subtitleExpression.exec(subtitle);
                    if (subMatch) {
                        puzzle.info.title += " " + subMatch.groups["subtitle"].toString();
                    } else {
                        puzzle.info.title +=  " " + subtitle.toString();
                    }
                }

                puzzle.info.setter = "Azed";
                puzzle.info.provider = "azed";
                result = true;
                break;
            }
        }

        return result;
    }

    private trySetInfoGemelo(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        // Example: Gemelo No. 1 Plain

        for (let line of lines) {

            let titleExpression = new RegExp(String.raw`^gemelo\s+no\.?\s+(?<serialNumber>\d{1,2})(?<subtitle>.*)$`, "i");
            let match = titleExpression.exec(line.trim());

            if (match) {

                // Gemelo often has a subtitle e.g. "Gemelo No. 1 Plain"
                // Extracted title text can also contain spurious stuff relating to previous puzzles that look 
                // like part of a subtitle, this needs to be ignored. Gemelo may also contain solutions to Azed puzzles!
                // 
                // For example:
                // "Azed No. 2,717 Azed No 2,715 solutions and notes"
                // "Azed No. 2,481, The Observer, 90 York Way, London N1 9GU."

                puzzle.info.title = "Gemelo No. " + match.groups["serialNumber"].toString();

                let subtitle: string = match.groups["subtitle"] ? match.groups["subtitle"].toString().trim().toLowerCase() : null;

                if (subtitle && !subtitle.toLowerCase().includes("azed")) {
                    const subtitleExpression = new RegExp(String.raw`^(?<subtitle>.+?)(gemelo|solution)`, "i");
                    const subMatch = subtitleExpression.exec(subtitle);

                    if (subMatch) {
                        puzzle.info.title += " " + subMatch.groups["subtitle"].toString();
                    } else {
                        puzzle.info.title +=  " " + subtitle.toString();
                    }
                }

                puzzle.info.setter = "Gemelo";
                puzzle.info.provider = "gemelo";
                result = true;
                break;
            }
        }

        return result;
    }

    private trySetInfoEveryman(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        // Example: Everyman crossword No. 4056

        let titleExpression = new RegExp(String.raw`Everyman(\s+crossword)?\s+(no|no\.)?\s*(?<serialNumber>[0-9,]{4,5})`, "i");
        for (let line of lines) {
            let match = titleExpression.exec(line.trim());

            if (match) {
                let serialNumber = match.groups["serialNumber"].toString();

                puzzle.info.title = `Everyman ${serialNumber}`;
                puzzle.info.setter = "Everyman";
                puzzle.info.provider = "everyman";
                result = true;
            }
        }
        return result;
    }

    private trySetInfoQuiptic(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example quiptic: Quiptic crossword No 1,286 set by Chandler

        let titleExpression = new RegExp(String.raw`quiptic crossword\s+(no|no\.)?\s*(?<serialNumber>[0-9,]{4,5})\s+(set)?\s*by\s+(?<setter>[A-Za-z]+)`, "i");

        for (let line of lines) {
            let match = titleExpression.exec(line.trim());

            if (match) {
                let setter = match.groups["setter"].toString();
                let serialNumber = match.groups["serialNumber"].toString();

                puzzle.info.title = `Guardian Quiptic ${serialNumber} by ${setter}`;
                puzzle.info.setter = setter;
                puzzle.info.provider = "quiptic";
                result = true;
            }
        }
        return result;
    }
    private trySetInfoGuardian(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example: "Guardian cryptic crossword No 29,432 set by Vlad"
        // or
        // "Cryptic crossword No 29,432 set by Vlad"

        if (lines.join(" ").toLowerCase().includes("guardian")) {

            let titleExpression = new RegExp(String.raw`(guardian)?\s*cryptic crossword\s+(no|no\.)?\s*(?<serialNumber>[0-9,]{5,6})\s+(set)?\s*by\s+(?<setter>[A-Za-z]+)`, "i");

            for (let line of lines) {
                let match = titleExpression.exec(line.trim());

                if (match) {
                    let setter = match.groups["setter"].toString();
                    let serialNumber = match.groups["serialNumber"].toString();

                    puzzle.info.title = `Guardian ${serialNumber} by ${setter}`;
                    puzzle.info.setter = setter;
                    puzzle.info.provider = "cryptic";
                    result = true;
                }
            }
        }
        return result;
    }

    private trySetInfoIndy(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example: "No. 11,987 by Grecian"

        // The Indy title is quite vague and can be confused with other publications
        // so only try this if we have tried everything else

        let titleExpression = new RegExp(String.raw`^No\.\s*(?<serialNumber>[0-9,]{5,6})\s+by\s+(?<setter>[A-Za-z ]+)$`);

        for (let line of lines) {
            let match = titleExpression.exec(line.trim());

            if (match) {
                let setter = match.groups["setter"].toString();
                let serialNumber = match.groups["serialNumber"].toString();

                puzzle.info.title = `Independent ${serialNumber} by ${setter}`;
                puzzle.info.setter = setter;
                puzzle.info.provider = "independent";
                result = true;
            }
        }
        return result;
    }

}
