import { Injectable } from '@angular/core';
import { AppTrackData } from './tracks/app-track-data';
import { AppService } from '../../ui/general/app.service';
import { IActivePuzzle, IPuzzleManager } from 'src/app/services/puzzles/puzzle-management.service';
import { ParseText } from 'src/app//modifiers/parsing-modifiers/parse-text';
import { RenumberGid } from 'src/app//modifiers/grid-modifiers/renumber-grid';
import { TextParsingService } from 'src/app/services/parsing/text/text-parsing-service';
import { CreateClues } from 'src/app/modifiers/clue-modifiers/create-clues';
import { InitAnnotationWarnings } from 'src/app/modifiers/puzzle-modifiers/init-annotation-warnings';
import { SetGridReferences } from 'src/app/modifiers/clue-modifiers/set-grid-references';
import { NavProcessor } from './interfaces';
import { UpdateInfo } from 'src/app/modifiers/puzzle-modifiers/update-info';
import { SyncGridContent } from 'src/app/modifiers/grid-modifiers/sync-grid-content';
import { SetRedirects } from 'src/app/modifiers/clue-modifiers/set-redirects';
import { TraceService } from '../app/trace.service';
import { UpdateProvision } from 'src/app/modifiers/puzzle-modifiers/update-provision';
import { FactoryResetClues } from 'src/app/modifiers/clue-modifiers/factory-reset-clues';
import { UpdatePuzzleOptions } from 'src/app/modifiers/publish-options-modifiers/update-puzzle-options';
import { ParseGuardian } from 'src/app/modifiers/parsing-modifiers/parse-guardian';
import * as luxon from 'luxon';
import { ProviderService } from '../puzzles/provider.service';
import { ParseMyCrossword } from 'src/app/modifiers/parsing-modifiers/parse-my-crossword';

@Injectable({
    providedIn: 'root'
})
export class UIProcessService implements NavProcessor<AppTrackData> {
    
    constructor(
        private appService: AppService,
        private activePuzzle: IActivePuzzle,
        private puzzleManager: IPuzzleManager,
        private textParsingService: TextParsingService,
        private traceService: TraceService,
        private providerService: ProviderService
    ) {}

    async exec(processName: string, appData: AppTrackData): Promise<string> {
        let action: Promise<string>;

        switch (processName) {

            case "serial-number-check":
                action = this.serialNumberCheck();
                    break;

            case "editor-select":
                // TO DO: think if this test needs to be more sophisticated
                action = this.activePuzzle.puzzle.grid ?
                    Promise.resolve("solve") :
                    Promise.resolve("blog");
                    break;

            case "grid-captions":
                try {
                    this.activePuzzle.updateAndCommit(new RenumberGid());
                    action = Promise.resolve("ok");
                } catch (error) {
                    action = Promise.resolve("error");
                }
                break; 

            case "link":
                try {
                    this.activePuzzle.updateAndCommit(new SetGridReferences());
                    action = Promise.resolve("ok");
                } catch (error) {
                    action = Promise.resolve("error");
                }
                break;

            case "make-clues":
                // TO DO: work out what to do if puzzle aready has clues
                this.activePuzzle.updateAndCommit(
                    new UpdateProvision({ captionStyle: "numbered"}),
                    new CreateClues(), 
                    new InitAnnotationWarnings()
                );
                action = Promise.resolve("ok");
            break;

            case "make-clues-manual":
                // TO DO: work out what to do if puzzle aready has clues
                this.activePuzzle.updateAndCommit(
                    new FactoryResetClues(),
                    new UpdateProvision({ captionStyle: "any" }),
                    new UpdatePuzzleOptions("manual")
                );
                action = Promise.resolve("ok");
            break;

            case "parse":
                action = this.parse();
            break;

            case "parse-guardian":
                action = this.parseGuardian();
            break;

            case "parse-mycrossword":
                action = this.parseMyCrossword();
            break;

            case "pdf-extract":
                try {
                    action = this.puzzleManager.loadPuzzleFromPdf(this.appService.openPuzzleParameters);
                } catch (error){
                    if (appData) {
                        appData.errorMessage = error.toString();
                    }
                    action = error;
                }
                break; 

            case "set-grid-refs":
                this.activePuzzle.updateAndCommit(new SetGridReferences());
                action = Promise.resolve("ok");
                break;

            case "set-redirects":
                this.activePuzzle.updateAndCommit(new SetRedirects());
                action = Promise.resolve("ok");
                break;

            case "mark-as-ready":
                action = this.markAsReady();
                break;

            default:
                action = Promise.reject("Could not find navivgation process with name " + processName);
        }

        return action;
    }

    private parse(): Promise<string> {
        let action = "error";

        try {
            this.activePuzzle.updateAndCommit(
                new ParseText(this.textParsingService, this.traceService),
                new SyncGridContent());

            const errors = this.activePuzzle.puzzle.provision.parseErrors;

            if (errors && errors.length) {
                action = "error";
            } else {
                action = "ok";
            }

        } catch(error) {
            action = "error";
            this.appService.setAlert("danger", "Parsing Error :" + error);
        }

        return Promise.resolve(action);
    }

    private parseGuardian(): Promise<string> {
        let action = "error";

        try {

            this.activePuzzle.updateAndCommit(
                new ParseGuardian(this.providerService),
                // Note: the following must be called after the parsing modifier
                new InitAnnotationWarnings(),
                new UpdateInfo({ ready: true }),
            );

            action = "ok";

        } catch(error) {
            action = "error";
            this.appService.setAlert("danger", "Parsing Error :" + error);
        }

        return Promise.resolve(action);
    }

    private parseMyCrossword(): Promise<string> {
        let action = "error";

        try {

            this.activePuzzle.updateAndCommit(
                new ParseMyCrossword(this.providerService),
                // Note: the following must be called after the parsing modifier
                new InitAnnotationWarnings(),
                new UpdateInfo({ ready: true }),
            );

            action = "ok";

        } catch(error) {
            action = "error";
            this.appService.setAlert("danger", "Parsing Error :" + error);
        }

        return Promise.resolve(action);
    }

    private markAsReady(): Promise<string> {

        // TO DO: do some proper validation here...
        
        this.activePuzzle.updateAndCommit(new UpdateInfo({ ready: true }));
        return Promise.resolve("ok");
    }

    private serialNumberCheck(): Promise<string> {
        let isOk = true;

        // the Independent website has a "feature" whereby you can ask for a puzzle in the future.
        // If such a puzzle is not available then you get back a random puzzle from an earlier date.
        // This function checks to see if the serial number looks reasonable.  
        // 
        // The Independent puzzle for Monday 1st May 2025 had serial number 12030.
        // The Independent on Sunday puzzle for Sunday 4th May 2025 had serial number 1836.
        // 
        //  As a rough approximation increment this for each day that has elapsed since then (every week for IoS).
        //
        // The expectation is that the user will request a puzzle for today or the next few days.
        // if the puzzle has a serial number that is too far from this then it is possibly not a valid puzzle.
        // The purpose of this is to provide a warning, the user must determine if the puzzle the one expected or not.  

        try {

            const title = this.activePuzzle.puzzle.info.title;
            const provider = this.activePuzzle.puzzle.info.provider;

            if (provider === "independent" || provider === "ios") {

                let match = /\d\d,?\d\d\d/.exec(title);

                if (match) {
                    const serialNumber = Number.parseInt(match[0].replace(/,/g, ""));

                    let lowerBound: number;
                    let upperBound: number;

                    const today = luxon.DateTime.now().startOf("day");
                    const refDate = luxon.DateTime.fromObject({ year: 2025, month: 5, day: 1 }).startOf("day");
                    const daysSinceRefDate = Math.floor(today.diff(refDate, "days").days);
                    const weeksSinceRefDate = Math.floor(today.diff(refDate, "weeks").weeks);

                    if (provider === "independent") {
                        // The idependent puzzle is Monday - Saturday
                        lowerBound = 12030 + daysSinceRefDate - weeksSinceRefDate - 7;
                        upperBound = 12030 + daysSinceRefDate - weeksSinceRefDate + 7;
    
                    } else {
                        // The ios puzzle is Sunday only
                        lowerBound = 1836 + weeksSinceRefDate - 3;
                        upperBound = 1836 + weeksSinceRefDate + 3;
                    }

                    if (serialNumber < lowerBound || serialNumber > upperBound) {
                        isOk = false;
                    }
            }
            }

        } catch (error) { }

        return isOk ? Promise.resolve("ok") : Promise.resolve("error");
    }
}
