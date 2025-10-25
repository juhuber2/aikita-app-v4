export interface Child {
	id: number;
	name: string;
	birthdate: string;
	gender: string;
	groupId: number;
}

/*
Alte Interface für Abwärtskompatibilität (falls noch verwendet)
export interface ChildLegacy {
	id: string,
    childID: string;
    gender: string;
    age: string;
    observation: string;
	name: string;
    area: string;
	sub: string;
	subsec: string;
	goal: string;
	activity: string;
	ageOut: string;
	modelId: string;
	promptV: string;
	expires: string
}
*/