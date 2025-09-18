import { Component, inject, OnInit } from '@angular/core';
import { Master } from '../../services/master';
import { Child } from '../../models/child';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-planung2',
  imports: [],
  templateUrl: './planung2.html',
  styleUrl: './planung2.css'
})
export class Planung2 implements OnInit {
childrenList: Child[] = [];
  childForm!: FormGroup;
  masterService = inject(Master);

  constructor(private fb: FormBuilder) {}

 	ngOnInit(): void {
		this.childForm = this.fb.group({
			childID: ['0'],
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

    this.getAllChildren();
  }

  getAllChildren(){
   this.masterService.getAllChildrenMaster().subscribe({
  	next: (res: any) => {
	console.log('Server antwortet:', res);
    this.childrenList = res;
    debugger;
  	},
  	error: (error) => {
		debugger;
		alert(error.message);
	}
	});
  }
}