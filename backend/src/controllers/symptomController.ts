import { Response } from 'express';
import { PrismaClient, SymptomAnalysis, SymptomReport } from '@prisma/client';
import { AuthRequest } from '../middleware/userAuth';

const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

type SymptomReportWithRelations = SymptomReport & {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    age: number | null;
    weight: number | null;
    gender: string | null;
    description: string | null;
    imageUrl: string | null;
    medicalHistory: string | null;
    allergies: string | null;
    medications: string | null;
    vetInfo: string | null;
    isNeutered: boolean;
    color: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  analysis: SymptomAnalysis | null;
};

const ensureAuthenticatedUser = (req: AuthRequest, res: Response): string | undefined => {
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return undefined;
  }

  return req.userId;
};

export const createSymptomReport = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = ensureAuthenticatedUser(req, res);
    if (!userId) {
      return;
    }

    const {
      petId,
      title,
      symptoms,
      severity,
      duration,
      frequency,
      description,
      bodyPart,
      behaviorChanges,
      appetite,
      energy
    } = req.body;

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId
      }
    });

    if (!pet) {
      res.status(404).json({ error: 'Pet not found or access denied' });
      return;
    }

    const symptomReport = await prisma.symptomReport.create({
      data: {
        petId,
        title,
        symptoms: Array.isArray(symptoms) && symptoms.length > 0 ? symptoms : [title],
        severity,
        duration,
        frequency: frequency ?? null,
        description: description ?? null,
        bodyPart: bodyPart ?? null,
        behaviorChanges: behaviorChanges ?? null,
        appetite: appetite ?? null,
        energy: energy ?? null
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            weight: true,
            gender: true,
            description: true,
            imageUrl: true,
            medicalHistory: true,
            allergies: true,
            medications: true,
            vetInfo: true,
            isNeutered: true,
            color: true,
            createdAt: true,
            updatedAt: true
          }
        },
        analysis: true
      }
    });

    res.status(201).json({
      message: 'Symptom report created successfully',
      report: symptomReport
    });
  } catch (error) {
    console.error('Create symptom report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSymptomReports = async (req: AuthRequest, res: Response) => {
  try {
    const userId = ensureAuthenticatedUser(req, res);
    if (!userId) {
      return;
    }

    const { petId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId
      }
    });

    if (!pet) {
      res.status(404).json({ error: 'Pet not found or access denied' });
      return;
    }

    const reports = await prisma.symptomReport.findMany({
      where: { petId },
      include: {
        analysis: true
      },
      orderBy: { createdAt: 'desc' },
      take: Number.parseInt(limit as string, 10),
      skip: Number.parseInt(offset as string, 10)
    });

    const totalCount = await prisma.symptomReport.count({
      where: { petId }
    });

    res.json({
      reports,
      pagination: {
        total: totalCount,
        limit: Number.parseInt(limit as string, 10),
        offset: Number.parseInt(offset as string, 10)
      }
    });
  } catch (error) {
    console.error('Get symptom reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSymptomReportById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = ensureAuthenticatedUser(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;

    const report = await prisma.symptomReport.findFirst({
      where: { id },
      include: {
        analysis: true,
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            weight: true,
            gender: true,
            description: true,
            imageUrl: true,
            medicalHistory: true,
            allergies: true,
            medications: true,
            vetInfo: true,
            isNeutered: true,
            color: true,
            createdAt: true,
            updatedAt: true,
            userId: true
          }
        }
      }
    });

    if (!report || report.pet.userId !== userId) {
      res.status(404).json({ error: 'Symptom report not found' });
      return;
    }

    res.json({ report });
  } catch (error) {
    console.error('Get symptom report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const analyzeSymptoms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = ensureAuthenticatedUser(req, res);
    if (!userId) {
      return;
    }

    const { symptomReportId } = req.body;

    const report = await prisma.symptomReport.findFirst({
      where: { id: symptomReportId },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            weight: true,
            gender: true,
            description: true,
            imageUrl: true,
            medicalHistory: true,
            allergies: true,
            medications: true,
            vetInfo: true,
            isNeutered: true,
            color: true,
            createdAt: true,
            updatedAt: true,
            userId: true
          }
        },
        analysis: true
      }
    });

    if (!report || report.pet.userId !== userId) {
      res.status(404).json({ error: 'Symptom report not found' });
      return;
    }

    if (report.analysis) {
      res.json({
        message: 'Analysis already exists',
        analysis: report.analysis
      });
      return;
    }

    const aiAnalysis = await generateAIAnalysis(report);

    const analysis = await prisma.symptomAnalysis.create({
      data: {
        symptomReportId,
        aiAnalysis: aiAnalysis.analysis,
        recommendations: aiAnalysis.recommendations,
        urgencyLevel: aiAnalysis.urgencyLevel,
        suggestedActions: aiAnalysis.suggestedActions
      }
    });

    res.status(201).json({
      message: 'Analysis completed successfully',
      analysis
    });
  } catch (error) {
    console.error('Analyze symptoms error:', error);
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
};

export const updateSymptomReport = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = ensureAuthenticatedUser(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;

    const existingReport = await prisma.symptomReport.findFirst({
      where: { id },
      include: {
        pet: {
          select: { userId: true }
        }
      }
    });

    if (!existingReport || existingReport.pet.userId !== userId) {
      res.status(404).json({ error: 'Symptom report not found' });
      return;
    }

    const {
      title,
      symptoms,
      severity,
      duration,
      frequency,
      description,
      bodyPart,
      behaviorChanges,
      appetite,
      energy
    } = req.body;

    const updatedReport = await prisma.symptomReport.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(symptoms && {
          symptoms: Array.isArray(symptoms) && symptoms.length > 0 ? symptoms : existingReport.symptoms
        }),
        ...(severity && { severity }),
        ...(duration && { duration }),
        ...(frequency !== undefined && { frequency }),
        ...(description !== undefined && { description }),
        ...(bodyPart !== undefined && { bodyPart }),
        ...(behaviorChanges !== undefined && { behaviorChanges }),
        ...(appetite !== undefined && { appetite }),
        ...(energy !== undefined && { energy })
      },
      include: {
        analysis: true
      }
    });

    res.json({
      message: 'Symptom report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update symptom report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSymptomReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = ensureAuthenticatedUser(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;

    const report = await prisma.symptomReport.findFirst({
      where: { id },
      include: {
        pet: {
          select: { userId: true }
        }
      }
    });

    if (!report || report.pet.userId !== userId) {
      res.status(404).json({ error: 'Symptom report not found' });
      return;
    }

    await prisma.symptomReport.delete({
      where: { id }
    });

    res.json({ message: 'Symptom report deleted successfully' });
  } catch (error) {
    console.error('Delete symptom report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

type AIAnalysisResult = {
  analysis: string;
  urgencyLevel: string;
  recommendations: string[];
  suggestedActions: string[];
};

async function generateAIAnalysis(report: SymptomReportWithRelations): Promise<AIAnalysisResult> {
  const petInfo = `
Pet Information:
- Name: ${report.pet.name}
- Species: ${report.pet.species}
- Breed: ${report.pet.breed ?? 'Not specified'}
- Age: ${report.pet.age ?? 'Unknown'} years
- Weight: ${report.pet.weight ?? 'Unknown'} kg
- Gender: ${report.pet.gender ?? 'Unknown'}
- Color: ${report.pet.color ?? 'Unknown'}
- Spayed/Neutered: ${report.pet.isNeutered ? 'Yes' : 'No'}
- Medical History: ${report.pet.medicalHistory ?? 'None reported'}
- Allergies: ${report.pet.allergies ?? 'None reported'}
- Current Medications: ${report.pet.medications ?? 'None'}
- Primary Veterinarian: ${report.pet.vetInfo ?? 'Not provided'}

Reported Symptoms:
- Title: ${report.title}
- Listed Symptoms: ${report.symptoms.join(', ')}
- Severity: ${report.severity}
- Duration: ${report.duration}
- Frequency: ${report.frequency ?? 'Not specified'}
- Body Part Affected: ${report.bodyPart ?? 'Not specified'}
- Behavior Changes: ${report.behaviorChanges ?? 'None reported'}
- Appetite: ${report.appetite ?? 'Not specified'}
- Energy Level: ${report.energy ?? 'Not specified'}
- Additional Details: ${report.description ?? 'None provided'}
`;

  const aiResponse = await requestOpenAIAnalysis(petInfo);

  if (aiResponse) {
    return aiResponse;
  }

  return generateFallbackAnalysis(report);
}

async function requestOpenAIAnalysis(prompt: string): Promise<AIAnalysisResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an experienced veterinary assistant AI. Analyze pet symptoms and provide helpful, accurate information.

IMPORTANT DISCLAIMERS:
- Always emphasize that this is NOT a replacement for professional veterinary care
- For severe or emergency symptoms, strongly recommend immediate veterinary attention
- Be cautious and err on the side of recommending professional care

Provide your response in the following JSON format:
{
  "analysis": "Detailed analysis of the symptoms",
  "urgencyLevel": "low|medium|high|emergency",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "suggestedActions": ["action 1", "action 2", ...]
}

Urgency Levels:
- low: Minor issues, monitor at home
- medium: Should see vet within 24-48 hours
- high: Should see vet same day
- emergency: Immediate veterinary attention required`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API error:', response.status, errorBody);
      return null;
    }

    const completion = await response.json();
    const responseContent = completion.choices?.[0]?.message?.content;
    console.log('OpenAI API response content:', responseContent);

    if (!responseContent) {
      return null;
    }

    const parsedResponse = JSON.parse(responseContent);

    return {
      analysis: parsedResponse.analysis ?? 'Unable to generate analysis',
      urgencyLevel: parsedResponse.urgencyLevel ?? 'medium',
      recommendations: parsedResponse.recommendations ?? ['Consult with a veterinarian'],
      suggestedActions:
        parsedResponse.suggestedActions ?? ['Monitor symptoms closely', 'Contact your vet if symptoms worsen']
    };
  } catch (error) {
    console.error('AI Analysis request failed:', error);
    return null;
  }
}

function generateFallbackAnalysis(report: SymptomReportWithRelations): AIAnalysisResult {
  const severityMap: Record<string, string> = {
    emergency: 'emergency',
    severe: 'high',
    moderate: 'medium',
    mild: 'low'
  };

  const urgencyLevel = severityMap[report.severity] ?? 'medium';

  let analysis = `Based on the reported symptom "${report.title}" (${report.symptoms.join(', ')}) with ${report.severity
    } severity over ${report.duration}, `;
  const recommendations: string[] = [];
  const suggestedActions: string[] = [];

  if (urgencyLevel === 'emergency') {
    analysis +=
      'immediate veterinary attention is strongly recommended. These symptoms could indicate a serious condition requiring urgent care.';
    recommendations.push(
      'Contact emergency veterinary services immediately',
      'Do not wait for symptoms to worsen',
      'Prepare to transport your pet safely'
    );
    suggestedActions.push(
      'Call your emergency vet or animal hospital now',
      'Keep your pet calm and comfortable',
      'Have pet medical records ready'
    );
  } else if (urgencyLevel === 'high') {
    analysis +=
      'veterinary attention should be sought today. These symptoms warrant professional evaluation to prevent potential complications.';
    recommendations.push(
      'Schedule a same-day veterinary appointment',
      'Monitor symptoms closely',
      'Note any changes in behavior or symptoms'
    );
    suggestedActions.push(
      'Contact your veterinarian for same-day appointment',
      'Keep your pet calm and monitor closely',
      'Document all symptoms and changes'
    );
  } else if (urgencyLevel === 'medium') {
    analysis +=
      'a veterinary consultation within 24-48 hours is recommended. While not immediately urgent, these symptoms should be evaluated by a professional.';
    recommendations.push(
      'Schedule a veterinary appointment within 1-2 days',
      'Monitor for any worsening symptoms',
      'Keep your pet comfortable'
    );
    suggestedActions.push(
      'Call your vet to schedule an appointment',
      'Monitor eating, drinking, and bathroom habits',
      'Watch for any new symptoms'
    );
  } else {
    analysis +=
      'home monitoring is appropriate for now, but contact your vet if symptoms persist or worsen.';
    recommendations.push(
      'Monitor symptoms at home',
      'Ensure adequate rest and hydration',
      'Contact vet if symptoms persist beyond 48 hours'
    );
    suggestedActions.push(
      'Observe your pet regularly',
      'Maintain normal feeding schedule',
      'Note any changes in symptoms'
    );
  }

  return {
    analysis,
    urgencyLevel,
    recommendations,
    suggestedActions
  };
}
