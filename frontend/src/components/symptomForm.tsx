import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Pet, SymptomFormData, SymptomReport } from '../types/api';

interface SymptomFormProps {
    pets: Pet[];
    selectedPetId?: string;
    onPetChange: (petId: string) => void;
    onSubmit: (data: SymptomFormData) => Promise<void>;
    onAnalyze: (reportId: string) => Promise<void>;
    reports: SymptomReport[];
    isLoadingReports?: boolean;
}

interface SymptomFormState {
    petId: string;
    title: string;
    description: string;
    severity: string;
    duration: string;
    frequency: string;
    bodyPart: string;
    behaviorChanges: string;
    appetite: string;
    energy: string;
}

type SymptomFormErrors = Partial<Record<keyof SymptomFormState, string>>;

const severityOptions = [
    { value: 'mild', label: 'Mild - Slightly concerning' },
    { value: 'moderate', label: 'Moderate - Noticeable issue' },
    { value: 'severe', label: 'Severe - Very concerning' },
    { value: 'emergency', label: 'Emergency - Immediate attention needed' }
];

const durationOptions = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
];

const frequencyOptions = [
    { value: 'once', label: 'Just once' },
    { value: 'occasional', label: 'Occasional' },
    { value: 'frequent', label: 'Frequent' },
    { value: 'constant', label: 'Constant/Ongoing' }
];

const bodyPartOptions = [
    { value: 'head', label: 'Head/Face' },
    { value: 'eyes', label: 'Eyes' },
    { value: 'ears', label: 'Ears' },
    { value: 'nose', label: 'Nose' },
    { value: 'mouth', label: 'Mouth/Teeth' },
    { value: 'neck', label: 'Neck' },
    { value: 'chest', label: 'Chest' },
    { value: 'abdomen', label: 'Abdomen/Belly' },
    { value: 'back', label: 'Back' },
    { value: 'legs', label: 'Legs' },
    { value: 'paws', label: 'Paws' },
    { value: 'tail', label: 'Tail' },
    { value: 'skin', label: 'Skin (general)' },
    { value: 'other', label: 'Other' }
];

const appetiteOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'decreased', label: 'Decreased' },
    { value: 'increased', label: 'Increased' },
    { value: 'none', label: 'Not eating at all' }
];

const energyOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low energy' },
    { value: 'high', label: 'High energy' },
    { value: 'lethargic', label: 'Lethargic/Very tired' }
];

const SymptomForm: React.FC<SymptomFormProps> = ({
    pets,
    selectedPetId,
    onPetChange,
    onSubmit,
    onAnalyze,
    reports,
    isLoadingReports = false
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const initialState: SymptomFormState = {
        petId: selectedPetId ?? '',
        title: '',
        description: '',
        severity: 'mild',
        duration: '',
        frequency: '',
        bodyPart: '',
        behaviorChanges: '',
        appetite: '',
        energy: ''
    };

    const [formData, setFormData] = useState<SymptomFormState>(initialState);
    const [errors, setErrors] = useState<SymptomFormErrors>({});

    const availablePets = useMemo(() => pets ?? [], [pets]);

    useEffect(() => {
        if (selectedPetId) {
            setFormData((prev) => ({ ...prev, petId: selectedPetId }));
        } else {
            setFormData((prev) => ({ ...prev, petId: '' }));
        }
    }, [selectedPetId]);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (data: SymptomFormState): SymptomFormErrors => {
        const validationErrors: SymptomFormErrors = {};

        if (!data.petId) {
            validationErrors.petId = 'Please select a pet';
        }

        if (!data.title.trim()) {
            validationErrors.title = 'Symptom title is required';
        }

        if (!data.description.trim()) {
            validationErrors.description = 'Description is required';
        }

        if (!data.severity) {
            validationErrors.severity = 'Severity is required';
        }

        if (!data.duration) {
            validationErrors.duration = 'Duration is required';
        }

        if (!data.frequency) {
            validationErrors.frequency = 'Frequency is required';
        }

        return validationErrors;
    };

    const submitSymptomReport = async (payload: SymptomFormData) => {
        if (!payload.petId) {
            toast.error('Please select a pet');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...payload,
                frequency: payload.frequency || undefined,
                bodyPart: payload.bodyPart || undefined,
                behaviorChanges: payload.behaviorChanges || undefined,
                appetite: payload.appetite || undefined,
                energy: payload.energy || undefined
            });
            toast.success('Symptom recorded successfully!');
            setFormData({
                petId: payload.petId,
                title: '',
                description: '',
                severity: 'mild',
                duration: '',
                frequency: '',
                bodyPart: '',
                behaviorChanges: '',
                appetite: '',
                energy: ''
            });
            setErrors({});
            setCurrentStep(1);
        } catch (error: any) {
            const message = error?.response?.data?.error ?? 'Failed to record symptom';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnalyzeReport = async (reportId: string) => {
        setAnalyzingId(reportId);
        try {
            await onAnalyze(reportId);
            toast.success('Analysis completed!');
        } catch (error: any) {
            const message = error?.response?.data?.error ?? 'Analysis failed';
            toast.error(message);
        } finally {
            setAnalyzingId(null);
        }
    };

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validate(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload: SymptomFormData = {
            petId: formData.petId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            severity: formData.severity as SymptomFormData['severity'],
            duration: formData.duration,
            frequency: formData.frequency,
            bodyPart: formData.bodyPart,
            behaviorChanges: formData.behaviorChanges,
            appetite: formData.appetite,
            energy: formData.energy
        };

        await submitSymptomReport(payload);
    };

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const renderStepIndicator = () => (
        <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {step}
                    </div>
                ))}
            </div>
            <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
                <select
                    name="petId"
                    value={formData.petId}
                    onChange={(event) => {
                        handleChange(event);
                        onPetChange(event.target.value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Choose a pet</option>
                    {availablePets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.species})
                        </option>
                    ))}
                </select>
                {errors.petId && <p className="text-red-500 text-sm mt-1">{errors.petId}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptom Title *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Limping, Vomiting, Loss of appetite"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe what you've observed in detail. When did it start? How does it look? Any other details?"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level *</label>
                <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Select severity</option>
                    {severityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timeline & Frequency</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        How long has this been happening? *
                    </label>
                    <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select duration</option>
                        {durationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        How often does it occur? *
                    </label>
                    <select
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.frequency && <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Part Affected</label>
                <select
                    name="bodyPart"
                    value={formData.bodyPart}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Select body part (optional)</option>
                    {bodyPartOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Behavior Changes</label>
                <textarea
                    name="behaviorChanges"
                    value={formData.behaviorChanges}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any changes in behavior, activity level, or routine?"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appetite</label>
                    <select
                        name="appetite"
                        value={formData.appetite}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select appetite level</option>
                        {appetiteOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
                    <select
                        name="energy"
                        value={formData.energy}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select energy level</option>
                        {energyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Important Reminder</h4>
                <p className="text-yellow-700 text-sm">
                    This tool is for informational purposes only and should not replace professional veterinary care. If your pet is
                    showing signs of distress or if symptoms are severe, please contact your veterinarian immediately.
                </p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Record Pet Symptoms</h2>
                    {renderStepIndicator()}
                </div>

                <form onSubmit={onSubmitHandler}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}

                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <div className="space-x-2">
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Recording...' : 'Record Symptom'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        Recorded Symptoms {selectedPetId ? `( ${reports.length} )` : ''}
                    </h3>
                </div>

                {isLoadingReports ? (
                    <p className="text-sm text-gray-500">Loading symptom reports...</p>
                ) : reports.length === 0 ? (
                    <p className="text-sm text-gray-500">No symptom reports yet for this pet.</p>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div key={report.id} className="border border-gray-200 rounded-md p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${report.severity === 'emergency'
                                            ? 'bg-red-100 text-red-800'
                                            : report.severity === 'severe'
                                                ? 'bg-orange-100 text-orange-800'
                                                : report.severity === 'moderate'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        {report.severity}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span>Duration: {report.duration}</span>
                                    {report.frequency && <span>Frequency: {report.frequency}</span>}
                                    {report.bodyPart && <span>Body part: {report.bodyPart}</span>}
                                </div>

                                <div className="mt-3 flex flex-col space-y-2">
                                    {report.analysis ? (
                                        <div className="border border-blue-100 bg-blue-50 rounded-md p-3 text-sm text-blue-900">
                                            <p className="font-semibold">AI Analysis ({report.analysis.urgencyLevel.toUpperCase()})</p>
                                            <p className="mt-1 whitespace-pre-wrap">{report.analysis.aiAnalysis}</p>
                                            <div className="mt-2">
                                                <p className="font-semibold">Recommendations</p>
                                                <ul className="list-disc list-inside text-blue-900">
                                                    {report.analysis.recommendations.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="mt-2">
                                                <p className="font-semibold">Suggested Actions</p>
                                                <ul className="list-disc list-inside text-blue-900">
                                                    {report.analysis.suggestedActions.map((item) => (
                                                        <li key={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAnalyzeReport(report.id)}
                                            disabled={analyzingId === report.id}
                                            className="self-start px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {analyzingId === report.id ? 'Analyzing...' : 'Get AI Analysis'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymptomForm;
