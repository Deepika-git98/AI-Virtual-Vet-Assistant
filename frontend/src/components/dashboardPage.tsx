import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import PetForm from './PetForm';
import SymptomForm from './symptomForm';
import { api } from '../utils/api';
import { Pet, PetFormData, SymptomFormData, SymptomReport } from '../types/api';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
    const [symptomReports, setSymptomReports] = useState<SymptomReport[]>([]);
    const [loadingPets, setLoadingPets] = useState<boolean>(true);
    const [loadingReports, setLoadingReports] = useState<boolean>(false);
    const [showPetForm, setShowPetForm] = useState<boolean>(false);

    useEffect(() => {
        void fetchPets();
    }, []);

    useEffect(() => {
        if (selectedPetId) {
            void fetchSymptomReports(selectedPetId);
        } else {
            setSymptomReports([]);
        }
    }, [selectedPetId]);

    const fetchPets = async () => {
        setLoadingPets(true);
        try {
            const petsData = await api.get<Pet[]>('/pets');
            setPets(petsData);

            if (petsData.length > 0) {
                setSelectedPetId((current) => {
                    if (current && petsData.some((pet) => pet.id === current)) {
                        return current;
                    }
                    return petsData[0].id;
                });
            } else {
                setSelectedPetId(undefined);
            }
        } catch (error) {
            console.error('Failed to load pets', error);
            toast.error('Failed to load pets');
        } finally {
            setLoadingPets(false);
        }
    };

    const fetchSymptomReports = async (petId: string) => {
        setLoadingReports(true);
        try {
            const response = await api.get<{ reports: SymptomReport[] }>(`/symptoms/pet/${petId}`);
            setSymptomReports(response.reports);
        } catch (error) {
            console.error('Failed to load symptom reports', error);
            toast.error('Failed to load symptom reports');
        } finally {
            setLoadingReports(false);
        }
    };

    const handlePetSubmit = async (data: PetFormData) => {
        await api.post('/pets', data);
        setShowPetForm(false);
        await fetchPets();
    };

    const handleSymptomSubmit = async (data: SymptomFormData) => {
        const payload = {
            ...data,
            symptoms: data.symptoms && data.symptoms.length > 0 ? data.symptoms : [data.title]
        };

        await api.post('/symptoms', payload);

        if (data.petId === selectedPetId) {
            await fetchSymptomReports(data.petId);
        }
    };

    const handleAnalyze = async (reportId: string) => {
        await api.post('/symptoms/analyze', { symptomReportId: reportId });

        if (selectedPetId) {
            await fetchSymptomReports(selectedPetId);
        }
    };

    const handlePetSelection = (petId: string) => {
        setSelectedPetId(petId || undefined);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const selectedPet = useMemo(
        () => pets.find((pet) => pet.id === selectedPetId),
        [pets, selectedPetId]
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Virtual Vet Assistant</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, {user?.firstName ?? user?.email}! Monitor your pets and get AI-assisted insights.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="self-start px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Logout
                    </button>
                </header>

                <section className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Your Pets</h2>
                        <button
                            onClick={() => setShowPetForm((prev) => !prev)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {showPetForm ? 'Close Form' : 'Add New Pet'}
                        </button>
                    </div>

                    {showPetForm && (
                        <div className="mb-6">
                            <PetForm onSubmit={handlePetSubmit} onCancel={() => setShowPetForm(false)} />
                        </div>
                    )}

                    {loadingPets ? (
                        <p className="text-sm text-gray-500">Loading pets...</p>
                    ) : pets.length === 0 ? (
                        <p className="text-sm text-gray-500">You have not added any pets yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pets.map((pet) => (
                                <button
                                    key={pet.id}
                                    onClick={() => handlePetSelection(pet.id)}
                                    className={`text-left border rounded-lg p-4 hover:shadow transition ${pet.id === selectedPetId ? 'border-blue-500 shadow-md' : 'border-gray-200'
                                        }`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                                    <p className="text-sm text-gray-600 capitalize">{pet.species}</p>
                                    {pet.breed && <p className="text-sm text-gray-500">Breed: {pet.breed}</p>}
                                    {pet.age !== undefined && pet.age !== null && (
                                        <p className="text-sm text-gray-500">Age: {pet.age} years</p>
                                    )}
                                    {pet.weight !== undefined && pet.weight !== null && (
                                        <p className="text-sm text-gray-500">Weight: {pet.weight} kg</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {selectedPet && (
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pet Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <p><span className="font-medium">Name:</span> {selectedPet.name}</p>
                            <p><span className="font-medium">Species:</span> {selectedPet.species}</p>
                            {selectedPet.gender && (
                                <p><span className="font-medium">Gender:</span> {selectedPet.gender}</p>
                            )}
                            {selectedPet.breed && (
                                <p><span className="font-medium">Breed:</span> {selectedPet.breed}</p>
                            )}
                            {selectedPet.color && (
                                <p><span className="font-medium">Color:</span> {selectedPet.color}</p>
                            )}
                            <p>
                                <span className="font-medium">Spayed/Neutered:</span> {selectedPet.isNeutered ? 'Yes' : 'No'}
                            </p>
                            {selectedPet.medicalHistory && (
                                <p className="md:col-span-2">
                                    <span className="font-medium">Medical History:</span> {selectedPet.medicalHistory}
                                </p>
                            )}
                            {selectedPet.allergies && (
                                <p className="md:col-span-2">
                                    <span className="font-medium">Allergies:</span> {selectedPet.allergies}
                                </p>
                            )}
                            {selectedPet.medications && (
                                <p className="md:col-span-2">
                                    <span className="font-medium">Current Medications:</span> {selectedPet.medications}
                                </p>
                            )}
                            {selectedPet.vetInfo && (
                                <p className="md:col-span-2">
                                    <span className="font-medium">Veterinarian Info:</span> {selectedPet.vetInfo}
                                </p>
                            )}
                            {selectedPet.description && (
                                <p className="md:col-span-2">
                                    <span className="font-medium">Notes:</span> {selectedPet.description}</p>
                            )}
                        </div>
                    </section>
                )}

                {pets.length > 0 && (
                    <section>
                        <SymptomForm
                            pets={pets}
                            selectedPetId={selectedPetId}
                            onPetChange={handlePetSelection}
                            onSubmit={handleSymptomSubmit}
                            onAnalyze={handleAnalyze}
                            reports={symptomReports}
                            isLoadingReports={loadingReports}
                        />
                    </section>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
