import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-clue-hint-control',
    templateUrl: './clue-hint-control.component.html',
    styleUrls: ['./clue-hint-control.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ClueHintControlComponent),
            multi: true
        },
    ]
})
export class ClueHintControlComponent implements ControlValueAccessor, OnInit {
    private onChange: any = () => { };
    private onTouched: any = () => { };
    private subs: Subscription[] = [];

    @Input()
    public hints: string[] = [];

    // @Output()
    // public change: EventEmitter<string> = new EventEmitter<string>();

    public form: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) { }


    public ngOnInit(): void {
        this.form = this.fb.group({
            hint: ""
        });

        this.subs.push(
            this.form.valueChanges.subscribe(value => {
                this.onChange(value.hint);
                this.onTouched();
            })
        );
    }

    public writeValue(hint: string): void {
        if (hint) {
            this.form.patchValue({ "hint": hint ? hint : "" }, { emitEvent: false });
        }
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // public onSelectChange() {
    //     this.onChange();
    //     this.onTouched();
    // }

    public setDisabledState?(isDisabled: boolean): void {
        // throw new Error('Method not implemented.');
    }
}
