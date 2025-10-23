//Interface für die Beobachtung
export interface ObservationModel {
	id: number;  // Geändert von childID zu id
	age: number;
	observation: string;
	resultId?: number,
    resultToken?: string,
    expiresAt?: string,
    preview?: string
}

//Interface für fertigen Datensatz: Vorschlag KI + UserÄnderung
export interface SuggestionModel {
  id: number;
  observations: string;
  area: string;
  subArea: string;
  subSection: string;
  goal: string;
  age: number;
  activity: string;
  resultId: number;
  resultToken: string;
  childId: number
}

export interface AreaModel {
  id: number;
  definition: string;
}

export interface SubAreaModel {
  id: number;
  areaId: number;
  definition: string;
}

export interface SubSectionModel {
  id: number;
  subAreaId: number;
  definition: string;
}

export interface GoalModel {
  id: number;
  subSectionId: number;
  age: number;
  definition: string;
}

export interface ActivityModel {
  id: number;
  goalsId: number;
  definition: string;
}