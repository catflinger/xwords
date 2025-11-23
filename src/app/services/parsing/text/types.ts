import { CaptionStyle } from "src/app/model/interfaces";

// one or two digits
const clueCaptionExpressionFirstPart = String.raw`\s*\d{1,2}`;

// optional space, a comma or slash, optional space, one or two digits, then an optioanl "across" or "down"
// TO DO: should be followed by a lookahead for a space (ie a space comes next but is not included in the match)
// the lookahead prevents clues such as "22,12 Downwards we go (8)" being parsed as "22,12 Down" and "wards we go (8)"
const clueCaptionExpressionAdditionalPart = String.raw`\s*(,|/)\s*\d{1,2}(\s?(across|down|ac|dn))?`;

// optional asterisk, optional space, (the first grid reference) then zero or more additional grid references
export const clueCaptionExpression = String.raw`^\s*\*?\s*(?<caption>\s*${clueCaptionExpressionFirstPart}(${clueCaptionExpressionAdditionalPart})*)`;

// \u2019 is the UNICODE "right single quotation mark" sometimes used instead of the apostrophe character
// \u00B4 acute accent
// \u0060 grave accent
// \u2018 left single quote
export const clueLetterCountExpression = String.raw`(?<letterCount>\(\d[0-9a-z\u0060\u00B4\u2018\u2019', -]*?\)\s*$)`;
// the partial letter count is less permissive as it is easier to misread a fragment of the clue text as the end of
// the letter count
export const clueLetterCountExpressionEnd = String.raw`([\u0060\u00B4\u2018\u2019',0-9- ]|word|words|or|apostrophe)+\)$`;

export interface TextParsingOptions {
    captionStyle: CaptionStyle,
    allowPreamble: boolean,
    allowPostamble: boolean,
    allowTypos?: boolean,
    azedFeatures?: boolean,
    hasLetterCount?: boolean,
    hasClueGroupHeadings?: boolean,
}

export type LineType = 
    
    // contains whitespace only
    "empty" |

    // contains unidentified text
    "unknown" |

    // contains a whole clue eg "12 This is a clue (4)"
    "clue" |

    // contains the start of a clue but no end eg "12 This is a very long"
    "clueStart" |

    // contains the end of a clue, but not the start eg "end of a clue (8)"
    "clueEnd" |

    // contains an across marker, typically "ACROSS"
    "acrossMarker" |

    // contains a down marker, typically "DOWN"
    "downMarker";

