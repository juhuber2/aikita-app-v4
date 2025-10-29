// src/app/components/planung4/planung4.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Master } from '../../services/master';

@Component({
  selector: 'app-planung4',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './planung4.html',
  styleUrls: ['./planung4.css']
})
export class Planung4 implements OnInit {

  settingsForm!: FormGroup;
  masterService = inject(Master);
  childrenCount: number = 0;

  constructor(private fb: FormBuilder, private s: Master) {}

  ngOnInit(): void {
  const current = this.s.getSettings();

  // 1) Formular sofort bauen → aber ohne Kinderanzahl (erstmal 0)
  this.settingsForm = this.fb.group({
    kindergarten: [current.kindergarten, Validators.required],
    numberChildren: [0],
    numberBetreuer: [current.numberBetreuer, [Validators.required, Validators.min(0)]],
  });

  // 2) Asynchrone Daten holen
  this.masterService.getChildrenCount().subscribe({
    next: (count) => {
      this.childrenCount = count;
      console.log('Anzahl Kinder:', count);

      // 3) Formularfeld aktualisieren
      this.settingsForm.patchValue({
        numberChildren: count
      });
    }
  });
}


  save(): void {
    if (this.settingsForm.valid) {
      this.s.updateSettings(this.settingsForm.value);
    }
  }
}