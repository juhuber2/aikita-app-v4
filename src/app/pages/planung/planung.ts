import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';  // <-- Wichtig!
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
  childForm!: FormGroup; // linkes Formular
  solutionForm!: FormGroup; // rechtes Formular
  masterService = inject(Master);

  areaList: any[] = [];
  subList: any[] = [];
  subsecList: any[] = [];

  showSolution = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // linkes Formular
    this.childForm = this.fb.group({
      childID: [null],
      gender: ['', Validators.required],
      age: ['', Validators.required],
      observation: ['', Validators.required],
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
      area: [''],
      sub: [''],
      subsec: [''],
      goal: [''],
      activity: [''],
      ageOut: [''],
    });

    this.loadArea();
  }

  // ---- Daten laden ----
  loadArea() {
    this.masterService.getAreaDataMaster().subscribe((res: any) => {
      this.areaList = res;
    });
  }

  // ---- CRUD ----
  getAllChildren(){
    this.masterService.getAllChildrenMaster().subscribe((res: any)=>{
      this.childrenList = res;
    });
  }

  getChildById(id: any) {
    this.masterService.getChildByIdMaster(id).subscribe((res: any)=>{
      this.childrenList = [res]; 
    });
  }

  addChildren() {
    if (this.childForm.invalid) {
      alert("Dateneingabe überprüfen");
      return;
    } else {
      this.showSolution = true;
    }

    const formValues = this.childForm.value;

    this.masterService.addChildrenMaster(formValues).subscribe(res => {
      this.childrenList.push(res);  
      this.solutionForm.patchValue(res);  
      this.childForm.reset({ childID: '0' }); 
      alert("Kind erfolgreich hinzugefügt");
    });
  }

  updateChildren() {
    if (this.solutionForm.invalid) {
    alert("Bitte alle Pflichtfelder ausfüllen!");
    return;
    }

  const updatedChild = this.solutionForm.value;   //  Formulardaten
  const id = updatedChild.childID;                // ID aus Formular holen

    this.masterService.updateChildMaster(id, updatedChild).subscribe({
      next: () => {
        alert('Kind erfolgreich upgedated');
      },
      error: (err) => {
      console.error('Update fehlgeschlagen:', err);
      alert('Fehler beim Update');
    }
    })
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
