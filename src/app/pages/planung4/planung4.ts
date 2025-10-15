// src/app/components/planung4/planung4.ts
import { Component, OnInit } from '@angular/core';
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

  constructor(private fb: FormBuilder, private s: Master) {}

  ngOnInit(): void {
    const current = this.s.getSettings(); // Daten vom Service holen
    this.settingsForm = this.fb.group({
      kindergarten: [current.kindergarten, Validators.required],
      numberChildren: [current.numberChildren, [Validators.required, Validators.min(0)]],
      numberBetreuer: [current.numberBetreuer, [Validators.required, Validators.min(0)]],
    });
  }

  save(): void {
    if (this.settingsForm.valid) {
      this.s.updateSettings(this.settingsForm.value);
    }
  }

}
