import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AppService, AppStatus } from 'src/app/ui/general/app.service';
import { filter, Subscription } from 'rxjs';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { AuthService, Credentials } from 'src/app/services/app/auth.service';
import { NavService } from '../../services/navigation/nav.service';
import { AppTrackData } from '../../services/navigation/tracks/app-track-data';
import { AppSettingsService } from 'src/app/services/app/app-settings.service';
import { AppSettings } from 'src/app/services/common';
import { TraceService } from 'src/app/services/app/trace.service';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
    public appStatus: AppStatus;
    public credentials: Credentials;
    public isNavbarCollapsed: boolean;
    public settings: AppSettings;

    private subs: Subscription[] = [];

    constructor(
        private navService: NavService<AppTrackData>,
        private authService: AuthService,
        private activePuzzle: IActivePuzzle,
        private appService: AppService,
        private settingsService: AppSettingsService,
        public traceService: TraceService,
        public router: Router,
        private modalService: NgbModal,
        private detref: ChangeDetectorRef,
        ) {
    }

    public ngOnInit() {
        
        this.appService.clearBusy();
        
        this.subs.push(this.settingsService.observe().subscribe(settings => {
            this.settings = settings;
            this.detref.detectChanges();
        }));

        this.subs.push(this.appService.getObservable().subscribe(appStatus => {
            this.appStatus = appStatus;
            this.detref.detectChanges();
        }));
        
        this.subs.push(this.authService.observe().subscribe(credentials => {
            this.credentials = credentials;
            this.detref.detectChanges();
        }));

        this.subs.push(this.router.events
            .pipe(
                filter(event => event instanceof NavigationStart)
            )
            .subscribe((event: NavigationStart) => {
                this.modalService.dismissAll();
                this.detref.detectChanges();
        }));
    }

    public ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    public get containerFluid(): Boolean {
        return this.settings ? this.settings.general.containerFluid.enabled : false;
    };


    public onArchive(provider: string) {
        this.activePuzzle.clear();
        this.appService.clear();

        if (provider === "independent" || provider === "ios") {
            this.navService.gotoRoute(["indy"]);

        } else {
            this.navService.gotoRoute(["archive", provider]);
        }
    }

    public onPdf() {
        this.activePuzzle.clear();
        this.appService.clear();
        this.appService.setOpenPuzzleParams({
            provider: "pdf",
        });
        this.navService.beginTrack("createPdfTrack", {});
    }

    public onGrid() {
        this.activePuzzle.clear();
        this.appService.clear();
        this.appService.setOpenPuzzleParams({
            provider: "grid",
        });
        this.navService.beginTrack("gridToolTrack", {});
    }

    public onHome() {
        this.navService.goHome();
    }

    public onGoTo(route: string) {
        this.appService.clear();
        this.navService.gotoRoute([route]);
    }

    public onGoToA(route: string) {
        this.appService.clear();

        if (this.credentials.authenticated) {
            this.navService.gotoRoute([route]);
        } else {
            this.appService.redirect = [route];
            this.navService.gotoRoute(["login"]);
        }
    }

    public onCarteBlanche() {
        // TO DO: bring this into the main Angular app
        window.location.href ="/carte-blanche/index.html"
    }

    public onLogout() {
        this.authService.clearCredentials();
        this.appService.clear();
        this.navService.gotoRoute(["login"])
    }
}

