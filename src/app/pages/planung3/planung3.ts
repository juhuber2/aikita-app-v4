import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChildGroup } from '../../models/child-group';
import { GroupModel } from '../../models/child-group';
import { Master } from '../../services/master';

@Component({
  selector: 'app-planung3',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './planung3.html',
  styleUrl: './planung3.css'
})
export class Planung3 {
  private fb = inject(FormBuilder);
  private kinderService = inject(Master);

  kinder: ChildGroup[] = [];
  form!: FormGroup;
  editMode = false;
  selectedId: number | null = null;
  group: GroupModel[] = [];

  ngOnInit(): void {
    this.loadKinder();

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      alter: [0, [Validators.required, Validators.min(1)]],
      gruppe: ['', Validators.required]
    });
  }

  //alle Kinder laden
  loadKinder(): void {
    this.kinderService.getKinder().subscribe(data => this.kinder = data);
  }

  //Formular absenden (neu oder update)
  onSubmit(): void {
    if (this.form.invalid) return;

    const kind: ChildGroup = {
      id: this.selectedId ?? 0,
      ...this.form.value
    };

    if (this.editMode) {
      this.kinderService.updateKind(kind).subscribe(() => {
        this.loadKinder();
        this.cancel();
      });
    } else {
      this.kinderService.addKind(kind).subscribe(() => {
        this.loadKinder();
        this.form.reset();
      });
    }
  }

  //Nach Gruppe filtern
  getChildGroup(id: number): void {
     this.kinderService.getKinderNachGruppe(id).subscribe(data => this.kinder = data);
  }




  //Bearbeiten starten
  editKind(kind: ChildGroup): void {
    this.editMode = true;
    this.selectedId = kind.id;
    this.form.patchValue(kind);
  }

  //Bearbeiten abbrechen
  cancel(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form.reset();
  }

  //Kind löschen
  deleteKind(id: number): void {
    this.kinderService.deleteKind(id).subscribe(() => this.loadKinder());
  }
}