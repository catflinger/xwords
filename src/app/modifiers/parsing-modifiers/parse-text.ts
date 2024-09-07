import { PuzzleModifier } from '../puzzle-modifier';
import { ClueGroup, IClue, IGrid, IPuzzle, IPuzzleProvision, ITextParsingError } from '../../model/interfaces';
import { Grid } from 'src/app/model/puzzle-model/grid';
import { InitAnnotationWarnings } from '../puzzle-modifiers/init-annotation-warnings';
import { PuzzleProvider } from 'src/app/model/interfaces';
import { TextParsingService } from 'src/app/services/parsing/text/text-parsing-service';
import { ParseData } from 'src/app/services/parsing/text/parse-data';
import { TextParsingOptions } from 'src/app/services/parsing/text/types';
import { TraceService } from 'src/app/services/app/trace.service';
import { IParseContext } from 'src/app/services/parsing/text/text-parsing-context';
import { Clue } from 'src/app/model/puzzle-model/clue';
import { GridReference } from 'src/app/model/puzzle-model/grid-reference';

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
        // 2) when the errros will be recorded in the puzzle

        try {
            puzzle.clues = this.resolveOrphans(context.value, puzzle.grid);

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

        if (provider === "ft") {
            options.allowPostamble = true;
            options.allowPreamble = true;
            options.allowTypos = true;
        }

        if (provider === "azed" || provider === "pdf") {
            options.allowPostamble = true;
            options.allowPreamble = true;
            options.azedFeatures = true;
        }

        return options;
    }

    private resolveOrphans(context: IParseContext, gridData: IGrid): IClue[] {
        let result: IClue[];
        const orphans = context.orphans;
        const clues = context.clues;

        if (orphans.length) {
            const bestFit: ClueGroup = this.getBestFit(orphans, clues, gridData);

            // make a mutable copy of the orphaned clues
            let iorphans = JSON.parse(JSON.stringify(orphans));
            iorphans.forEach((orphan: IClue) => orphan.group = bestFit);

            result = JSON.parse(JSON.stringify(clues)).concat(iorphans);

        } else {
            result = JSON.parse(JSON.stringify(clues));
        }

        return result;
    }

    private getBestFit(orphans: readonly Clue[], clues: readonly Clue[], gridData: IGrid): ClueGroup {
        let result: ClueGroup;

        if (gridData) {
            const grid: Grid = new Grid(gridData);

            let acrossCount = 0;
            let downCount = 0;

            orphans.forEach(orphan => {
                let firstDigits: number = 0;

                let match = /^\d{1,2}/.exec(orphan.caption);
                if (match) {
                    firstDigits = parseInt(match.toString());
                }

                let acrossRef = grid.getGridEntryFromReference(new GridReference({
                    id: 0,
                    // TO DO: think about 1, 2 etc
                    anchor: firstDigits,
                    direction: "across"
                }));

                let downRef = grid.getGridEntryFromReference(new GridReference({
                    id: 0,
                    // TO DO: think about 1, 2 etc
                    anchor: firstDigits,
                    direction: "down"
                }));

                if (acrossRef.length) {
                    acrossCount++;
                }

                if (downRef.length) {
                    downCount++;
                }
            });

            result = acrossCount > downCount ? "across" : "down";
        
        } else {
            const acrossCount = clues.filter(clue => clue.group === "across").length;
            const downCount = clues.filter(clue => clue.group === "down").length;

            result = acrossCount < downCount ? "across" : "down";
        }

        return result;
    }

    private setPuzzleInfo(puzzle: IPuzzle, lines: readonly string[]): void {

        if (puzzle.info.title) {
            // already has a title, do nothing

        } else if(this.trySetInfoEveryman(puzzle, lines) ||
            this.trySetInfoQuiptic(puzzle, lines) ||
            this.trySetInfoGuardian(puzzle, lines) ||
            this.trySetInfoAzed(puzzle, lines) ||
            this.trySetInfoFT(puzzle, lines)) {

        } else {
            puzzle.info.title = `Puzzle`;
            puzzle.info.setter = "anon";
            puzzle.info.provider = "pdf";
        }
    }

    private trySetInfoFT(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example: CROSSWORD No 17,788 by MOO

        let titleExpression = new RegExp(String.raw`^\s*CROSSWORD\s+(No|No\.|no|no\.)?\s*(?<serialNumber>[0-9,]+)\s+(set)?\s*by\s+(?<setter>[A-Z]+)`);

        for (let line of lines) {
            let match = titleExpression.exec(line);

            if (match) {
                // found an FT style title
                let setter = match.groups["setter"].toString();
                let serialNumber = match.groups["serialNumber"].toString();
                //let provider = this.providerService.getProviderString(puzzle.info.provider);

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

        // Example: Azed No. 2,717 Plain

        // no FT style title found so look for an Azed style title
        let titleExpression = new RegExp(String.raw`^\s*azed\s+no\.?\s+(?<serialNumber>\d,\d\d\d)(?<subtitle>.*)$`, "gi");

        for (let line of lines) {
            let match = titleExpression.exec(line);

            if (match) {
                // Azed can also contains solutions to previous puzzles that look like a title line e.g.
               // "Azed No 2,123 solutions and notes" or "Azed No. 2,481, The Observer, 90 York Way, London N1 9GU."
               // Only use if the title line does not contain the word "solution"
               let subtitle: string = match.groups["subtitle"] ? match.groups["subtitle"].toString().trim().toLowerCase() : null;
    
               if (!subtitle || !(subtitle.includes("solution") || subtitle.includes("observer"))) {
                   puzzle.info.title = match[0].toString();
                   puzzle.info.setter = "Azed";
                   puzzle.info.provider = "azed";
                   result = true;
                   break;
               } 
            }
        }
        return result;
    }

    private trySetInfoEveryman(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;
        // Example: Everyman crossword No. 4056

        let titleExpression = new RegExp(String.raw`Everyman crossword\s+(no|no\.)?\s*(?<serialNumber>[0-9,]{4,5})`, "i");
        for (let line of lines) {
            let match = titleExpression.exec(line);

            if (match) {
                // found an FT style title
                let serialNumber = match.groups["serialNumber"].toString();
                //let provider = this.providerService.getProviderString(puzzle.info.provider);

                puzzle.info.title = `Everyman ${serialNumber}`;
                puzzle.info.setter = "Everyman";
                puzzle.info.provider = "everyman";
                result = true;
                break;
            }
        }
        return result;
    }

    private trySetInfoQuiptic(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example quiptic: Quiptic crossword No 1,286 set by Chandler

        let titleExpression = new RegExp(String.raw`quiptic crossword\s+(no|no\.)?\s*(?<serialNumber>[0-9,]{4,5})\s+(set)?\s*by\s+(?<setter>[A-Za-z]+)`, "i");

        for (let line of lines) {
            let match = titleExpression.exec(line);

            if (match) {
                // found an FT style title
                let setter = match.groups["setter"].toString();
                let serialNumber = match.groups["serialNumber"].toString();

                puzzle.info.title = `Quiptic ${serialNumber} by ${setter}`;
                puzzle.info.setter = setter;
                puzzle.info.provider = "quiptic";
                result = true;
                break;
            }
        }
        return result;
    }
    private trySetInfoGuardian(puzzle: IPuzzle, lines: readonly string[]): boolean {
        let result = false;

        //Example prize and cryptic: information might be on more than one line
        //
        // Guardian cryptic crossword No 29,432 set by Vlad
        // or
        // Cryptic crossword No 29,432 set by Vlad
        // © 2024 Guardian News & Media Limited or its affiliated companies. All rights reserved.

        if (lines.join(" ").toLowerCase().includes("guardian")) {

            let titleExpression = new RegExp(String.raw`(guardian)?\s*cryptic crossword\s+(no|no\.)?\s*(?<serialNumber>[0-9,]{5,6})\s+(set)?\s*by\s+(?<setter>[A-Za-z]+)`, "i");

            for (let line of lines) {
                let match = titleExpression.exec(line);

                if (match) {
                    // found an FT style title
                    let setter = match.groups["setter"].toString();
                    let serialNumber = match.groups["serialNumber"].toString();

                    puzzle.info.title = `Guardian ${serialNumber} by ${setter}`;
                    puzzle.info.setter = setter;
                    puzzle.info.provider = "cryptic";
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
}
