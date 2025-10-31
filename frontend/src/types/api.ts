export interface UserSummary {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export interface PetFormData {
    name: string;
    species: string;
    breed?: string;
    age?: number | null;
    weight?: number | null;
    gender?: string;
    description?: string;
    color?: string;
    isNeutered?: boolean;
    medicalHistory?: string;
    allergies?: string;
    medications?: string;
    vetInfo?: string;
}

export interface Pet extends PetFormData {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string | null;
}

export interface SymptomFormData {
    petId: string;
    title: string;
    description: string;
    severity: 'mild' | 'moderate' | 'severe' | 'emergency';
    duration: string;
    frequency?: string;
    bodyPart?: string;
    behaviorChanges?: string;
    appetite?: string;
    energy?: string;
    symptoms?: string[];
}

export interface SymptomAnalysis {
    id: string;
    aiAnalysis: string;
    recommendations: string[];
    urgencyLevel: string;
    suggestedActions: string[];
    createdAt: string;
}

export interface SymptomReport {
    id: string;
    petId: string;
    title: string;
    symptoms: string[];
    severity: string;
    duration: string;
    frequency?: string | null;
    description?: string | null;
    bodyPart?: string | null;
    behaviorChanges?: string | null;
    appetite?: string | null;
    energy?: string | null;
    createdAt: string;
    updatedAt: string;
    analysis?: SymptomAnalysis | null;
}