import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/userAuth';

const prisma = new PrismaClient();

type OptionalNumberParseResult = { ok: true; value: number | null } | { ok: false };

const ensureUserId = (req: Request, res: Response): string | undefined => {
  const authRequest = req as AuthRequest;
  if (!authRequest.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return undefined;
  }

  return authRequest.userId;
};

const parseOptionalInteger = (value: unknown): OptionalNumberParseResult => {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null as number | null };
  }

  const parsedValue =
    typeof value === 'number' ? Math.trunc(value) : Number.parseInt(String(value), 10);

  if (Number.isNaN(parsedValue)) {
    return { ok: false as const };
  }

  return { ok: true as const, value: parsedValue };
};

const parseOptionalFloat = (value: unknown): OptionalNumberParseResult => {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null as number | null };
  }

  const parsedValue =
    typeof value === 'number' ? value : Number.parseFloat(String(value));

  if (Number.isNaN(parsedValue)) {
    return { ok: false as const };
  }

  return { ok: true as const, value: parsedValue };
};


export const createPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) {
      return;
    }

    const {
      name,
      species,
      breed,
      age,
      weight,
      gender,
      description,
      color,
      isNeutered,
      medicalHistory,
      allergies,
      medications,
      vetInfo
    } = req.body ?? {};

    if (!name || !species) {
      res.status(400).json({ error: 'Name and species are required' });
      return;
    }

    const ageResult = parseOptionalInteger(age);
    if (!ageResult.ok) {
      res.status(400).json({ error: 'Age must be a number' });
      return;
    }

    const weightResult = parseOptionalFloat(weight);
    if (!weightResult.ok) {
      res.status(400).json({ error: 'Weight must be a number' });
      return;
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed: breed ?? null,
        age: ageResult.value,
        weight: weightResult.value,
        gender: gender ?? null,
        description: description ?? null,
        color: color ?? null,
        isNeutered: Boolean(isNeutered),
        medicalHistory: medicalHistory ?? null,
        allergies: allergies ?? null,
        medications: medications ?? null,
        vetInfo: vetInfo ?? null,
        userId
      }
    });

    res.status(201).json({ message: 'Pet created successfully', pet });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) {
      return;
    }

    const pets = await prisma.pet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        symptomReports: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    res.json(pets);
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) {
      return;
    }
    const { id } = req.params;
    const pet = await prisma.pet.findFirst({
      where: {
        id,
        userId
      },
      include: {
        symptomReports: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    res.json(pet);
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ensureUserId(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;
    const pet = await prisma.pet.findFirst({
      where: { id, userId }
    });

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const { name, species, breed, age, weight, gender, description, color, isNeutered, medicalHistory, allergies, medications, vetInfo } = req.body ?? {};

    const updateData: Prisma.PetUpdateInput = {};

    if (name !== undefined) updateData.name = name;
    if (species !== undefined) updateData.species = species;
    if (breed !== undefined) updateData.breed = breed ?? null;
    if (gender !== undefined) updateData.gender = gender ?? null;
    if (description !== undefined) updateData.description = description ?? null;
    if (color !== undefined) updateData.color = color ?? null;
    if (isNeutered !== undefined) updateData.isNeutered = Boolean(isNeutered);
    if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory ?? null;
    if (allergies !== undefined) updateData.allergies = allergies ?? null;
    if (medications !== undefined) updateData.medications = medications ?? null;
    if (vetInfo !== undefined) updateData.vetInfo = vetInfo ?? null;

    if (age !== undefined) {
      const ageResult = parseOptionalInteger(age);
      if (!ageResult.ok) {
        res.status(400).json({ error: 'Age must be a number' });
        return;
      }
      updateData.age = ageResult.value;
    }

    if (weight !== undefined) {
      const weightResult = parseOptionalFloat(weight);
      if (!weightResult.ok) {
        res.status(400).json({ error: 'Weight must be a number' });
        return;
      }
      updateData.weight = weightResult.value;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Pet updated successfully', pet: updatedPet });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {

    const userId = ensureUserId(req, res);
    if (!userId) {
      return;
    }
    const { id } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id, userId }
    });
    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }
    await prisma.pet.delete({
      where: { id }
    });

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};