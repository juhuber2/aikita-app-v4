
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { Master } from '../../services/master';
import { Child } from '../../models/child';
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
  imports: [ReactiveFormsModule],
  templateUrl: './planung.html',
  styleUrl: './planung.css'
})
export class Planung implements OnInit {
  kinder = signal<Child[]> ([]);
  private kinderService = inject(Master);

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
    // --- Eingabeformular (wird gessendet) ---
    this.form = this.fb.group({
      childId: [null, Validators.required], 
      age: [null, ],
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
    
      // Abhängigkeiten für Dropdowns
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

      //alle Kinder laden + Altersberechnung:
      this.kinderService.getKinder().subscribe(data => this.kinder.set(data));
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
      id: formValue.childId,  // Geändert von childID zu id
      age: Number(formValue.age) || 0,
      observation: formValue.observation || 'Keine Beobachtung angegeben'
    };

    console.log('Sende Beobachtung:', fullData);

    this.masterService.addObservation(fullData).subscribe({
      next: (response) => {
        console.log('Antwort vom Server:', response);

         // 1. Textnamen aus Response holen
        const areaName = response.preview;
        const subareaName = response.preview;
        const subsectionName = response.preview;

        // 2. IDs aus Listen suchen
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
        console.error('Fehler bei Beobachtung:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error Object:', err.error);
        
        let errorMsg = 'Fehler bei der Beobachtung:\n';
        
        if (err.status === 0) {
          errorMsg += 'Keine Verbindung zum Server möglich.\nPrüfe ob das Backend läuft.';
        } else if (err.status === 401) {
          errorMsg += 'Nicht autorisiert - Bitte zuerst einloggen!';
        } else if (err.status === 404) {
          errorMsg += 'Endpoint nicht gefunden.\nAktuell konfiguriert: /ai/infer\nVielleicht /ai/infer/mock probieren?';
        } else if (err.status === 500) {
          errorMsg += 'Server-Fehler.\nMöglicherweise Problem mit AI-Model-Verbindung.';
        } else {
          errorMsg += `Status ${err.status}: ${err.message}`;
        }
        
        alert(errorMsg);
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