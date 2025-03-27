import { NavTrack } from '../interfaces';

/*
This track is for creating a new puzzle or amending an existing puzzle

Edit refers to the role of a crossword editor, both a commissioner and a modifier of puzzles
*/

export const parseGuardianTrack: NavTrack = {
    name: "parseGuardianTrack",
    start: "parser",
    nodes: [
        {
            name: "parser",
            type: "process",
            process: "parse-guardian",
            actions: {
                "ok": "mark-as-ready",
                "error": "error",
            }
        },
        // {
        //     name: "set-redirects",
        //     type: "process",
        //     process: "set-redirects",
        //     actions: {
        //         "ok": "linker",
        //         "error": "error",
        //     }
        // },
        // {
        //     name: "linker",
        //     type: "process",
        //     process: "link",
        //     actions: {
        //         "ok": "mark-as-ready",
        //     }
        // },
        {
            name: "mark-as-ready",
            type: "process",
            process: "mark-as-ready",
            actions: {
                "ok": "finish",
            }
        },
        {
            name: "error",
            type: "return",
            return: "error",
            actions: {}
        },
        {
            name: "finish",
            type: "return",
            return: "ok",
            actions: {}
        },
        {
            name: "abandon",
            type: "exit",
            actions: {}
        },
    ],
}
