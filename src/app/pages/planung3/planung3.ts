import { Component, OnInit, inject,  } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Child } from '../../models/child';
import { GroupModel } from '../../models/child-group';
import { Master } from '../../services/master';
import { DatePipe } from '@angular/common';
import { signal } from '@angular/core'; //Versuch mit Signals

@Component({
  selector: 'app-planung3',
  imports: [FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './planung3.html',
  styleUrl: './planung3.css'
})
export class Planung3 implements OnInit {
  private fb = inject(FormBuilder);
  private kinderService = inject(Master);

  //kinder: Child[] = []; //ChildGroup[] = [];
  kinder = signal<Child[]> ([]);
  form!: FormGroup;
  editMode = false;
  selectedId: number | null = null;
  groups: GroupModel[] = [];

  ngOnInit(): void {
    this.loadKinder();

    this.form = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      birthdate: ['' ],
      gender: [''],
      img: [''],
      groupId: [''],
      filterGroupId: ['']
    });
  }

  //alle Kinder laden
  loadKinder(): void {
    this.kinderService.getKinder().subscribe(data => this.kinder.set(data));
  }

  //Formular absenden (neu oder update)
  onSubmit(): void {
    if (this.form.invalid) return;

    const kind: Child = {
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
  loadKinderNachGruppe(): void {
  const groupIdValue = this.form.get('filterGroupId')?.value;

  if (!groupIdValue) {
    alert('Bitte zuerst eine Gruppe auswählen!');
    return;
  }

  const groupId = Number(groupIdValue); // <--- Hier sicherstellen, dass es eine Zahl ist

  this.kinderService.getChildrenByGroupId(groupId).subscribe({
    next: data => {
      console.log('Ergebnis:', data);
      this.kinder.set(data);
    },
    error: err => console.error('Fehler:', err)
  });
}


  //Bearbeiten starten
  editKind(kind: Child): void {
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