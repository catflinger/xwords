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
import { ContentGenerator } from './content-generator';

@Injectable({
    providedIn: 'root'
})
export class BeginnerLayoutList extends ContentGenerator {

    public getContent(puzzle: Puzzle, gridUrl: string): string {

        const root = new Root(
            // heading
            new QuillNode(puzzle.notes.header),
            new More(),

            // comment
            new QuillNode(puzzle.notes.body),

            // special instructions
            new HtmlNode("div", puzzle.info?.instructions),

            // grid
            puzzle.publishOptions.includeGrid && gridUrl ? 
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
                new Attribute("class", `fts fts-list fts-spacing-${puzzle.publishOptions.spacing}`),

                // clues
                puzzle.publishOptions.showClueGroups ? 
                    new Tag("div", 
                        new Attribute("style", "margin-top: 1em;font-weight: bold;"), 
                        new Attribute("class", "fts-group"), 
                        new Text("ACROSS")
                    ) 
                    : null,
                
                new Tag("div", 
                    ...puzzle.clues.filter(c => c.group === "across").map(clue => this.makeClue(clue, puzzle.publishOptions, puzzle.provision))),

                puzzle.publishOptions.showClueGroups ? 
                    new Tag("div", 
                        new Attribute("style", "margin-top: 1em;font-weight: bold;"), 
                        new Attribute("class", "fts-group"),
                        new Text("DOWN")
                    ) 
                    : null,
                
                new Tag("div",
                     ...puzzle.clues.filter(c => c.group === "down").map(clue => this.makeClue(clue, puzzle.publishOptions, puzzle.provision))),

                //footer
                new Tag("div", new QuillNode(puzzle.notes.footer)),
            )
        );

        return root.toString();
    }

    private makeClue(clue: Clue, publishOptions: PublishOptions, provision: PuzzleProvision): ContentNode {
        const clueStyle = publishOptions.getStyle("clue");
        const definitionStyle = publishOptions.getStyle("definition");

        return new Tag("div",
            new Attribute("style", "margin-top: 1.5em"),
            new Attribute("class", "fts-group"),

            // write the clue
            new Tag("div",
                new Attribute("class", "fts-subgroup"),

                // caption
                publishOptions.showClueCaptions ?
                new Tag("span",
                    new Text(clue.caption),
                    clue.caption ? new Text(". ") : null,
                    new Attribute("style", clueStyle.toCssStyleString()),
                )
                : null,

                // maked-up clue text with definition
                ...clue.chunks.map(chunk =>
                    new Tag("span",
                        new Attribute("style", chunk.isDefinition ? definitionStyle.toCssStyleString() : clueStyle.toCssStyleString()),
                        new Text(chunk.text),
                    )
                ),
            ),

            // write the answer(s)
            ...this.makeAnswers(clue, publishOptions),

            // write the comments
            new Tag("details",
                new Attribute("style", "margin-top: 0.1em"),
                new Tag("summary", new Text("Explanation")),
                new Tag("div",
                    new Attribute("style", "margin-left:1em;margin-top:0.5em;margin-bottom:2em;"),
                    new Attribute("class", "fts-subgroup"),
                    new QuillNode(clue.comment)
                )
            )
        );
    }

    private makeAnswers(clue: Clue, publishOptions: PublishOptions): ContentNode[] {
        let result: ContentNode[] = [];
        const answerStyle = publishOptions.getStyle("answer");

        clue.answers.forEach((answer, i) => 
            result.push(
                new Tag("details",
                    new Attribute("style", "margin-top: 0.1em"),
                    new Tag("summary", 
                        new Text(publishOptions.textCols[i].caption)
                    ),
                    new Tag("div",
                        new Attribute("class", "fts-subgroup"),
                        new Attribute("style", answerStyle.toCssStyleString()),
                    new Text(answer),
                )
            )));

        return result;
    }
}