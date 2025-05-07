import { Injectable } from '@angular/core';
import { AppSettingsService } from '../../../app/app-settings.service';

export class MockTraceService {

    private traceItems: string[];

    constructor(private settingsService: AppSettingsService) { 
    }

    public log(item: any): void {
    }

    public logJason(item: any): void {
    }

    public clearTrace() {
    }

    public addTrace(message: string) {
    }

    public getTrace(): ReadonlyArray<string> {
        return [];
    }
}
