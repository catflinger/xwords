import { IGridCell } from '../interfaces';

export class GridCell implements IGridCell {
    public readonly id: string;
    public readonly x: number;
    public readonly y: number;
    public readonly anchor: number;
    public readonly caption: string;
    public readonly content: string;
    public readonly light: boolean;
    public readonly rightBar: boolean;
    public readonly bottomBar: boolean;
    public readonly highlight: boolean;
    public readonly textColor: string;
    public readonly shading: string;
    public readonly edit: boolean;
    public readonly hidden: boolean;
    public readonly hasConflict: boolean;
    
    constructor(data: any) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.caption = data.caption ?? "";
        this.content = data.content;
        this.light = !!data.light;
        this.rightBar = !!data.rightBar;
        this.bottomBar = !!data.bottomBar;
        this.highlight = !!data.highlight;
        this.textColor = data.textColor ? data.textColor : "";
        this.shading = data.shading ? data.shading : "";
        this.edit = data.edit;
        this.hidden = !!data.hidden;
        this.hasConflict = !!data.hasConflict;

        this.anchor = (data.label || data.anchor) || 0;
    }
}