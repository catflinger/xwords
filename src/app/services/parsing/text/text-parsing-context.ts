import { Clue } from '../../../model/puzzle-model/clue';
import { ClueBuffer } from './clue-buffer';
import { TextParsingError } from 'src/app/model/puzzle-model/text-parsing-error';
import { TextParsingWarning } from 'src/app/model/puzzle-model/text-parsing-warning';
import { TokenGroup } from 'src/app/model/puzzle-model/token-group';
import { TextParsingOptions } from './types';
import { IParseToken } from 'src/app/model/interfaces';

export type TextParsingState = "across" | "down" | "orphan" | "ended" | null;

export interface IParseContext {
    readonly state: TextParsingState;
    readonly clues: ReadonlyArray<Clue>;
    readonly orphans: ReadonlyArray<Clue>;
    readonly buffer: ClueBuffer;
    readonly preamble: ReadonlyArray<string>;
    readonly postamble: ReadonlyArray<string>;
    readonly tokenGroup: TokenGroup;
    readonly error: TextParsingError;
    readonly warnings: ReadonlyArray<TextParsingWarning>;
}

export class ParseContext implements IParseContext {
    private _clueBuffer: ClueBuffer = null;
    private _acrossClues: Clue[] = [];
    private _downClues: Clue[] = [];
    private _orphanClues: Clue[] = [];
    private _spareClueEnd: IParseToken = null;
    private _group: TokenGroup = null;
    private _state: TextParsingState = null;
    private _error: TextParsingError = null;
    private _warnings: TextParsingWarning[] = [];
    private _preamble: string[] = [];
    private _postamble: string[] = [];

    constructor(
        public readonly textParsingOptions: TextParsingOptions,
    ) {}

    public addClueText(text: string) {
        if (this._state === "across" || this._state === "down" || this._state == "orphan") {
            if (!this._clueBuffer) {
                this._clueBuffer = new ClueBuffer(
                    this.textParsingOptions.captionStyle,
                    text,
                    this._state);
            } else {
                this._clueBuffer.add(text);
            }
        } else {
            throw "Attempt to add clue text when not reading across or down clues.";
        }
    }

    public addWarning(lineNumber: number, message: string) {
        this._warnings.push(new TextParsingWarning({lineNumber, message}));
    }

    public addPreamble(text: string) {
        this._preamble.push(text);
    }

    public addPostamble(text: string) {
        this._postamble.push(text);
    }

    public addSpareClueEnd(token: IParseToken) {
        this._spareClueEnd = token;
    }

    public get clues(): ReadonlyArray<Clue> { return this._acrossClues.concat(this._downClues); }
    public get orphans(): ReadonlyArray<Clue> { return this._orphanClues; }
    public get spareClueEnd(): IParseToken { return this._spareClueEnd }
    public get warnings(): ReadonlyArray<TextParsingWarning> { return this._warnings; }
    public get preamble(): ReadonlyArray<string> { return this._preamble; }
    public get postamble(): ReadonlyArray<string> { return this._postamble; }

    public get hasContent(): boolean { return this._clueBuffer !== null; }
    public get buffer(): ClueBuffer { return this._clueBuffer; }

    public get tokenGroup(): TokenGroup { return this._group; } 
    public setGroup(group: TokenGroup): void { this._group = group; }

    public get state(): TextParsingState { return this._state } 
    public set state(state: TextParsingState) { this._state = state } 

    public get error(): TextParsingError { return this._error } 
    public set error(error: TextParsingError) { this._error = error } 

    public save() {

        if (this._state === "across") {
            this._acrossClues.push(Clue.makeClue(
                this._clueBuffer.caption,
                this._clueBuffer.clue,
                this._clueBuffer.letterCount,
                "across"));
        } else if (this._state === "down") {
            this._downClues.push(Clue.makeClue(
                this._clueBuffer.caption,
                this._clueBuffer.clue,
                this._clueBuffer.letterCount,
                "down"));
        } else if (this._state === "orphan") {
            this._orphanClues.push(Clue.makeClue(
                this._clueBuffer.caption,
                this._clueBuffer.clue,
                this._clueBuffer.letterCount,
                "orphan"));
        }

        this._clueBuffer = null;
    }

    public discard() {
        this._clueBuffer = null;
    }
}
