import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { Master } from '../../services/master';

@Component({
  selector: 'app-planung4',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './planung4.html',
  styleUrls: ['./planung4.css']
})
export class Planung4 implements OnInit {

  settingsForm!: FormGroup;
  masterService = inject(Master);

  constructor(private fb: FormBuilder, private s: Master) {}

  ngOnInit(): void {

    // Lokale Einstellungen
    const current = this.s.getSettings();

    // Formular bauen – numberChildren disabled!
    this.settingsForm = this.fb.group({
      kindergarten: [current.kindergarten, Validators.required],
      numberChildren: [{ value: 0, disabled: true }],   // ✅ nicht editierbar
      numberBetreuer: [current.numberBetreuer, [Validators.required, Validators.min(0)]],
    });

    // ✅ Kinderanzahl automatisch laden
    this.masterService.getChildrenCount().subscribe({
      next: (count: number) => {
        console.log('Anzahl Kinder aus API:', count);

        // Formular aktualisieren
        this.settingsForm.patchValue({
          numberChildren: count
        });

        this.save();
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Kinderanzahl:', err);
      }
    });
  }

  
  save(): void {
    if (this.settingsForm.valid) {
      // ❗ getRawValue() holt auch disabled Felder wie numberChildren
      const data = this.settingsForm.getRawValue();
      this.s.updateSettings(data);
      console.log('✅ Gespeichert:', data);
    }
  }
}