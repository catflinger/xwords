import { TextStyleName } from "src/app/model/interfaces";
import { TextChunk } from "src/app/model/puzzle-model/clue-text-chunk";
import { PublishOptions } from "src/app/model/puzzle-model/publish-options";
import { Puzzle } from "src/app/model/puzzle-model/puzzle";
import { ContentNode } from "./content-node";
import { Attribute } from "./attribute";

export abstract class ContentGenerator {
    public abstract getContent(puzzle: Puzzle, gridUrl: string): string;

    public makeTextStyleAttribute(styleName: TextStyleName, publishOptions: PublishOptions): ContentNode {
        const style = publishOptions.getStyle(styleName);

        return new Attribute("style", style.toCssStyleString());
    }

    public makeChunkStyleAttribute(chunk: TextChunk, publishOptions: PublishOptions): ContentNode {
        const clueStyle = publishOptions.getStyle("clue");
        const definitionStyle = publishOptions.getStyle("definition");

        return new Attribute("style", chunk.isDefinition ? definitionStyle.toCssStyleString() : clueStyle.toCssStyleString());
    }

}
