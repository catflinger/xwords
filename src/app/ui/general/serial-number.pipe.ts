import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'serialNumber', pure: true })
export class SerialNumberPipe implements PipeTransform {
    constructor() {
    }

    transform(content: number) {
        return content ? Math.floor(content).toFixed(0) : "";
    }
}