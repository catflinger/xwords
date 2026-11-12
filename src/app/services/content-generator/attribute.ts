import { ContentNode } from './content-node';

export class Attribute extends ContentNode {

    constructor(
        readonly name: string,
        readonly value: string,
    ) {
            super(name, true);
    }

    // BE AWARE: this is overidden in Tag when consolidating multiple
    // instances of the sake attribute
    public toString(): string {
        return ` ${this.name.trim()}="${this.value.trim()}" `;
    }
}