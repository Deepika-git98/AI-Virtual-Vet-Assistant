import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Pet, PetFormData } from '../types/api';

interface PetFormProps {
    pet?: Pet;
    onSubmit: (data: PetFormData) => Promise<void>;
    onCancel?: () => void;
}

interface PetFormState {
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    gender: string;
    description: string;
    color: string;
    isNeutered: boolean;
    medicalHistory: string;
    allergies: string;
    medications: string;
    vetInfo: string;
}

type FormErrors = Partial<Record<keyof PetFormState, string>>;

const EMPTY_PET_FORM: PetFormState = {
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    description: '',
    color: '',
    isNeutered: false,
    medicalHistory: '',
    allergies: '',
    medications: '',
    vetInfo: ''
};

const PetForm: React.FC<PetFormProps> = ({ pet, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<PetFormState>({ ...EMPTY_PET_FORM });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name,
                species: pet.species,
                breed: pet.breed ?? '',
                age: pet.age !== null && pet.age !== undefined ? String(pet.age) : '',
                weight: pet.weight !== null && pet.weight !== undefined ? String(pet.weight) : '',
                gender: pet.gender ?? '',
                description: pet.description ?? '',
                color: pet.color ?? '',
                isNeutered: pet.isNeutered ?? false,
                medicalHistory: pet.medicalHistory ?? '',
                allergies: pet.allergies ?? '',
                medications: pet.medications ?? '',
                vetInfo: pet.vetInfo ?? ''
            });
            setErrors({});
        } else {
            setFormData({ ...EMPTY_PET_FORM });
            setErrors({});
        }
    }, [pet]);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        let nextValue: string | boolean = value;

        if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
            nextValue = event.target.checked;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue as never
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (data: PetFormState): FormErrors => {
        const validationErrors: FormErrors = {};

        if (!data.name.trim()) {
            validationErrors.name = 'Pet name is required';
        }

        if (!data.species.trim()) {
            validationErrors.species = 'Species is required';
        }

        return validationErrors;
    };

    const handleFormSubmit = async (data: PetFormData) => {
        setLoading(true);
        try {
            await onSubmit({
                ...data,
                age: data.age ?? null,
                weight: data.weight ?? null
            });
            toast.success(pet ? 'Pet updated successfully!' : 'Pet created successfully!');

            if (!pet) {
                setFormData({ ...EMPTY_PET_FORM });
            }
        } catch (error: any) {
            const message = error?.response?.data?.error ?? 'Operation failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validate(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload: PetFormData = {
            name: formData.name.trim(),
            species: formData.species.trim(),
            breed: formData.breed.trim() || undefined,
            age: formData.age ? Number(formData.age) : null,
            weight: formData.weight ? Number(formData.weight) : null,
            gender: formData.gender || undefined,
            description: formData.description.trim() || undefined,
            color: formData.color.trim() || undefined,
            isNeutered: formData.isNeutered,
            medicalHistory: formData.medicalHistory.trim() || undefined,
            allergies: formData.allergies.trim() || undefined,
            medications: formData.medications.trim() || undefined,
            vetInfo: formData.vetInfo.trim() || undefined
        };

        await handleFormSubmit(payload);

        if (!pet) {
            setFormData({ ...EMPTY_PET_FORM });
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {pet ? 'Edit Pet' : 'Add New Pet'}
            </h2>

            <form onSubmit={onSubmitHandler} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pet Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Species *
                        </label>
                        <select
                            name="species"
                            value={formData.species}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select species</option>
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                            <option value="bird">Bird</option>
                            <option value="rabbit">Rabbit</option>
                            <option value="fish">Fish</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.species && <p className="text-red-500 text-sm mt-1">{errors.species}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Breed
                        </label>
                        <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age (years)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unknown">Unknown</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                        </label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center pt-6">
                        <input
                            type="checkbox"
                            name="isNeutered"
                            checked={formData.isNeutered}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Spayed/Neutered
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="General notes about your pet"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical History
                    </label>
                    <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Previous illnesses, surgeries, chronic conditions"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allergies
                        </label>
                        <textarea
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Known allergies"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Medications
                        </label>
                        <textarea
                            name="medications"
                            value={formData.medications}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Current medications and dosages"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veterinarian Information
                    </label>
                    <textarea
                        name="vetInfo"
                        value={formData.vetInfo}
                        onChange={handleChange}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Veterinarian name, clinic, contact info"
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : pet ? 'Update Pet' : 'Create Pet'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PetForm;
