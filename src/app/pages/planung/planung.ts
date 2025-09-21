import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, Form } from '@angular/forms';
import { Master } from '../../services/master';
import { Child } from '../../models/child';
import { Suggestion } from '../../models/suggestion';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-planung',
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './planung.html',
  styleUrl: './planung.css'
})
export class Planung implements OnInit {
  childForm!: FormGroup;
  solutionForm!: FormGroup;

  areaList: any[] = [];
  subList: any[] = [];
  subsecList: any[] = [];

  showSolution = false;

  masterService = inject(Master);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Linkes Formular: Beobachtung
    this.childForm = this.fb.group({
      observation: ['', Validators.required],
    });

    // Rechtes Formular: Vorschlag
    this.solutionForm = this.fb.group({
      observation: [''],
      area: [''],
      sub: [''],
      subsec: [''],
      goal: [''],
      ageOut: [''],
      activity: [''],
      id: [''],
    });

    // Bereichsdaten laden
    this.masterService.getAreaDataMaster().subscribe((areas: any[]) => {
      this.areaList = areas;
    });
  }

  // Button: Antwort erstellen
  createAnswer() {
    this.showSolution = true;

    // Zuerst die Suggestion vom MockAPI laden
    this.masterService.getSuggestionByIdDataMaster(2).subscribe((data: Suggestion) => {
      // Lösung ins Formular patchen
      this.solutionForm.patchValue({
        observation: this.childForm.value.observation, // Beobachtung bleibt
        area: data.area,
        sub: data.sub,
        subsec: data.subsec,
        goal: data.goal,
        ageOut: data.ageOut,
        activity: data.activity,
        id: data.id,
      });

      // Dropdowns vorbereiten
      this.subList = this.areaList.find(a => a.name === data.area)?.sub || [];
      this.subsecList = this.subList.find((s: any) => s.name === data.sub)?.subsec || [];
    });
  }

  // Bereich ändern
  onAreaChange() {
    const areaName = this.solutionForm.get('area')?.value;
    const selectedArea = this.areaList.find(a => a.name === areaName);
    this.subList = selectedArea?.sub || [];
    this.subsecList = [];
    this.solutionForm.patchValue({ sub: '', subsec: '' });
  }

  // Teilbereich ändern
  onSubChange() {
    const subName = this.solutionForm.get('sub')?.value;
    const areaName = this.solutionForm.get('area')?.value;
    const selectedArea = this.areaList.find(a => a.name === areaName);
    const selectedSub = selectedArea?.sub.find((s: any) => s.name === subName);
    this.subsecList = selectedSub?.subsec || [];
    this.solutionForm.patchValue({ subsec: '' });
  }

  // Speichern / Update
  updateChildren() {
    const updatedChild: Child = this.solutionForm.value as Child;
    //const id = updatedChild.id;
    const id = updatedChild.id;

    this.masterService.updateChildMaster(id, updatedChild).subscribe({
      next: (res: Child) => {
        alert('Daten erfolgreich gespeichert!');
      },
      error: (err) => {
        console.error('Fehler beim Update', err);
        alert('Fehler beim Speichern');
      },
    });
  }

  createChild() {
  const newChild: Child = this.solutionForm.value as Child;

  // ⚠️ ID weglassen, wenn der Server selbst eine neue ID erstellt
  delete (newChild as any).id;

  this.masterService.addChildrenMaster(newChild).subscribe({
    next: (res: Child) => {
      alert('Neuer Datensatz erfolgreich gespeichert!');
    },
    error: (err) => {
      console.error('Fehler beim Erstellen', err);
      alert('Fehler beim Speichern');
    },
  });
}

}