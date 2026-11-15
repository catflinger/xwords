import { fifteensquaredAnswerStyle, fifteensquaredClueStyle, fifteensquaredDefinitionStyle, TextStyle } from './text-style';
import { IPublishOptions, Layouts, Spacing } from '../interfaces';
import { TextColumn } from './text-column';

export class PublishOptions implements IPublishOptions {
    public readonly textCols: TextColumn[];
    public readonly textStyles: TextStyle[];
    public readonly showClueCaptions: boolean;
    public readonly showClueGroups: boolean;
    //public readonly showGridCaptions: boolean;
    public readonly includeGrid: boolean;
    public readonly layout: Layouts;
    public readonly spacing: Spacing;
    public readonly useThemeDefaults: boolean;

    constructor(data: any) {
        this.includeGrid = !!(data.includeGrid);
        this.useThemeDefaults = typeof data.useThemeDefaults === "undefined" ? true : !!data.useThemeDefaults;
        
        this.showClueCaptions = typeof data.showClueCaptions === "undefined" ? true : !!data.showClueCaptions;
        this.showClueGroups = typeof data.showClueGroups === "undefined" ? true : !!data.showClueGroups;
        //this.showGridCaptions = typeof data.showGridCaptions === "undefined" ? true : !!data.showGridCaptions;
        
        this.layout = data.layout ? data.layout : "table";
        this.spacing = data.spacing ? data.spacing : "medium";

        if (data.textStyles) {
            let styles: TextStyle[] = [];
            data.textStyles.forEach((style: any) => styles.push(new TextStyle(style)));
            this.textStyles = styles;
        } else {
            this.textStyles = [
                new TextStyle(fifteensquaredAnswerStyle),
                new TextStyle(fifteensquaredClueStyle),
                new TextStyle(fifteensquaredDefinitionStyle),
            ]
        }

        if (data.textCols) {
            let cols: TextColumn[] = [];
            data.textCols.forEach((col: any) => cols.push(new TextColumn(col)));
            this.textCols = cols;
        } else {
            this.textCols = [
                new TextColumn({
                    caption: "Answer",
                    style: "answer",
                })
            ]
        }
    }

    public getStyle(styleName: string) : TextStyle | undefined {
        return this.textStyles.find(style => style.name === styleName);
    }

    public get answerStyle(): TextStyle | undefined {
        return this.getStyle("answer");
    }
    public get clueStyle(): TextStyle | undefined {
        return this.getStyle("clue");
    }
    public get definitionStyle(): TextStyle | undefined {
        return this.getStyle("definition");
    }
}