import { NavTrack } from '../interfaces';

/*
This track is for creating a new puzzle or amending an existing puzzle

Edit refers to the role of a crossword editor, both a commissioner and a modifier of puzzles
*/

export const createArchiveTrack: NavTrack = {
    name: "createArchiveTrack",
    start: "open-puzzle",
    nodes: [
        {
            name: "open-puzzle",
            type: "route",
            route: "open-puzzle",
            actions: {
                "continue": "solver",
                "parse": "parser",
                "parse-guardian": "parse-guardian",
                "parse-indy": "parse-indy",
                "error": "error",
            }
        },
        {
            name: "parser",
            type: "call",
            call: {
                track: "parseTrack"
            },
            actions: {
                ok: "solver",
                error: "error"
            }
        },
        {
            name: "parse-guardian",
            type: "process",
            process: "parse-guardian",
            actions: {
                ok: "solver",
                error: "error"
            }
        },
        {
            name: "parse-indy",
            type: "process",
            process: "parse-indy",
            actions: {
                ok: "solver",
                error: "error"
            }
        },
        {
            name: "solver",
            type: "switch",
            switch: {
                track: "solveTrack"
            },
            actions: {}
        },
        {
            name: "error",
            type: "route",
            route: "/nav-error",
            actions: {
                "continue": "abandon"
            }
        },
        {
            name: "abandon",
            type: "exit",
            actions: {}
        },
    ],
}
