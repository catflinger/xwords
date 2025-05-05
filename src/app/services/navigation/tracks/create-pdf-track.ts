import { NavTrack } from '../interfaces';

/*
This track is for creating a new puzzle or amending an existing puzzle

Edit refers to the role of a crossword editor, both a commissioner and a modifier of puzzles

TO DO: rema=name this as PDF is not alwats relevant here
*/

export const createPdfTrack: NavTrack = {
    name: "createPdfTrack",
    start: "pdf-start",
    nodes: [
        {
            name: "open-puzzle",
            type: "route",
            route: "open-puzzle",
            actions: {
                "continue": "serial-number-check",
                "parse": "grid-captions",
                "error": "error",
            }
        },
        {
            name: "grid-captions",
            type: "process",
            process: "grid-captions",
            actions: {
                "ok": "parser",
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
                ok: "serial-number-check",
                error: "special-text",
            }
        },
        {
            name: "pdf-start",
            type: "route",
            route: "/special-pdf",
            actions: {
                "continue": "pdf-extract",
            }
        },
        {
            name: "pdf-extract",
            type: "process",
            process: "pdf-extract",
            actions: {
                "ok": "grid-captions",
                "authenticate": "login",
                "error": "error",
            }
        },
        {
            name: "login",
            type: "route",
            route: "/special-login",
            actions: {
                "ok": "pdf-extract",
                "cancel": "abandon",
                "back": "special-pdf",
            }
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
            name: "special-text",
            type: "route",
            route: "/special-text",
            actions: {
                "parse": "parser",
                "cancel": "abandon",
            }
        },
        {
            name: "serial-number-check",
            type: "process",
            process: "serial-number-check",
            actions: {
                "ok": "solver",
                "error": "serial-number-warning",
            }
        },
        {
            name: "serial-number-warning",
            type: "route",
            route: "/serial-number-warning",
            actions: {
                "ok": "solver",
                "cancel": "abandon",
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
