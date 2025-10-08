
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Master } from '../../services/master';
import {
  AreaModel,
  SubAreaModel,
  SubSectionModel,
  GoalModel,
  ActivityModel,
  ObservationModel,
  SuggestionModel
} from '../../models/suggestion'

@Component({
  selector: 'app-planung',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './planung.html',
  styleUrl: './planung.css'
})
export class Planung implements OnInit {
  form!: FormGroup;
  formTemp!: FormGroup;
  showSolution = false;

  //Daten vom Backend
  areasAll: AreaModel[] = [];
  subareasAll: SubAreaModel[] = [];
  subsectionsAll: SubSectionModel[] = [];

  // Gefilterte Listen
  areas: any[] = [];
  subareas: any[] = [];
  subsections: any[] = [];

  masterService = inject(Master);
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    //Areas laden
    this.masterService.getAllAreas().subscribe({
      next: (data) => (this.areas = data.map(a => a.definition)),
      error: (err) => console.error('Fehler beim Laden der Bereiche', err)
    });

    //Subareas laden
    this.masterService.getSubareas().subscribe({
      next: (data) => (this.subareas = data.map(s => s.definition)),
      error: (err) => console.error('Fehler beim Laden der Bereiche', err)
    });


    // --- Eingabeformular (wird gessendet) ---
    this.form = this.fb.group({
      childId: [1],
      age: [null],
      observation: ['']
    });

    // --- Antwortformular (wird empfangen) ---
    this.formTemp = this.fb.group({
      resultId: [0],
      resultToken: [null],
      expiresAt: [null],
      preview: this.fb.group({
        area: [null],
        subarea: [null],
        subsection: [null],
        goal: [null],
        age: [null],
        activity: [null],
        confidence: [null],
        resultId: [0],
        resultToken: [null],
        childId: [null]
      })
    });

    this.loadData();
    
      // 🔹 Abhängigkeiten für Dropdowns
      const previewGroup = this.formTemp.get('preview') as FormGroup;

      // Bereich → Teilbereiche
      previewGroup.get('area')?.valueChanges.subscribe((areaId) => {
        this.subareas = this.subareasAll.filter(s => s.areaId === areaId);
        previewGroup.patchValue({ subarea: null, subsection: null });
        this.subsections = [];
      });

      // Teilbereich → Unterbereiche
      previewGroup.get('subarea')?.valueChanges.subscribe((subId) => {
        this.subsections = this.subsectionsAll.filter(s => s.subAreaId === subId);
        previewGroup.patchValue({ subsection: null });
      });
    }

     // Lade alle Listen vom Backend
  loadData() {
    this.masterService.getAllAreas().subscribe({
      next: (data) => {
        this.areasAll = data;
        this.areas = data;
      },
      error: (err) => console.error('Fehler beim Laden der Bereiche', err)
    });

    this.masterService.getSubareas().subscribe({
      next: (data) => (this.subareasAll = data),
      error: (err) => console.error('Fehler beim Laden der Subareas', err)
    });

    this.masterService.getSubsections().subscribe({
      next: (data) => (this.subsectionsAll = data),
      error: (err) => console.error('Fehler beim Laden der Subsections', err)
    });

  }

  // --- Anfrage an Server schicken ---
  createAnswer() {
    this.showSolution = true;

    const formValue = this.form.value;

    const fullData: ObservationModel = {
      childID: formValue.childId,
      age: Number(formValue.age) || 0,
      observation: formValue.observation || 'Keine Beobachtung angegeben'
    };

    this.masterService.addObservation(fullData).subscribe({
      next: (response) => {
        console.log('Antwort vom Server:', response);

         // 🔹 1. Textnamen aus Response holen
        const areaName = response.preview;
        const subareaName = response.preview;
        const subsectionName = response.preview;

        // 🔹 2. IDs aus Listen suchen
        const areaId = this.areasAll.find(a => a.definition === areaName)?.id ?? null;
        const subareaId = this.subareasAll.find(s => s.definition === subareaName)?.id ?? null;
        const subsectionId = this.subsectionsAll.find(s => s.definition === subsectionName)?.id ?? null;

        // Antwort ins zweite Formular (formTemp) schreiben:
        this.formTemp.patchValue({
          resultId: response.resultId,
          resultToken: response.resultToken,
          expiresAt: response.expiresAt,
          preview: response.preview
        });

        alert('Beobachtung erfolgreich gesendet!');
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        alert('Fehler beim Speichern!');
      }
    });
  }


  //Daten werden and das Backend gesendet und gespeichert
  saveSuggestion() {
    const temp = this.formTemp.value;
    const preview = temp.preview;

    const suggestion = {
      area: preview.area,
      subArea: preview.subarea,
      subSection: preview.subsection,
      goal: preview.goal,
      activity: preview.activity,
      age: Number(preview.age) || 0,
      observation: this.form.value.observation,
      resultId: temp.resultId,
      resultToken: temp.resultToken,
      childId: preview.childId
  };

    this.masterService.addSuggestion(suggestion).subscribe({
        next: (response) => {
          console.log('Suggestion gespeichert:', response);
          alert('Empfehlung erfolgreich gespeichert!');
        },
        error: (err) => {
          console.error('Fehler beim Speichern:', err);
          alert('Fehler beim Speichern!');
        }
      });
    }
}