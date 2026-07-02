import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, ApiResponseStatus, AppResultSymbols, getApiRoot } from '../common';
import { AuthService } from '../app/auth.service';
import { OpenPuzzleParamters } from '../../ui/general/app.service';
import { Base64Encoded } from '../../model/interfaces';

abstract class ApiProvisionResponse implements ApiResponse {
    public abstract success: ApiResponseStatus;
    public abstract message: string;
    public abstract grid: any;
    public abstract text: string;
    public abstract date: string;
    public abstract href: string;
}

abstract class ApiPuzzleResponse implements ApiResponse {
    public abstract success: ApiResponseStatus;
    public abstract message: string;
    public abstract puzzle: any;
    public abstract warnings: any;
    public abstract completionState: string;
}

export interface PuzzleResponse {
    readonly puzzle: any;
    readonly warnings: any;
    readonly completionState: string;
}

export interface PuzzleProvisionResponse {
    readonly grid?: any;
    readonly text: string;
    readonly date: string;
    readonly href: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpPuzzleSourceService {

    constructor(
        private http: HttpClient,
        //private settingsService: AppSettingsService,
        private authService: AuthService
    ) { }

    public providePuzzle(params: OpenPuzzleParamters): Promise<PuzzleProvisionResponse> {
        const credentials = this.authService.getCredentials();

        // send some identification criteria, get back text and grid extracted from the relevant PDF
        // the clues needs to be parsed here

        if (!credentials.authenticated) {
            return Promise.reject(AppResultSymbols.AuthorizationFailure);
        }

        params.username = credentials.username;
        params.password = credentials.password;
        params.sandbox = credentials.sandbox;

        return this.http.post(getApiRoot() + "provision/", params)
        .toPromise()
        .then((response) => {
            if (response) {
                const data: ApiProvisionResponse = response as ApiProvisionResponse;
                if (data.success === ApiResponseStatus.OK) {
                    return data as PuzzleProvisionResponse;
                } else if (data.success === ApiResponseStatus.authorizationFailure) {
                    throw AppResultSymbols.AuthorizationFailure;
                } else {
                    throw data.message;
                }
            } else {
                throw "No data returned from server."
            }
        });
    }

    public getPuzzle(params: OpenPuzzleParamters): Promise<PuzzleResponse> {
        const credentials = this.authService.getCredentials();

        // send some identification criteria, get back a parsed puzzle
        // no client-side parsing neccessary

        if (!credentials.authenticated) {
            return Promise.reject(AppResultSymbols.AuthorizationFailure);
        }

        params.username = credentials.username;
        params.password = credentials.password;
        params.sandbox = credentials.sandbox;

        return this.http.post(getApiRoot() + "puzzle/", params)
        .toPromise()
        .then((response) => {
            if (response) {
                const data: ApiPuzzleResponse = response as ApiPuzzleResponse;
                
                if (data.success === ApiResponseStatus.OK) {
                    return data as PuzzleResponse;
                } else if (data.success === ApiResponseStatus.authorizationFailure) {
                    throw AppResultSymbols.AuthorizationFailure;
                } else {
                    throw data.message;
                }
            } else {
                throw "No data returned form server."
            }
        });
    }

    public getPdfExtract(pdf: Base64Encoded, gridPage: number, textPage: number): Promise<PuzzleProvisionResponse> {

        // send a PDF file, get back the extracted test and grid
        // the clues needs to be parsed here
        
        const credentials = this.authService.getCredentials();

        if (!credentials.authenticated) {
            return Promise.reject(AppResultSymbols.AuthorizationFailure);
        }

        let params: any = {
            username: credentials.username,
            password: credentials.password,
            sandbox: credentials.sandbox,
            sourceDataB64: pdf,
            gridPage,
            textPage,
        }

        return this.http.post(getApiRoot() + "pdfextract/", params)
        .toPromise()
        .then((response) => {
            if (response) {
                const data: ApiProvisionResponse = response as ApiProvisionResponse;

                if (data.success === ApiResponseStatus.OK) {
                    return data as PuzzleProvisionResponse;
                } else if (data.success === ApiResponseStatus.authorizationFailure) {
                    throw AppResultSymbols.AuthorizationFailure;
                } else {
                    throw data.message;
                }
            } else {
                throw "No data returned from server."
            }
        });
    }
}

