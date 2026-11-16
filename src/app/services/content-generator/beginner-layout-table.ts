import { Injectable } from '@angular/core';
import { Clue } from 'src/app/model/puzzle-model/clue';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { Attribute } from './attribute';
import { More } from './more';
import { Root } from './root';
import { Tag } from './tag';
import { Text } from "./text";
import { ContentNode } from './content-node';
import { QuillNode } from './quill-node';
import { PublishOptions } from 'src/app/model/puzzle-model/publish-options';
import { PuzzleProvision } from 'src/app/model/puzzle-model/puzzle-provision';
import { HtmlNode } from './html';
import { TextStyleName } from 'src/app/model/interfaces';
import { TextChunk } from 'src/app/model/puzzle-model/clue-text-chunk';
import { ContentGenerator } from './content-generator';

@Injectable({
    providedIn: 'root'
})
export class BeginnerLayoutTable extends ContentGenerator {

    public getContent(puzzle: Puzzle, gridUrl: string): string {
        const answerColumnCount = puzzle.publishOptions.textCols.length;
        const publishOptions = puzzle.publishOptions;

        const root = new Root(
            // heading
            new QuillNode(puzzle.notes.header),
            new More(),

            // comment
            new QuillNode(puzzle.notes.body),

            // special instructions
            new HtmlNode("div", puzzle.info?.instructions),

            // grid
            publishOptions.includeGrid && gridUrl ? 
                new Tag("details",
                    new Attribute("style", "margin-bottom: 2em; padding: 1em; border: solid; text-align: center"),
                    new Tag("summary", 
                        new Text("click to show the completed grid")
                    ),
                    new Tag("img", 
                        new Attribute("src", gridUrl),
                        new Attribute("alt", "picture of the completed grid"),
                    )
                )
                :
                null,

            // button to show/hide the answers etc
            new Tag("button",
                new Attribute("id", "expand-all"),
                new Attribute("type", "button"),
                new Attribute("class", "search-submit"), 
                new Text("Expand all")
            ),

            new Tag("div",

                new Tag("table",
                    new Attribute("style", "margin-top:1em;width:100%;"),
                    // new Tag("thead"),
                    new Tag("tbody",

                        // across header row
                        new Tag("tr",
                            new Tag("th",
                                new Attribute("colspan", "4"),
                                new Text("ACROSS")
                            )
                        ),

                        // across clues
                        ...puzzle.clues.filter(c => c.group === "across")
                        .map(clue => this.makeRow(clue, puzzle.publishOptions))
                        .flat(),

                        // down header row
                        new Tag("tr",
                            new Tag("th",
                                new Attribute("colspan", "4"),
                                new Text("DOWN")
                            )
                        ),

                        // down clues
                        ...puzzle.clues.filter(c => c.group === "down")
                        .map(clue => this.makeRow(clue, puzzle.publishOptions))
                        .flat(),
                    ),
                )
            )
        );

        return root.toString();
    }

    private makeRow(clue: Clue, publishOptions: PublishOptions): Tag[] {
        return [
            this.makeClueRow(clue, publishOptions),
            this.makeAnnotationRow(clue, publishOptions)
        ];
    }

    private makeClueRow(clue: Clue, publishOptions: PublishOptions): Tag {
        // clue text row
        return new Tag("tr",
            new Attribute("style", "margin-top: 1em;"),

            new Tag("td", 
                new Text(clue.caption)
            ),

            new Tag("td", 
                new Attribute("class", "fts-subgroup"),
                new Tag("div", ...clue.chunks.map(chunk => 
                    new Tag("span", new Text(chunk.text), this.makeChunkStyleAttribute(chunk, publishOptions)))
                )
            ),

            new Tag("td", 
                new Tag("details",
                    new Tag("summary", new Text("trick")),
                    new Text(clue.answers[1])
                ),
            ),

            new Tag("td", 
                new Tag("details",
                    new Attribute("class", "fts-subgroup"),
                    new Tag("summary",
                        new Text("answer")
                    ),
                    new Tag("span",  
                        this.makeTextStyleAttribute("answer", publishOptions),
                        new Text(clue.answers[0] || "")
                    )
                )
            ),
        );
    }

    private makeAnnotationRow(clue: Clue, publishOptions: PublishOptions): Tag {

        // annotation row
        return new Tag("tr",
            new Attribute("style", "padding-bottom: 1em;"),
            new Tag("td", 
                new Attribute("style", "padding-bottom: inherit"),
            ),
            new Tag("td", 
                new Attribute("colspan", "3"),
                new Attribute("style", "padding-bottom: inherit"),
                new Tag("details",
                    new Tag("summary", new Text("Explanation")),
                    new QuillNode(clue.comment),
                ),
            )
        );

    }
}
