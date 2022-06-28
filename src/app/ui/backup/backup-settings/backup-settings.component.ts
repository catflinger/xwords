import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackupService } from 'src/app/services/storage/backup.service';
import { AuthService } from 'src/app/services/app/auth.service';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import * as Bowser from 'bowser';
import { AppSettings, AppResultSymbols } from 'src/app/services/common';
import { AppService } from '../../general/app.service';

@Component({
  selector: 'app-backup-settings',
  templateUrl: './backup-settings.component.html',
  styleUrls: ['./backup-settings.component.css']
})
export class BackupSettingsComponent implements OnInit {
    private subs: Subscription[] = [];

    public form: FormGroup;
    public settings: AppSettings;
    
    constructor(
        private appService: AppService,
        private backupService: BackupService,
        private authService: AuthService,
        private navService: NavService<AppTrackData>,
        private detRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
    ) { }

    public ngOnInit(): void {

        if (!this.authService.getCredentials().authenticated) {
            this.navService.goHome();
        }

        const browser = Bowser.getParser(window.navigator.userAgent);

        this.form = this.formBuilder.group({
            caption: ["My settings", Validators.required],
            browser: [browser.getBrowserName(), Validators.required],
            computer: ["", Validators.required],
        });
    }

    public ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    public onBackup() {
        const origin = this.form.value.browser + " on " + this.form.value.computer;
        
        this.backupService.backupSettings(origin, this.form.value.caption)
        .then(() => {
            this.navService.gotoRoute(["backups"]);
        })
        .catch((error) => {
            const message = error === AppResultSymbols.AuthorizationFailure ?
            "User is not logged in" :
            "Failed to make backup";
            this.appService.setAlert("danger", message);
            this.detRef.detectChanges();
        });
    }

    public onCancel() {
        this.navService.goHome();
    }
}
