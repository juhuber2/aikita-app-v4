import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Master } from '../../services/master';
import { Child } from '../../models/child';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-planung',
  imports: [FormsModule, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './planung.html',
  styleUrl: './planung.css'
})
export class Planung implements OnInit {

  childrenList: Child[] = [];
  childForm!: FormGroup; 
  solutionForm!: FormGroup; 
  masterService = inject(Master);

  areaList: any[] = [];
  subList: any[] = [];
  subsecList: any[] = [];

  showSolution = false;

  fullText: string = 'Gib hier deine Beoabchtung zu einem Kind ein.';
  displayText: string = '';
  currentIndex: number = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // linkes Formular
    this.childForm = this.fb.group({
      childID: [null],
      gender: [''],
      age: [''],
      observation: ['', Validators.required],
      name: ['', Validators.required],
      area: [''],
      sub: [''],
      subsec: [''],
      goal: [''],
      activity: [''],
      ageOut: [''],
      modelId: [''],
      promptV: [''],
      expires: ['']
    });

    // rechtes Formular
    this.solutionForm = this.fb.group({
      childID: [''],
      gender: [''],
      age: [''],
      observation: [''],
      name: [''],
      area: [''],
      sub: [''],
      subsec: [''],
      goal: [''],
      activity: [''],
      ageOut: [''],
    });

    this.startTyping();
    this.loadArea();
  }

  startTyping() {
    const interval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.displayText += this.fullText[this.currentIndex];
        this.currentIndex++;
      } else {
        clearInterval(interval); // stoppt, wenn fertig
      }
    }, 100); // 100 ms pro Zeichen
  }

  // ---- Daten laden ----
  loadArea() {
    this.masterService.getAreaDataMaster().subscribe((res: any[]) => {
      this.areaList = res;
    });
  }

  // ---- CRUD ----
  getAllChildren() {
    this.masterService.getAllChildrenMaster().subscribe((res: Child[]) => {
      this.childrenList = res;
    });
  }

  addChildren() {
    if (this.childForm.invalid) {
      alert("Dateneingabe überprüfen");
      return;
    }

    this.showSolution = true;

    const formValues: Child = this.childForm.value as Child;

    this.masterService.addChildrenMaster(formValues).subscribe((res: Child) => {
      this.childrenList.push(res);
      this.solutionForm.patchValue(res);
      this.childForm.reset({ childID: '0' });
    });
  }

  updateChildren() {
    if (this.solutionForm.invalid) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    const updatedChild: Child = this.solutionForm.value as Child;
    const id = updatedChild.childID;

    this.masterService.updateChildMaster(id, updatedChild).subscribe({
      next: (res: Child) => {
        // Aktualisieren in childrenList
        const index = this.childrenList.findIndex(c => c.childID === id);
        if (index !== -1) {
          this.childrenList[index] = res;
        }
        alert('Kind erfolgreich upgedated');
      },
      error: (err) => {
        console.error('Update fehlgeschlagen:', err);
        alert('Fehler beim Update');
      }
    });
  }

  // ---- Auswahl ----
  onAreaChange() {
    const areaName = this.childForm.get('area')?.value || this.solutionForm.get('area')?.value;
    const selectedArea = this.areaList.find(a => a.name === areaName);
    this.subList = selectedArea ? selectedArea.sub : [];
    this.subsecList = [];
    this.childForm.patchValue({ sub: '', subsec: '' });
    this.solutionForm.patchValue({ sub: '', subsec: '' });
  }

  onSubChange() {
    const subName = this.childForm.get('sub')?.value || this.solutionForm.get('sub')?.value;
    const areaName = this.childForm.get('area')?.value || this.solutionForm.get('area')?.value;

    const selectedArea = this.areaList.find(a => a.name === areaName);
    const selectedSub = selectedArea?.sub.find((s: any) => s.name === subName);
    this.subsecList = selectedSub ? selectedSub.subsec : [];
    this.childForm.patchValue({ subsec: '' });
    this.solutionForm.patchValue({ subsec: '' });
  }
}
