import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse, ApiResponseStatus, AppResultSymbols, getApiRoot } from '../common';
import { AppSettingsService } from './app-settings.service';

export class Credentials {
    constructor(
        public readonly username: string,
        public readonly password: string,
        public readonly authenticated: boolean,
        public readonly sandbox: boolean
    ) { }
}

const defaultCredentials: Credentials = new Credentials("", "", false, false);

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private bs: BehaviorSubject<Credentials> = new BehaviorSubject<Credentials>(defaultCredentials);

    constructor(
        private http: HttpClient,
        private settingsService: AppSettingsService) { }

    public observe(): Observable<Credentials> {
        return this.bs.asObservable();
    }

    public getCredentials(): Credentials {
        return this.bs.value;
    }

    public authenticate(username: string, password: string, sandbox: boolean): Promise<Symbol> {
        return this.http.post(getApiRoot() + "authorization/", { username, password, sandbox })
        .toPromise()

        .then((data: ApiResponse) => {
            let result: Symbol;
            if (data.success === ApiResponseStatus.OK) {
                result = AppResultSymbols.OK;
            } else if (data.success === ApiResponseStatus.authorizationFailure) {
                result = AppResultSymbols.AuthorizationFailure;
            } else {
                result = AppResultSymbols.Error;
            }
            return result;
        })

        .catch(() => {
            return AppResultSymbols.Error;
        })

        .then(result => {
            if (result === AppResultSymbols.OK) {
                this.settingsService.username = username;
                this.bs.next(new Credentials(username, password, true, sandbox));
            } else {
                this.clearCredentials();
            }
            return result;
        });
    }

    public clearCredentials(): void {
        this.bs.next(new Credentials(this.settingsService.username, "", false, false));
    }

}
