import { Component, inject, OnInit } from '@angular/core';
import { Master } from '../../services/master';
import { Child } from '../../models/child';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-planung',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './planung.html',
  styleUrl: './planung.css'
})
export class Planung implements OnInit {
  
  childrenList: Child[] = [];
  childForm!: FormGroup;
  masterService = inject(Master);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
       this.childForm = this.fb.group({
        childID: ['0'],
        gender: ['', Validators.required],
        age: ['', Validators.required],
        observation: ['', Validators.required]
        
        });
  }

  addChildren() {
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      alert("Dateneingabe überprüfen");
      return;
    }

    this.masterService.addChildrenMaster(this.childForm.value).subscribe(res => {
      this.childrenList.push(res);  //zur Tabelle hinzufügen
      this.childForm.reset({ childID: '0' }); //Tabelle reset
      alert("Kind erfolgreich hinzugefügt");
    })
  }
}