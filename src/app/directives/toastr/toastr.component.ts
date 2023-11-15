import {Component, Input, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'app-toastr',
    templateUrl: './toastr.component.html',
    styleUrls: ['./toastr.component.scss'],
    animations: [
        trigger('opacityTranslateY', [
            transition(':enter', [
                style({transform: 'translateY(0.5rem)', opacity: 0}),
                animate('300ms ease-out', style({transform: 'translateY(0)', opacity: 1}))
            ]),
            transition(':leave', [
                style({transform: 'translateY(0)', opacity: 1}),
                animate('100ms ease-in', style({transform: 'translateY(0.5rem)', opacity: 0}))
            ])
        ])
    ]
})
export class ToastrComponent implements OnInit {

    @Input() isNotification = true;
    @Input() message = '';

    ngOnInit() {
        setTimeout(() => {
            this.isNotification = false
        }, 4000)
    }
    close(){
        this.isNotification = false
    }
}
