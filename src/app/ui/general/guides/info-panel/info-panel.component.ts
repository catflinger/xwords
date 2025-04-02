import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.css'],
})
export class InfoPanelComponent {
    @Input() public type = "info";
    @Input() public dismissable = true;
}
