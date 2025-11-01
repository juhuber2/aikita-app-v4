import { Component, inject, OnInit } from '@angular/core';
import { Master } from '../../services/master';
import { Child } from '../../models/child';
import { ObservationbyChildModel } from '../../models/suggestion';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { signal } from '@angular/core';
import { DateService } from '../../services/date';

@Component({
  selector: 'app-planung2',
  imports: [DatePipe, NgIf, NgForOf],
  templateUrl: './planung2.html',
  styleUrl: './planung2.css'
})
export class Planung2 implements OnInit {
  childrenList: Child[] = [];
  childForm!: FormGroup;
  selectedChild: any = null;
  childrenListByObservation: ObservationbyChildModel[] = [];
  masterService = inject(Master);
  
  kinder = signal<Child[]> ([]);
  private kinderService = inject(Master);

  constructor(private fb: FormBuilder, private dateService: DateService) {}

  // Wenn ein Kind ausgewählt wird
  onSelectChild(childId: number) {
    this.selectedChild = this.childrenList.find(c => c.id === childId);
    if (childId) {
      this.getChildrenByObservation(childId);
    }
  }

  calculateAge(b: string) {
    return this.dateService.calculateAge(b);
  }


  // Hilfsfunktion: Formatiert das Geschlecht für die Anzeige
  getGenderDisplay(gender: string): string {
    return gender === 'Male' ? 'Junge' : gender === 'Female' ? 'Mädchen' : gender;
  }

  // Hilfsfunktion: Gibt den richtigen Bild-Pfad zurück
  getGenderImage(gender: string): string {
    return gender === 'Female' ? '/girl.png' : '/boy.png';
  }

  ngOnInit(): void {
		this.childForm = this.fb.group({
			id: [0],
			name: ['', Validators.required],
			birthdate: ['', Validators.required],
			gender: ['', Validators.required],
			groupId: [0, Validators.required]
		});

    
    this.getAllChildren();
    this.kinderService.getKinder().subscribe(data => this.kinder.set(data));
  }

 

  getAllChildren(){
   this.masterService.getAllChildrenMaster().subscribe({
  	next: (res: any) => {
	    console.log('✅ Server antwortet erfolgreich:', res);
      console.log('📊 Anzahl der Kinder:', res?.length || 0);
      
      if (res && res.length > 0) {
        console.log('👶 Erstes Kind als Beispiel:', res[0]);
      }
      
      this.childrenList = res;
  	},
  	error: (error) => {
      console.error('❌ Fehler beim Laden der Kinder:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('URL:', error.url);
      
      let errorMsg = '❌ Fehler beim Laden der Kinder:\n\n';
      
      if (error.status === 0) {
        errorMsg += ' CORS-Fehler oder keine Verbindung zum Server!\n\n';
        errorMsg += 'Mögliche Ursachen:\n';
        errorMsg += '1. Backend läuft nicht\n';
        errorMsg += '2. CORS-Header fehlen im Backend\n';
        errorMsg += '3. Falscher Header (X-Session-Token statt Authorization)\n\n';
      } else if (error.status === 401) {
        errorMsg += '⚠️ Nicht autorisiert!\n\n';
        errorMsg += 'Bitte zuerst über Login-Seite einloggen.\n';
        errorMsg += 'Der X-Session-Token fehlt oder ist ungültig.';
      } else if (error.status === 404) {
        errorMsg += '⚠️ Endpoint nicht gefunden!\n\n';
        errorMsg += 'URL: ' + error.url;
      } else {
        errorMsg += `Status ${error.status}: ${error.message}`;
      }
      
      alert(errorMsg);
	  }
	});
  }

  getChildrenByObservation(childId: number) {
      this.masterService.getChildrenByObservation(1).subscribe({
        next: (res: ObservationbyChildModel[]) => {
          console.log("✅ Beobachtungen erhalten:", res);
          this.childrenListByObservation = res;
        },
        error: (err) => {
          console.error("❌ Fehler beim Laden der Beobachtungen:", err);
        }
      });
  }


  
}