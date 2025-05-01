import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-puzzle-scratchpad',
  templateUrl: './scratchpad.component.html',
  styleUrls: ['./scratchpad.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadComponent implements OnInit, OnDestroy, AfterViewInit {
    private subs: Subscription[] = [];

    @ViewChild('gridCanvas', { static: false }) 
    public canvas: ElementRef;

    public text: string = "wating for canvas";
    public form = this.formBuilder.group({
        mimeType: ""
    });

    constructor(
        private detRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        const canvas: HTMLCanvasElement = this.canvas.nativeElement;
        const context = canvas.getContext('2d');
        context.fillStyle = "blue";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillStyle = "yellow";
        context.fillRect(20, 20, 30, 70);

        this.detRef.detectChanges();
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe())
    }

    public createImage() {
        const canvas: HTMLCanvasElement = this.canvas.nativeElement;
        const data = canvas.toDataURL(this.form.value.mimeType);

        this.text = data.substring(0, 100);

        this.detRef.detectChanges();
    }
}
