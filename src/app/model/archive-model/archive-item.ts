import * as moment from "moment";
import { PuzzleProvider } from '../interfaces';

export class ArchiveItem {
    public readonly provider: PuzzleProvider;
    public readonly serialNumber: number;
    public readonly date: Date;
    public readonly setter: string;
    public readonly url: string;

    constructor(data: any) {
        this.provider = data.provider;
        this.serialNumber = data.serialNumber;
        this.date = data.xwordDate ? moment(data.xwordDate).toDate() : null;
        this.setter = data.setter;
        this.url = data.url;
    }
}